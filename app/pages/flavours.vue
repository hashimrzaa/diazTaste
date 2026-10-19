<script setup lang="ts">
import { gsap } from 'gsap'
import { products, formatPrice, countWord, WHATSAPP_URL } from '~/data/products'

const config = useRuntimeConfig()
useSeoMeta({
  title: 'Flavours',
  description: `All ${countWord().toLowerCase()} Dia’s Taste chutneys — ${products.map((p) => p.short).join(', ')} — in 250 g and 500 g jars. Homemade, no additives.`,
  ogUrl: `${config.public.siteUrl}/flavours`,
})
useHead({ link: [{ rel: 'canonical', href: `${config.public.siteUrl}/flavours` }] })

/* Bento layout: two hero tiles on the first row, three on the second —
   every row fills the full width. Real product photography throughout. */
const root = ref<HTMLElement>()
let ctx: gsap.Context | undefined

function tilt(e: PointerEvent) {
  if (e.pointerType !== 'mouse') return
  const el = e.currentTarget as HTMLElement
  const r = el.getBoundingClientRect()
  const img = el.querySelector('.fb__img') as HTMLElement
  gsap.to(img, { rotationY: ((e.clientX - r.left) / r.width - 0.5) * 16, rotationX: -((e.clientY - r.top) / r.height - 0.5) * 10, duration: 0.6, ease: 'power3' })
}
function untilt(e: PointerEvent) {
  gsap.to((e.currentTarget as HTMLElement).querySelector('.fb__img'), { rotationX: 0, rotationY: 0, duration: 0.8, ease: 'power3' })
}

onMounted(() => {
  ctx = gsap.context(() => {
    gsap.from('.fv__intro > *', { y: 24, opacity: 0, stagger: 0.08, duration: 1, ease: 'expo.out' })
    gsap.from('.fb__tile', { y: 60, opacity: 0, stagger: 0.08, duration: 1.1, ease: 'expo.out', delay: 0.2 })
  }, root.value)
})
onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <div ref="root" class="fv">
    <section class="container fv__intro">
      <p class="eyebrow fv__eyebrow">The flavours · {{ products.length }} chutneys · 250 g &amp; 500 g jars</p>
      <h1 class="fv__title display">{{ countWord() }} jars, <em>endless</em> plates.</h1>
      <p class="lead">Cooked in small batches with nothing added. Pick one — or all {{ countWord().toLowerCase() }}.</p>
    </section>

    <section class="container" aria-label="All chutneys">
      <ul class="fb" role="list">
        <li
          v-for="(p, i) in products"
          :key="p.slug"
          class="fb__tile"
          :class="['fb__tile--big', { 'fb__tile--wide': i === products.length - 1 && products.length % 2 === 1 }]"
          :style="{ '--t': p.color.tint, '--a': p.color.accent, '--d': p.color.deep, '--accent': p.color.accent }"
          @pointermove="tilt"
          @pointerleave="untilt"
        >
          <NuxtLink :to="`/chutney/${p.slug}`" class="fb__link" :aria-label="`${p.name} — details`" />
          <span class="fb__no display" aria-hidden="true">0{{ i + 1 }}</span>
          <div class="fb__media">
            <span class="fb__glow" aria-hidden="true" />
            <img class="fb__img" :src="p.image" :alt="`${p.name} jar`" width="400" height="530" loading="lazy" />
          </div>
          <div class="fb__body">
            <p class="eyebrow fb__eye">{{ p.urdu }}</p>
            <h2 class="fb__name display">{{ p.name }}</h2>
            <p class="fb__tag">{{ p.tagline }}</p>
            <div class="fb__meter"><TasteMeter :taste="p.taste" compact /></div>
            <div class="fb__foot">
              <span class="fb__price">{{ formatPrice(p) }}</span>
              <a :href="WHATSAPP_URL" target="_blank" rel="noopener" class="btn fb__order" :aria-label="`Order ${p.name} on WhatsApp`"><AppIcon name="whatsapp" /> Order</a>
            </div>
          </div>
        </li>
      </ul>
    </section>

    <OrderBlock />
  </div>
</template>

<style scoped>
.fv { padding-top: calc(var(--header-h) + clamp(40px, 7vw, 96px)); padding-bottom: clamp(80px, 10vw, 140px); }
.fv__intro { display: grid; gap: 16px; margin-bottom: clamp(32px, 5vw, 56px); }
.fv__eyebrow { color: var(--chili); }
.fv__title { font-size: var(--fs-d1); max-width: 13ch; }
.fv__title em { color: var(--chili); }

/* bento: 6-col grid → 2 tiles (3 cols) then 3 tiles (2 cols) */
.fb { display: grid; grid-template-columns: repeat(2, 1fr); gap: clamp(12px, 1.6vw, 20px); }
.fb__tile {
  position: relative; display: grid; border-radius: var(--radius-lg); background: var(--t); color: var(--d);
  overflow: hidden; isolation: isolate; perspective: 1000px;
  transition: transform 0.6s var(--ease-out), box-shadow 0.6s var(--ease-out);
}
.fb__tile:hover { transform: translateY(-6px); box-shadow: 0 40px 60px -40px color-mix(in srgb, var(--d) 70%, transparent); }
.fb__tile--wide { grid-column: span 2; }
.fb__tile--big { grid-column: span 1; grid-template-columns: 1fr 1fr; align-items: center; min-height: clamp(360px, 34vw, 480px); }
.fb__tile--small { grid-column: span 2; grid-template-rows: auto 1fr; }
.fb__link { position: absolute; inset: 0; z-index: 1; border-radius: inherit; }
.fb__link:focus-visible { outline: 2.5px solid var(--d); outline-offset: -6px; }
.fb__no { position: absolute; top: 18px; left: 22px; z-index: 2; font-size: 1rem; opacity: 0.6; }
.fb__media { position: relative; display: grid; place-items: center; height: 100%; min-height: 260px; padding: 28px 12px 8px; }
.fb__tile--small .fb__media { height: clamp(240px, 22vw, 320px); }
.fb__glow { position: absolute; width: 70%; aspect-ratio: 1; border-radius: 50%; background: radial-gradient(closest-side, color-mix(in srgb, var(--a) 32%, transparent), transparent); }
.fb__img { position: relative; height: 92%; max-height: 380px; width: auto; max-width: 100%; object-fit: contain; transform-style: preserve-3d; will-change: transform; }
.fb__body { position: relative; display: flex; flex-direction: column; padding: 0 clamp(18px, 2.2vw, 30px) clamp(18px, 2.2vw, 26px); }
.fb__tile--big .fb__body { padding-top: 24px; }
.fb__eye { color: var(--a); }
.fb__name { font-size: clamp(1.7rem, 2.4vw, 2.4rem); line-height: 1; margin: 6px 0 6px; }
.fb__tile--big .fb__name { font-size: clamp(2.2rem, 3.4vw, 3.4rem); }
.fb__tag { font-family: var(--font-display); font-style: italic; font-size: 1.05rem; opacity: 0.85; }
.fb__meter { margin: 16px 0 18px; --accent: var(--a); }
.fb__foot { margin-top: auto; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-top: 14px; border-top: 1px solid color-mix(in srgb, var(--d) 15%, transparent); }
.fb__price { font-weight: 600; font-size: 0.9rem; }
.fb__order { position: relative; z-index: 2; --btn-bg: var(--d); --btn-hover: var(--a); min-height: 44px; padding: 0 1.2em; }


@media (max-width: 900px) {
  .fb { grid-template-columns: 1fr; }
  .fb__tile--big, .fb__tile--wide { grid-column: span 1; }
}
@media (max-width: 600px) {
  .fb__tile--big { grid-template-columns: 1fr; min-height: 0; }
}
</style>
