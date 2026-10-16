<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const route = useRoute()
const progress = useLoadProgress()
const curtain = ref<HTMLElement>()

onMounted(async () => {
  initSmoothScroll()

  // Re-measure every ScrollTrigger once fonts land and whenever the page height
  // changes (late images, font swap, route content) so pins never drift.
  let t: ReturnType<typeof setTimeout> | undefined
  let lastH = 0
  const refresh = () => {
    clearTimeout(t)
    t = setTimeout(() => ScrollTrigger.refresh(), 150)
  }
  document.fonts?.ready.then(refresh)
  new ResizeObserver(() => {
    const h = document.getElementById('main')?.offsetHeight ?? 0
    if (Math.abs(h - lastH) > 2) {
      lastH = h
      refresh()
    }
  }).observe(document.getElementById('main')!)
  // Pages without the 3D stage only wait for fonts.
  if (route.path !== '/') {
    await document.fonts?.ready
    progress.value = 1
  }
})

/* Page transition — a warm curtain sweeps up, the route swaps underneath. */
const transition = {
  name: 'page',
  mode: 'out-in' as const,
  css: false,
  onLeave(_el: Element, done: () => void) {
    gsap.set(curtain.value!, { display: 'block' })
    gsap.fromTo(
      curtain.value!,
      { clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)' },
      {
        clipPath: 'polygon(0 0%, 100% 0%, 100% 100%, 0 100%)',
        duration: 0.75,
        ease: 'expo.inOut',
        onComplete: () => {
          // Reset scroll while the curtain covers the screen, BEFORE the next page
          // mounts — otherwise its ScrollTriggers initialise at the old position.
          getLenis()?.scrollTo(0, { immediate: true, force: true })
          window.scrollTo(0, 0)
          done()
        },
      },
    )
  },
  onEnter(_el: Element, done: () => void) {
    getLenis()?.scrollTo(0, { immediate: true, force: true })
    window.scrollTo(0, 0)
    requestAnimationFrame(() => ScrollTrigger.refresh())
    gsap.to(curtain.value!, {
      clipPath: 'polygon(0 0%, 100% 0%, 100% 0%, 0 0%)',
      duration: 0.85,
      delay: 0.1,
      ease: 'expo.inOut',
      onComplete: () => {
        gsap.set(curtain.value!, { display: 'none' })
        done()
      },
    })
  },
}
</script>

<template>
  <a class="skip-link" href="#main">Skip to content</a>
  <!-- Single backdrop behind the WebGL canvas; sections tint it on scroll. -->
  <div id="backdrop" aria-hidden="true" />
  <AppSplash />
  <AppHeader />
  <main id="main">
    <NuxtPage :transition="transition" />
  </main>
  <AppFooter />
  <ClientOnly>
    <ArViewer />
  </ClientOnly>
  <div ref="curtain" class="curtain" aria-hidden="true">
    <span class="curtain__mark"><BrandLogo /></span>
  </div>
</template>

<style>
#backdrop {
  position: fixed;
  inset: 0;
  z-index: -1;
  background: var(--cream);
  will-change: background-color;
}
.curtain {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 150;
  background: var(--chili);
}
.curtain__mark {
  position: absolute;
  left: 50%;
  top: 50%;
  display: grid;
  place-items: center;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: var(--cream);
  --logo-h: 84%;
  transform: translate(-50%, -50%);
}
</style>
