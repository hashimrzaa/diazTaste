<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { products } from '~/data/products'
import unboundedLatin from '@fontsource-variable/unbounded/files/unbounded-latin-wght-normal.woff2?url'
import manropeLatin from '@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2?url'

const route = useRoute()
const progress = useLoadProgress()
const curtain = ref<HTMLElement>()

/* Every "red" accent on the site (headings' em words, eyebrows, footer claim,
   page curtain, splash panel) follows the flavour in focus: the product on a
   product page, otherwise the hero's selected flavour. */
const heroFlavour = useHeroFlavour()
const isAdmin = computed(() => route.path.startsWith('/admin'))
watch(() => route.params.slug, (slug) => {
  const i = products.findIndex((p) => p.slug === slug)
  if (i >= 0) heroFlavour.value = i
}, { immediate: true })
const accent = computed(() => products[heroFlavour.value]?.color ?? products[0]!.color)
useHead({ htmlAttrs: { style: computed(() => `--chili: ${accent.value.accent}; --chili-deep: ${accent.value.deep}`) } })
// The splash waits for these two fonts, and the browser would otherwise only
// find them after parsing the CSS. Preloading starts them with the HTML.
useHead({
  link: [unboundedLatin, manropeLatin].map((href) => ({ rel: 'preload', as: 'font', type: 'font/woff2', href, crossorigin: '' })),
})

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
  // The splash only waits for the fonts. The 3D jar loads behind the page
  // (the hero shows its photo until then), so first paint isn't held hostage
  // by ~1 MB of three.js + model on a slow phone.
  await document.fonts?.ready
  progress.value = 1
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
  <AppSplash v-if="!isAdmin" />
  <AppHeader v-if="!isAdmin" />
  <main id="main">
    <NuxtPage :transition="transition" />
  </main>
  <AppFooter v-if="!isAdmin" />
  <PriceList v-if="!isAdmin" />
  <ClientOnly v-if="!isAdmin">
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
  transition: background-color 0.4s;
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
