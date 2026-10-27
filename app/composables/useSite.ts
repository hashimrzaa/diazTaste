import { DEFAULT_FLAVOUR } from '~/data/products'
import { defaultState, type StageState } from '~/three/state'

/** Shared target state for the WebGL stage. Scroll timelines in the home
 *  sections tween these numbers; the stage eases towards them each frame. */
export const stageState: StageState = defaultState()
export const resetStageState = () => Object.assign(stageState, defaultState())

export const useLoadProgress = () => useState('load-progress', () => 0)
/** Flavour shown in the home hero (index into products). Set from the logo menu too. */
export const useHeroFlavour = () => useState('hero-flavour', () => DEFAULT_FLAVOUR)
export const useIntroDone = () => useState('intro-done', () => false)

export interface ArState {
  open: boolean
  slug: string
}
export const useAr = () => useState<ArState>('ar', () => ({ open: false, slug: 'green' }))

export function openAr(slug = 'green') {
  const ar = useAr()
  ar.value = { open: true, slug }
}

export const isTouch = () => import.meta.client && window.matchMedia('(pointer: coarse)').matches
export const isMobile = () => import.meta.client && window.matchMedia('(max-width: 768px)').matches

/** True when the browser can create a WebGL context. Probed on a throwaway
 *  canvas so a blocked GPU (hardware acceleration off, blocklisted driver)
 *  never reaches three.js, which would otherwise throw and log errors. */
let glProbe: boolean | undefined
export function hasWebGL() {
  if (!import.meta.client) return true
  if (glProbe === undefined) {
    try {
      const c = document.createElement('canvas')
      const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null
      // A CPU-emulated GPU (SwiftShader, llvmpipe, “Microsoft Basic Render”)
      // runs the 3D scene on the main thread and freezes the page, so those
      // machines get the photo version too. Same check Nuxt's own loader uses.
      const info = gl?.getExtension('WEBGL_debug_renderer_info')
      const renderer = String((info && gl!.getParameter(info.UNMASKED_RENDERER_WEBGL)) || gl?.getParameter(gl.RENDERER) || '')
      glProbe = !!gl && !/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer)
      gl?.getExtension('WEBGL_lose_context')?.loseContext()
    } catch {
      glProbe = false
    }
  }
  return glProbe
}
/** Set when the 3D stage could not start; pages swap in still images. */
export const useNoWebGL = () => useState('no-webgl', () => false)
/** True once the 3D jar is on screen; until then the hero shows the photo. */
export const useStageReady = () => useState('stage-ready', () => false)
