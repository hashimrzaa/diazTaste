import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let lenis: Lenis | null = null
const raf = (time: number) => lenis?.raf(time * 1000)

export const prefersReducedMotion = () =>
  import.meta.client && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Lenis smooth scroll wired into GSAP's ticker so ScrollTrigger and the
 *  WebGL stage share a single frame loop. Disabled for reduced motion. */
export function initSmoothScroll() {
  if (!import.meta.client || lenis || prefersReducedMotion()) return lenis
  // Phones already scroll smoothly with their own physics; Lenis there only
  // costs a frame callback forever. ScrollTrigger works with native scroll.
  if (window.matchMedia('(pointer: coarse)').matches) return null
  lenis = new Lenis({ lerp: 0.14, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.2 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add(raf)
  gsap.ticker.lagSmoothing(0)
  return lenis
}

export const getLenis = () => lenis

export function scrollToTarget(target: string | number | HTMLElement, offset = 0) {
  if (lenis) {
    lenis.scrollTo(target, { offset, duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) })
    return
  }
  const top =
    typeof target === 'number'
      ? target
      : (typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target)!.getBoundingClientRect().top +
        window.scrollY +
        offset
  window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}

export function lockScroll(lock: boolean) {
  if (lock) lenis?.stop()
  else lenis?.start()
  document.documentElement.style.overflow = lock ? 'hidden' : ''
}
