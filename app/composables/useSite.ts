import { defaultState, type StageState } from '~/three/state'

/** Shared target state for the WebGL stage. Scroll timelines in the home
 *  sections tween these numbers; the stage eases towards them each frame. */
export const stageState: StageState = defaultState()
export const resetStageState = () => Object.assign(stageState, defaultState())

export const useLoadProgress = () => useState('load-progress', () => 0)
/** Flavour shown in the home hero (index into products). Set from the logo menu too. */
export const useHeroFlavour = () => useState('hero-flavour', () => 2) // Aloo Bukhara by default
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
