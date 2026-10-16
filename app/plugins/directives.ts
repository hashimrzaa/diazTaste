import { gsap } from 'gsap'

/** v-magnetic — element drifts toward the cursor and springs back.
 *  v-reveal   — fades/slides an element in when it enters the viewport. */
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('magnetic', {
    getSSRProps: () => ({}),
    mounted(el: HTMLElement, binding) {
      if (!window.matchMedia('(hover: hover)').matches) return
      const strength = (binding.value as number) ?? 0.35
      const xTo = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'elastic.out(1, 0.4)' })
      const yTo = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'elastic.out(1, 0.4)' })
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect()
        xTo((e.clientX - (r.left + r.width / 2)) * strength)
        yTo((e.clientY - (r.top + r.height / 2)) * strength)
      }
      const leave = () => {
        xTo(0)
        yTo(0)
      }
      el.addEventListener('pointermove', move)
      el.addEventListener('pointerleave', leave)
      ;(el as any)._mag = { move, leave }
    },
    unmounted(el: HTMLElement) {
      const m = (el as any)._mag
      if (!m) return
      el.removeEventListener('pointermove', m.move)
      el.removeEventListener('pointerleave', m.leave)
    },
  })

  nuxtApp.vueApp.directive('reveal', {
    getSSRProps: () => ({}),
    mounted(el: HTMLElement, binding) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const delay = (binding.value as number) ?? 0
      ;(el as any)._rev = gsap.from(el, {
        y: 48,
        opacity: 0,
        duration: 1.2,
        delay,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      })
    },
    unmounted(el: HTMLElement) {
      const t = (el as any)._rev as gsap.core.Tween | undefined
      t?.scrollTrigger?.kill()
      t?.kill()
    },
  })
})
