<script setup lang="ts">
import { gsap } from 'gsap'
import { products } from '~/data/products'

/* The flavour shelf (the fanned five-jar row) + a compact order card.
   Hover / first tap on a jar: it straightens and lifts, a leader line rises to
   a tag with the flavour and its ingredients, and the photo is swapped for a
   turning 3D model once that model has loaded (photo returns on leave). */
const root = ref<HTMLElement>()
const hover = ref<number | null>(null)
const touch = ref(false)
let ctx: gsap.Context | undefined

function enter(i: number) { hover.value = i }
function leave() { hover.value = null }
// phones: tap a jar → its card shows; tap the card → product page
function tap(i: number) {
  if (touch.value) { hover.value = hover.value === i ? null : i; return }
  navigateTo(`/chutney/${products[i]!.slug}`)
}

onMounted(async () => {
  touch.value = isTouch()
  ctx = gsap.context(() => {
    gsap.fromTo(stageState, { opacity: 1 }, { opacity: 0, ease: 'none', immediateRender: false, scrollTrigger: { trigger: root.value, start: 'top 92%', end: 'top 40%', scrub: true } })
    gsap.from('.fs__head > *', { y: 30, opacity: 0, stagger: 0.08, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: root.value, start: 'top 80%', once: true } })
    gsap.utils.toArray<HTMLElement>('.od__slot').forEach((el, i) => {
      gsap.fromTo(el, { y: 140 + Math.abs(i - 2) * 40 }, { y: 0, ease: 'none', scrollTrigger: { trigger: '.od__jars', start: 'top bottom', end: 'top 40%', scrub: true } })
    })
  }, root.value)
})
onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <section id="flavours" ref="root" class="fs cover" aria-labelledby="fs-title">
    <div class="container fs__head">
      <p class="eyebrow fs__eyebrow"><span>02</span> The flavours</p>
      <h2 id="fs-title" class="display fs__title">Five jars. <em>One kitchen.</em></h2>
      <p class="fs__sub">{{ touch ? 'Tap a jar to meet it — tap its card for details.' : 'Hover a jar to meet it — click for details.' }}</p>
    </div>

    <div class="od__jars" @pointerleave="(e: PointerEvent) => e.pointerType === 'mouse' && leave()">
      <div
        v-for="(p, i) in products"
        :key="p.slug"
        class="od__slot"
        :class="{ on: hover === i, dim: hover !== null && hover !== i }"
        :style="{ '--a': p.color.accent, '--d': p.color.deep, '--r': `${(i - 2) * 6}deg`, zIndex: hover === i ? 10 : 5 - Math.abs(i - 2) }"
        @pointerenter="!touch && enter(i)"
      >
        <NuxtLink :to="`/chutney/${p.slug}`" class="od__tag" :tabindex="hover === i ? 0 : -1">
          <span class="od__tag-name display">{{ p.short }}</span>
          <span class="od__tag-tag">{{ p.tagline }}</span>
          <span class="od__tag-ing">{{ p.ingredients.slice(0, 4).join(' · ') }}</span>
          <span class="od__tag-cta">View details →</span>
        </NuxtLink>
        <span class="od__line" aria-hidden="true" />
        <button class="od__jar" :aria-label="`${p.name} — view details`" @click="tap(i)">
          <span class="od__shadow" aria-hidden="true" />
          <img :src="p.image" alt="" width="300" height="400" loading="lazy" />
        </button>
      </div>
    </div>

    <OrderBlock />
  </section>
</template>

<style scoped>
.fs { background: var(--cream); padding: clamp(56px, 7vw, 96px) 0; overflow-x: clip; }
.fs__head { text-align: center; display: grid; justify-items: center; gap: 12px; }
.fs__eyebrow { display: flex; gap: 12px; color: var(--ink-2); }
.fs__eyebrow span { color: var(--chili); }
.fs__title { font-size: var(--fs-d1); line-height: 0.95; }
.fs__title em { color: var(--chili); }
.fs__sub { color: var(--ink-3); font-size: 0.95rem; }

.od__jars { position: relative; display: flex; justify-content: center; align-items: flex-end; padding-top: 250px; }
.od__slot { position: relative; width: clamp(130px, 19vw, 290px); margin: 0 -1.4vw; transition: opacity 0.4s; }
.od__slot.dim { opacity: 0.5; }
.od__jar { position: relative; display: block; width: 100%; aspect-ratio: 3 / 4; cursor: pointer; transform: rotate(var(--r)); transition: transform 0.6s var(--ease-out); will-change: transform; }
.od__slot.on .od__jar { transform: translateY(-46px) rotate(0deg) scale(1.08); }
.od__slot.on .od__shadow { transform: scale(0.8); opacity: 0.6; }
.od__jar img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; object-position: bottom; transition: opacity 0.3s; }
.od__shadow { transition: transform 0.6s var(--ease-out), opacity 0.6s; position: absolute; left: 14%; right: 14%; bottom: -10px; height: 26px; border-radius: 50%; background: radial-gradient(closest-side, rgba(30, 15, 10, 0.32), transparent); }
.od__line { position: absolute; left: 50%; bottom: calc(100% - 2px); width: 1.5px; height: 0; background: var(--a); transform: translateX(-50%); transition: height 0.45s var(--ease-out); }
.od__slot.on .od__line { height: 64px; }
.od__tag {
  position: absolute; left: 50%; bottom: calc(100% + 40px); transform: translate(-50%, 10px);
  display: grid; gap: 3px; width: max-content; max-width: 240px; padding: 12px 16px; border-radius: 16px; text-align: center;
  background: var(--paper); box-shadow: 0 18px 36px -20px rgba(30, 15, 10, 0.55), inset 0 0 0 1px var(--line);
  opacity: 0; pointer-events: none; transition: opacity 0.3s, transform 0.45s var(--ease-out); color: inherit;
}
.od__slot.on .od__tag { opacity: 1; transform: translate(-50%, -22px); pointer-events: auto; }
.od__tag:hover .od__tag-cta { color: var(--a); }
.od__tag-name { font-size: 1.5rem; line-height: 1; color: var(--d); }
.od__tag-tag { font-size: 0.82rem; font-style: italic; color: var(--a); }
.od__tag-ing { font-size: 0.74rem; color: var(--ink-3); }
.od__tag-cta { margin-top: 4px; font-size: 0.74rem; font-weight: 600; color: var(--d); }

@media (max-width: 640px) {
  .od__slot { width: 30vw; margin: 0 -6vw; }
  .od__jars { padding-top: 230px; }
  .od__tag { max-width: 190px; padding: 10px 12px; }
}
</style>
