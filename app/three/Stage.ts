import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { createIngredientSets, type IngredientSet } from './ingredients'

import { defaultState, type StageState } from './state'
export { defaultState, type StageState }

interface Jar {
  root: THREE.Group
  spinner: THREE.Group
  capPivot: THREE.Group
  shadow: THREE.Mesh
  materials: THREE.Material[]
  hover: number
}

const JAR_H = 0.17
const FOV = 26
const LINE_GAP = 0.112

const damp = (cur: number, target: number, lambda: number, dt: number) =>
  cur + (target - cur) * (1 - Math.exp(-lambda * dt))

export class Stage {
  private cur: StageState = defaultState()

  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera = new THREE.PerspectiveCamera(FOV, 1, 0.01, 10)
  private rig = new THREE.Group()
  private jars: Jar[] = []
  private ingredientSets: IngredientSet[] = []
  private timer = new THREE.Timer()
  private pointer = new THREE.Vector2()
  private pointerDamped = new THREE.Vector2()
  private hoverIndex = -1
  private size = { w: 1, h: 1 }
  private disposed = false
  private lowPower: boolean
  private tmp = new THREE.Vector3()

  /** screen-space anchor (px) under each jar — used by DOM labels in the lineup */
  readonly anchors: { x: number; y: number; visible: boolean }[] = []
  onHover?: (index: number) => void

  constructor(
    private canvas: HTMLCanvasElement,
    private models: { slug: string; url: string }[],
    /** shared target object — scroll timelines write here */
    readonly state: StageState,
  ) {
    Object.assign(this.cur, state)
    this.lowPower = matchMedia('(max-width: 768px), (pointer: coarse)').matches
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !this.lowPower,
      powerPreference: 'high-performance',
    })
    // Cap the pixel ratio: 2× on a 1440p laptop is 4× the fragment work of 1× for
    // a glossy, transparent jar + ~100 ingredient meshes, and reads as jank.
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, this.lowPower ? 2 : 1.5))
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 0.92

    const pmrem = new THREE.PMREMGenerator(this.renderer)
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    this.scene.environmentIntensity = 0.55
    pmrem.dispose()

    // Soft, true-to-colour lighting — enough shaping without washing the labels out.
    const key = new THREE.DirectionalLight('#fff4e6', 1.05)
    key.position.set(0.6, 1, 0.8)
    const rim = new THREE.DirectionalLight('#ffd9b0', 0.5)
    rim.position.set(-0.8, 0.4, -0.6)
    this.scene.add(key, rim, new THREE.AmbientLight('#ffffff', 0.12))

    this.scene.add(this.rig)
    this.camera.position.set(0, 0, 0.62)
    this.models.forEach(() => this.anchors.push({ x: 0, y: 0, visible: false }))

    window.addEventListener('pointermove', this.onPointer, { passive: true })
  }

  /** Loads the FIRST model (that is what the splash waits for), starts
   *  rendering, then streams the remaining models in the background in order. */
  async load(onProgress?: (p: number) => void, firstIndex = 0) {
    const fi = Math.min(Math.max(0, firstIndex), this.models.length - 1)
    const draco = new DRACOLoader().setDecoderPath('/draco/')
    const loader = new GLTFLoader().setDRACOLoader(draco)
    const shadowTex = this.makeShadowTexture()
    const fetchOne = (url: string, report?: (p: number) => void) =>
      new Promise<THREE.Group>((resolve, reject) =>
        loader.load(url, (g) => resolve(g.scene), (e) => { if (e.total && report) report(Math.min(0.99, e.loaded / e.total)) }, reject),
      )

    const first = await fetchOne(this.models[fi]!.url, onProgress)
    if (this.disposed) return
    this.jars[fi] = this.prepareJar(first, shadowTex)
    this.ingredientSets = createIngredientSets(this.models.map((m) => m.slug))
    this.ingredientSets.forEach((s) => this.rig.add(s.group))
    this.renderer.compile(this.scene, this.camera)
    this.resize()
    this.renderer.setAnimationLoop(this.tick)
    onProgress?.(1)

    for (const [i, m] of this.models.entries()) {
      if (i === fi) continue
      try {
        const g = await fetchOne(m.url)
        if (this.disposed) return
        this.jars[i] = this.prepareJar(g, shadowTex)
      } catch (e) {
        console.warn('[stage] model failed', m.url, e)
        break
      }
    }
    draco.dispose()
  }


  private prepareJar(model: THREE.Group, shadowTex: THREE.Texture): Jar {
    const root = new THREE.Group()
    const spinner = new THREE.Group()
    model.position.y = -JAR_H / 2
    spinner.add(model)
    root.add(spinner)

    const materials: THREE.Material[] = []
    const aniso = this.renderer.capabilities.getMaxAnisotropy()
    const sharpen = (m: THREE.MeshStandardMaterial) => {
      for (const t of [m.map, m.normalMap, m.roughnessMap, m.metalnessMap, m.aoMap] as (THREE.Texture | null)[]) {
        if (t) t.anisotropy = aniso
      }
    }
    let cap: THREE.Object3D | undefined
    model.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      const name = mesh.name || mesh.parent?.name || ''
      const src = mesh.material as THREE.MeshPhysicalMaterial
      let mat: THREE.Material
      if (/jar_body|pet/.test(name) || src.name === 'pet_clear') {
        // Clear PET — a thin, glossy, near-colourless plastic.
        mat = new THREE.MeshPhysicalMaterial({
          color: '#ffffff',
          transparent: true,
          opacity: 0.18,
          roughness: 0.05,
          metalness: 0,
          ior: 1.46,
          clearcoat: 0.6,
          clearcoatRoughness: 0.06,
          envMapIntensity: 1.3,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
        mesh.renderOrder = 10
        src.dispose()
      } else if (/cap/.test(name) || src.name === 'cap_black') {
        // Keep the model's own cap material (ridges + sheen) — just calm the shine.
        src.envMapIntensity = 0.7
        src.clearcoat = 0.3
        src.clearcoatRoughness = 0.4
        src.side = THREE.DoubleSide
        sharpen(src)
        mat = src
        cap = mesh
      } else {
        // Chutney & label — keep the GLB's own PBR (normal/roughness maps) and
        // only a whisper of sheen, so the printed label stays legible, not blown out.
        const isLabel = /label/.test(name)
        src.clearcoat = isLabel ? 0.12 : 0.35
        src.clearcoatRoughness = isLabel ? 0.3 : 0.28
        src.envMapIntensity = isLabel ? 0.4 : 0.65
        if (src.normalMap) src.normalScale.setScalar(isLabel ? 0.5 : 1.0)
        sharpen(src)
        mat = src
      }
      mesh.material = mat
      materials.push(mat)
    })

    // Re-parent the cap onto a pivot at its own centre so it can lift, spin and lean.
    const capPivot = new THREE.Group()
    if (cap) {
      model.updateMatrixWorld(true)
      const box = new THREE.Box3().setFromObject(cap)
      const c = box.getCenter(new THREE.Vector3())
      model.worldToLocal(c)
      capPivot.position.copy(c)
      model.add(capPivot)
      capPivot.attach(cap)
    }

    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(0.2, 0.2),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.5 }),
    )
    shadow.rotation.x = -Math.PI / 2
    shadow.position.y = -JAR_H / 2 - 0.004
    root.add(shadow)
    materials.push(shadow.material as THREE.Material)

    this.rig.add(root)
    return { root, spinner, capPivot, shadow, materials, hover: 0 }
  }

  private makeShadowTexture() {
    const c = document.createElement('canvas')
    c.width = c.height = 128
    const g = c.getContext('2d')!
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64)
    grad.addColorStop(0, 'rgba(30,15,10,0.55)')
    grad.addColorStop(0.45, 'rgba(30,15,10,0.22)')
    grad.addColorStop(1, 'rgba(30,15,10,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, 128, 128)
    return new THREE.CanvasTexture(c)
  }

  private onPointer = (e: PointerEvent) => {
    this.pointer.set((e.clientX / this.size.w) * 2 - 1, -(e.clientY / this.size.h) * 2 + 1)
    this.pointerPx.set(e.clientX, e.clientY)
  }
  private pointerPx = new THREE.Vector2(-1e4, -1e4)

  resize() {
    // Measure the canvas itself (not window.inner*) so buffer and CSS box match
    // exactly, including on phones where the URL bar changes the visual viewport.
    const w = this.canvas.clientWidth || window.innerWidth
    const h = this.canvas.clientHeight || window.innerHeight
    this.size = { w, h }
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
  }

  /** Expose the hero jar's real on-screen centre + height as CSS vars, so DOM
   *  decoration (the disc behind it) tracks the 3D jar exactly at every size. */
  private jarBox = { h: 0, x: 0, y: 0 }
  private publishJarBox(view: { w: number; h: number }, scale: number) {
    const h = (this.size.h * JAR_H * scale) / view.h
    const x = this.size.w * (0.5 + this.rig.position.x / view.w)
    const y = this.size.h * (0.5 - (this.rig.position.y - this.camera.position.y) / view.h)
    const b = this.jarBox
    if (Math.abs(b.h - h) < 0.3 && Math.abs(b.x - x) < 0.3 && Math.abs(b.y - y) < 0.3) return
    this.jarBox = { h, x, y }
    const st = document.documentElement.style
    st.setProperty('--jar-h', `${h.toFixed(1)}px`)
    st.setProperty('--jar-x', `${x.toFixed(1)}px`)
    st.setProperty('--jar-y', `${y.toFixed(1)}px`)
  }

  /** Visible world size at the jar plane for a given camera distance. */
  private viewSize(dist: number) {
    const h = 2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * dist
    return { w: h * this.camera.aspect, h }
  }

  private tick = () => {
    if (this.disposed) return
    this.timer.update()
    const dt = Math.min(this.timer.getDelta(), 1 / 20)
    const t = this.timer.getElapsed()
    const S = this.state
    const C = this.cur

    // flavours switch as a cut (behind a quick fade), never by flying through other jars
    C.flavour = S.flavour
    for (const k of Object.keys(S) as (keyof StageState)[]) {
      C[k] = damp(C[k], S[k], k === 'flavour' || k === 'lineup' ? 5 : 7, dt)
    }
    this.pointerDamped.lerp(this.pointer, 1 - Math.exp(-3.5 * dt))

    this.canvas.style.opacity = String(Math.min(1, Math.max(0, C.opacity)))
    if (C.opacity < 0.01 && S.opacity < 0.01) {
      this.canvas.style.visibility = 'hidden'
      return
    }
    this.canvas.style.visibility = 'visible'

    // --- camera: frame one jar, or the whole lineup ---
    const portrait = this.camera.aspect < 0.9
    const singleDist = portrait ? 0.62 / Math.max(0.62, this.camera.aspect * 1.1) : 0.62
    const lineW = LINE_GAP * 4 + 0.14
    const lineDist = (lineW / (portrait ? 0.92 : 0.62)) / this.camera.aspect / (2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)))
    // Saturate early: the carousel parks neighbours far off-screen, so even a 10%
    // shortfall in `lineup` would leave a visible staircase. Past ~60% the row is
    // treated as fully formed (level, centred, correctly framed).
    const Lu = THREE.MathUtils.clamp(C.lineup / 0.6, 0, 1)
    const L = Lu * Lu * (3 - 2 * Lu)
    const dist = THREE.MathUtils.lerp(singleDist * (1 - C.push * 0.32), Math.max(singleDist, lineDist), L)
    const view = this.viewSize(dist)
    this.camera.position.set(C.pan * (portrait ? 0.015 : 0.06) * L, 0.02 * L, dist)
    this.camera.lookAt(C.pan * 0.02 * L, 0, 0)

    // --- rig: placement + pointer parallax ---
    this.rig.position.set(C.x * view.w * (1 - L), C.y * view.h * (1 - L) - view.h * (portrait ? 0.03 : 0.09) * L, 0)
    this.rig.rotation.y = this.pointerDamped.x * 0.18
    this.rig.rotation.x = -this.pointerDamped.y * 0.08 + (portrait ? 0 : 0.05) * L
    this.rig.scale.setScalar(THREE.MathUtils.lerp(C.scale, 1, L))
    this.publishJarBox(view, THREE.MathUtils.lerp(C.scale, 1, L))

    // --- lineup hover via screen-space hit testing ---
    let hover = -1
    if (L > 0.85) {
      let best = 1e9
      this.jars.forEach((_, i) => {
        const a = this.anchors[i]!
        const dx = this.pointerPx.x - a.x
        const top = a.y - (this.size.h * (JAR_H / view.h)) * 1.05
        if (this.pointerPx.y > top && this.pointerPx.y < a.y + 20 && Math.abs(dx) < best && Math.abs(dx) < (this.size.w * (0.05 / view.w))) {
          best = Math.abs(dx)
          hover = i
        }
      })
    }
    if (hover !== this.hoverIndex) {
      this.hoverIndex = hover
      this.onHover?.(hover)
    }

    // --- jars ---
    const n = this.models.length
    this.jars.forEach((jar, i) => {
      const d = i - C.flavour
      const ad = Math.abs(d)

      // single-jar carousel: next flavour rises from below while spinning in
      const sx = d * 0.05
      // far enough (in rig space) that neighbours are fully off-screen, whatever the rig's scale/offset
      const sy = -d * ((view.h * (0.5 + Math.abs(C.y)) + JAR_H * 0.75) / Math.max(C.scale, 0.3))
      const sz = -ad * 0.12
      // Gentle quarter-turn as a jar rises in — a full spin per jar reads as chaos
      // when several are in flight during a fast scroll.
      const sRot = d * 0.9
      // lineup: gentle arc facing the camera
      const li = i - (n - 1) / 2
      const lx = li * LINE_GAP
      const lz = portrait ? 0 : -Math.abs(li) * 0.03
      const lRot = -li * (portrait ? 0.08 : 0.16)

      jar.hover = damp(jar.hover, hover === i ? 1 : 0, 9, dt)
      const bob = Math.sin(t * 1.3 + i) * 0.004 * C.idle

      jar.root.position.set(
        THREE.MathUtils.lerp(sx, lx, L),
        THREE.MathUtils.lerp(sy, 0, L) + bob + jar.hover * 0.018,
        THREE.MathUtils.lerp(sz, lz, L),
      )
      const idleSpin = Math.sin(t * 0.45 + i) * 0.1 * C.idle * (1 - L)
      jar.spinner.rotation.y = THREE.MathUtils.lerp(sRot + C.spin + idleSpin, lRot + jar.hover * 0.6, L)
      jar.root.rotation.z = THREE.MathUtils.lerp(d * 0.16 + C.tilt, 0, L)

      // cap: unscrew (spin + lift), then lean
      const cap = C.cap * (1 - L)
      jar.capPivot.rotation.y = -cap * Math.PI * 1.75
      jar.capPivot.position.y = (jar.capPivot.userData.y0 ??= jar.capPivot.position.y) + cap * 0.06 + Math.sin(t * 1.6) * 0.003 * cap
      jar.capPivot.rotation.z = cap * 0.28
      jar.capPivot.position.x = cap * 0.014

      const visible = L > 0.02 || ad < 0.5
      jar.root.visible = visible
      jar.shadow.visible = visible
      ;(jar.shadow.material as THREE.MeshBasicMaterial).opacity = (0.35 + 0.25 * L) * Math.max(0, 1 - ad * (1 - L) * 1.4)
      jar.shadow.scale.setScalar(1 - bob * 10)

      // DOM anchors (just below each jar's base)
      this.tmp.set(0, -JAR_H / 2 - 0.012, 0).applyMatrix4(jar.root.matrixWorld)
      this.tmp.project(this.camera)
      const a = this.anchors[i]!
      a.x = (this.tmp.x * 0.5 + 0.5) * this.size.w
      a.y = (-this.tmp.y * 0.5 + 0.5) * this.size.h
      a.visible = visible
    })

    // --- ingredient clouds ---
    this.ingredientSets.forEach((set, si) => {
      const vis = C.ingredients * Math.max(0, 1 - Math.abs(si - C.flavour) * 1.7) * (1 - L)
      set.group.visible = vis > 0.01
      if (!set.group.visible) return
      const spread = 1 + C.spread * 1.1
      const mouthY = JAR_H / 2 - 0.012
      set.items.forEach((it, ii) => {
        const k = Math.sin(t * it.speed + it.phase)
        const cx = it.base.x * spread + this.pointerDamped.x * 0.012 * it.depth
        const cy = it.base.y * (1 + C.spread * 0.6) + k * 0.006 + this.pointerDamped.y * 0.01 * it.depth
        const cz = it.base.z * spread
        // staggered drop into the jar mouth along a small arc
        const m0 = THREE.MathUtils.clamp(C.mix * 1.7 - (ii / set.items.length) * 0.7, 0, 1)
        const m = m0 * m0 * (3 - 2 * m0)
        const arc = Math.sin(m * Math.PI) * 0.06
        it.mesh.position.set(
          THREE.MathUtils.lerp(cx, 0, m),
          THREE.MathUtils.lerp(cy, mouthY, m) + arc,
          THREE.MathUtils.lerp(cz, 0, m),
        )
        it.mesh.rotateOnAxis(it.axis, dt * it.speed * (0.8 + m * 3))
        it.mesh.scale.setScalar(it.scale * vis * (1 - m * 0.9))
        it.mesh.visible = m < 0.985
      })
    })

    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    this.disposed = true
    window.removeEventListener('pointermove', this.onPointer)
    this.renderer.setAnimationLoop(null)
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.isMesh) {
        m.geometry?.dispose()
        const mats = Array.isArray(m.material) ? m.material : [m.material]
        mats.forEach((mat) => {
          ;(mat as THREE.MeshStandardMaterial).map?.dispose()
          mat.dispose()
        })
      }
    })
    this.scene.environment?.dispose()
    this.renderer.dispose()
  }
}
