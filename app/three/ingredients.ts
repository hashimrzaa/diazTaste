import * as THREE from 'three'

/* Procedural ingredients that orbit the jar — one set per flavour.
   All sizes are in metres (the jar is 17 cm tall). */

export const rng = (seed: number) => () => {
  seed |= 0
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

/** A tube whose radius varies along the curve (chillies, pods, stems). */
function taperedTube(curve: THREE.Curve<THREE.Vector3>, radius: (t: number) => number, seg = 32, radial = 12) {
  const frames = curve.computeFrenetFrames(seg, false)
  const pos: number[] = []
  const uv: number[] = []
  const idx: number[] = []
  const p = new THREE.Vector3()
  for (let i = 0; i <= seg; i++) {
    const t = i / seg
    curve.getPointAt(t, p)
    const r = radius(t)
    const N = frames.normals[i]!
    const B = frames.binormals[i]!
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2
      const s = Math.sin(a)
      const c = -Math.cos(a)
      pos.push(p.x + r * (c * N.x + s * B.x), p.y + r * (c * N.y + s * B.y), p.z + r * (c * N.z + s * B.z))
      uv.push(j / radial, t)
    }
  }
  for (let i = 0; i < seg; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * (radial + 1) + j
      const b = a + radial + 1
      idx.push(a, b, a + 1, b, b + 1, a + 1)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  g.center()
  return g
}

/** Wrinkle a sphere-ish geometry (dried fruit). */
function wrinkle(g: THREE.BufferGeometry, amount: number, freq: number, seed = 1) {
  const p = g.attributes.position as THREE.BufferAttribute
  const v = new THREE.Vector3()
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i)
    const n =
      Math.sin(v.x * freq + seed) * Math.cos(v.y * freq * 1.3 + seed * 2) +
      Math.sin(v.z * freq * 1.7 - seed) * 0.6 +
      Math.sin((v.x + v.y) * freq * 2.4) * 0.3
    v.multiplyScalar(1 + n * amount)
    p.setXYZ(i, v.x, v.y, v.z)
  }
  g.computeVertexNormals()
  return g
}

const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}

/* ---------- geometries (built once, shared) ---------- */
function buildGeometries() {
  const chiliCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.006, 0.025, 0.002),
    new THREE.Vector3(0.004, 0.052, 0.004),
    new THREE.Vector3(-0.008, 0.074, 0),
    new THREE.Vector3(-0.02, 0.086, -0.002),
  ])
  const chili = taperedTube(chiliCurve, (t) => 0.0068 * Math.sqrt(smooth(0, 0.07, t)) * (1 - t * 0.88) + 0.0004)

  const stem = taperedTube(
    new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(-0.002, -0.006, 0), new THREE.Vector3(0.002, -0.012, 0)]),
    (t) => 0.0016 + (1 - t) * 0.0012,
    8,
    8,
  )

  const leafShape = new THREE.Shape()
  leafShape.moveTo(0, 0)
  leafShape.bezierCurveTo(0.016, 0.01, 0.017, 0.034, 0, 0.052)
  leafShape.bezierCurveTo(-0.017, 0.034, -0.016, 0.01, 0, 0)
  const leaf = new THREE.ShapeGeometry(leafShape, 16)
  {
    const p = leaf.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i)
      const y = p.getY(i)
      p.setZ(i, -x * x * 18 + Math.sin(y * 50) * 0.0018 + y * y * 2.2)
    }
    leaf.computeVertexNormals()
    leaf.center()
  }

  const seed = new THREE.SphereGeometry(0.0034, 10, 8)
  const cumin = new THREE.SphereGeometry(0.0024, 8, 6).scale(1, 2.6, 1)

  const clove = new THREE.LatheGeometry(
    [
      [0, 0],
      [0.006, 0.0015],
      [0.0095, 0.006],
      [0.0105, 0.012],
      [0.0088, 0.018],
      [0.005, 0.0235],
      [0.0015, 0.027],
      [0, 0.0285],
    ].map(([x, y]) => new THREE.Vector2(x, y)),
    18,
  )
  clove.scale(1, 1, 0.68)
  {
    // bend into a crescent, like a real clove
    const p = clove.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i) / 0.0285
      p.setX(i, p.getX(i) + y * y * 0.007)
    }
    clove.computeVertexNormals()
    clove.center()
  }

  const plum = wrinkle(new THREE.SphereGeometry(0.0115, 28, 20).scale(1, 0.86, 1), 0.06, 260, 3)
  const date = wrinkle(new THREE.SphereGeometry(0.0085, 26, 22).scale(1, 2, 1), 0.05, 320, 7)

  const pod = taperedTube(
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.018, 0.012, 0),
      new THREE.Vector3(0.04, 0.016, 0.002),
      new THREE.Vector3(0.062, 0.01, 0),
      new THREE.Vector3(0.078, -0.002, 0),
    ]),
    (t) => 0.0062 * (0.8 + 0.2 * Math.abs(Math.sin(t * Math.PI * 4.5))) * Math.sqrt(smooth(0, 0.06, t)) * Math.sqrt(smooth(1, 0.92, t)) + 0.0006,
    48,
    12,
  )

  const lemon = new THREE.CylinderGeometry(0.018, 0.018, 0.0045, 40, 1)
  const flake = new THREE.IcosahedronGeometry(0.0035, 0).scale(1.4, 0.35, 1)

  return { chili, stem, leaf, seed, cumin, clove, plum, date, pod, lemon, flake }
}

function lemonFaceTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const g = c.getContext('2d')!
  g.fillStyle = '#f2d23c'
  g.fillRect(0, 0, 256, 256)
  g.fillStyle = '#fbf2c4'
  g.beginPath()
  g.arc(128, 128, 116, 0, Math.PI * 2)
  g.fill()
  for (let i = 0; i < 10; i++) {
    const a0 = (i / 10) * Math.PI * 2 + 0.05
    const a1 = ((i + 1) / 10) * Math.PI * 2 - 0.05
    const grad = g.createRadialGradient(128, 128, 10, 128, 128, 104)
    grad.addColorStop(0, '#fbe98a')
    grad.addColorStop(1, '#f5d244')
    g.fillStyle = grad
    g.beginPath()
    g.moveTo(128 + Math.cos((a0 + a1) / 2) * 10, 128 + Math.sin((a0 + a1) / 2) * 10)
    g.arc(128, 128, 104, a0, a1)
    g.closePath()
    g.fill()
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/* ---------- materials ---------- */
// MeshStandardMaterial (not Physical): visually near-identical at this size, far cheaper per pixel
const glossy = (color: string, rough = 0.3) =>
  new THREE.MeshStandardMaterial({ color, roughness: rough * 0.8, envMapIntensity: 1.1 })
const matte = (color: string, rough = 0.7, side: THREE.Side = THREE.FrontSide) =>
  new THREE.MeshStandardMaterial({ color, roughness: rough, side, envMapIntensity: 0.9 })

type Piece = { geo: keyof ReturnType<typeof buildGeometries>; mat: THREE.Material; stem?: boolean; weight: number }

export interface IngredientItem {
  mesh: THREE.Object3D
  base: THREE.Vector3
  axis: THREE.Vector3
  speed: number
  phase: number
  scale: number
  depth: number
}

export interface IngredientSet {
  group: THREE.Group
  items: IngredientItem[]
}

/** Build one ingredient cloud per flavour, in the same order as products[]. */
export function createIngredientSets(slugs: string[]): IngredientSet[] {
  const G = buildGeometries()
  const M = {
    red: glossy('#c3141b', 0.22),
    redDark: glossy('#7d0c0c', 0.3),
    green: glossy('#3f8a1c', 0.25),
    stem: matte('#4d6b1e', 0.6),
    mint: matte('#4f9a2a', 0.5, THREE.DoubleSide),
    coriander: matte('#2f7a22', 0.55, THREE.DoubleSide),
    tamarindLeaf: matte('#5c8c2a', 0.55, THREE.DoubleSide),
    seed: matte('#c39a5c', 0.75),
    cumin: matte('#6e4a26', 0.8),
    fennel: matte('#8a9a52', 0.75),
    clove: new THREE.MeshStandardMaterial({ color: '#e9dcc6', roughness: 0.5, envMapIntensity: 0.8 }),
    plum: glossy('#3d0b22', 0.28),
    date: glossy('#4a1a08', 0.3),
    pod: matte('#8a5a2c', 0.85),
    flake: matte('#b11a16', 0.6),
    lemonSide: glossy('#f2cf2a', 0.35),
    lemonFace: new THREE.MeshStandardMaterial({ map: lemonFaceTexture(), roughness: 0.4 }),
  }

  const recipes: Record<string, Piece[]> = {
    green: [
      { geo: 'leaf', mat: M.mint, weight: 6 },
      { geo: 'leaf', mat: M.coriander, weight: 3 },
      { geo: 'chili', mat: M.green, stem: true, weight: 3 },
      { geo: 'clove', mat: M.clove, weight: 1 },
      { geo: 'lemon', mat: M.lemonSide, weight: 2 },
      { geo: 'cumin', mat: M.cumin, weight: 4 },
    ],
    garlic: [
      { geo: 'clove', mat: M.clove, weight: 6 },
      { geo: 'chili', mat: M.red, stem: true, weight: 5 },
      { geo: 'chili', mat: M.redDark, stem: true, weight: 2 },
      { geo: 'flake', mat: M.flake, weight: 6 },
    ],
    'aloo-bukhara': [
      { geo: 'plum', mat: M.plum, weight: 6 },
      { geo: 'chili', mat: M.red, stem: true, weight: 3 },
      { geo: 'seed', mat: M.seed, weight: 4 },
      { geo: 'cumin', mat: M.fennel, weight: 4 },
    ],
    imli: [
      { geo: 'pod', mat: M.pod, weight: 5 },
      { geo: 'leaf', mat: M.tamarindLeaf, weight: 3 },
      { geo: 'chili', mat: M.redDark, stem: true, weight: 3 },
      { geo: 'clove', mat: M.clove, weight: 2 },
      { geo: 'cumin', mat: M.cumin, weight: 4 },
    ],
    khajoor: [
      { geo: 'date', mat: M.date, weight: 6 },
      { geo: 'seed', mat: M.seed, weight: 5 },
      { geo: 'flake', mat: M.flake, weight: 4 },
      { geo: 'chili', mat: M.red, stem: true, weight: 2 },
    ],
  }

  return slugs.map((slug, si) => {
    const rand = rng(1337 + si * 97)
    const group = new THREE.Group()
    const items: IngredientItem[] = []
    const recipe = recipes[slug] ?? recipes.green!
    const bag: Piece[] = recipe.flatMap((r) => Array.from({ length: r.weight }, () => r))
    const count = 12

    for (let i = 0; i < count; i++) {
      const piece = bag[Math.floor(rand() * bag.length)]!
      let mesh: THREE.Object3D
      if (piece.geo === 'lemon') {
        mesh = new THREE.Mesh(G.lemon, [M.lemonSide, M.lemonFace, M.lemonFace])
      } else {
        mesh = new THREE.Mesh(G[piece.geo], piece.mat)
        if (piece.stem) {
          const s = new THREE.Mesh(G.stem, M.stem)
          s.position.set(0.004, -0.045, 0)
          mesh.add(s)
        }
      }

      // Golden-angle spiral on a shell around the jar, kept out of the jar's silhouette.
      const t = (i + 0.5) / count
      const theta = i * 2.39996 + rand() * 0.4
      const y = (t - 0.5) * 0.3
      let r = 0.11 + rand() * 0.11
      const x = Math.cos(theta) * r
      const z = Math.sin(theta) * r * 0.9
      if (Math.abs(x) < 0.07 && z > -0.02) r += 0.05
      const base = new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r * 0.9 - 0.02)
      if (Math.abs(base.x) < 0.06) base.x += Math.sign(base.x || 1) * 0.06

      mesh.rotation.set(rand() * 6.28, rand() * 6.28, rand() * 6.28)
      const scale = (piece.geo === 'leaf' ? 0.7 : 0.85) + rand() * 0.5
      mesh.scale.setScalar(scale)
      group.add(mesh)
      items.push({
        mesh,
        base,
        axis: new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize(),
        speed: 0.15 + rand() * 0.35,
        phase: rand() * Math.PI * 2,
        scale,
        depth: 0.4 + rand() * 0.8,
      })
    }
    return { group, items }
  })
}
