<script setup lang="ts">
import { gsap } from 'gsap'
import { products, getProduct, formatPrice, WHATSAPP_URL, WHATSAPP_DISPLAY, WHATSAPP_TEL } from '~/data/products'

const route = useRoute()
const config = useRuntimeConfig()
const product = computed(() => getProduct(String(route.params.slug)))
if (!product.value) throw createError({ statusCode: 404, statusMessage: 'Chutney not found', fatal: true })
const p = computed(() => product.value!)
const others = computed(() => products.filter((x) => x.slug !== p.value.slug))
const url = computed(() => `${config.public.siteUrl}/chutney/${p.value.slug}`)

useSeoMeta({
  title: () => p.value.name,
  description: () => `${p.value.name} by Dia’s Taste — ${p.value.tagline} 500 g, homemade, no additives.`,
  ogTitle: () => `${p.value.name} · Dia’s Taste`,
  ogDescription: () => p.value.tagline,
  ogUrl: () => url.value,
  ogImage: () => `${config.public.siteUrl}${p.value.image}`,
})
useHead({
  link: [{ rel: 'canonical', href: url }],
  script: [{
    type: 'application/ld+json',
    innerHTML: () => JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: p.value.name,
      description: p.value.description,
      image: `${config.public.siteUrl}${p.value.image}`,
      brand: { '@type': 'Brand', name: 'Dia’s Taste' },
      ...(p.value.price != null && { offers: { '@type': 'Offer', price: p.value.price, priceCurrency: 'PKR', availability: 'https://schema.org/InStock', url: url.value } }),
    }),
  }],
})

/* Photo first (it is the real thing); 3D is an optional second view —
   rotate only, no zoom, label facing you. AR only where the device can do it. */
const view = ref<'photo' | '3d'>('photo')
const mv = ref<any>()
const ready = ref(false)
const canAR = ref(false)
// Returning from native AR (Scene Viewer / Quick Look) can leave model-viewer
// mis-sized; rebuild it fresh the moment the page is visible again.
const arKey = ref(0)
let inAr = false
function launchAr() {
  inAr = true
  mv.value?.activateAR?.()
}
function backFromAr() {
  if (!inAr || document.visibilityState !== 'visible') return
  inAr = false
  arKey.value++
}
function onArStatus(e: { detail?: { status?: string } }) {
  if (e.detail?.status === 'session-started') inAr = true
  if (e.detail?.status === 'not-presenting' && inAr) { inAr = false; arKey.value++ }
}
const root = ref<HTMLElement>()
let ctx: gsap.Context | undefined

async function show3d() {
  view.value = '3d'
  await loadModelViewer()
  ready.value = true
}
function onLoad() {
  canAR.value = !!mv.value?.canActivateAR
}

watch(() => p.value.slug, () => { view.value = 'photo'; canAR.value = false })

onMounted(() => {
  document.addEventListener('visibilitychange', backFromAr)
  window.addEventListener('pageshow', backFromAr)
  if (route.query.ar) show3d()
  ctx = gsap.context(() => {
    gsap.from('.pd__anim', { y: 30, opacity: 0, stagger: 0.06, duration: 1, delay: 0.15, ease: 'expo.out' })
    gsap.from('.pd__media', { scale: 0.96, opacity: 0, duration: 1.2, ease: 'expo.out' })
  }, root.value)
})
onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', backFromAr)
  window.removeEventListener('pageshow', backFromAr)
  ctx?.revert()
})
</script>

<template>
  <div ref="root" class="pd" :style="{ '--t': p.color.tint, '--a': p.color.accent, '--d': p.color.deep, '--accent': p.color.accent }">
    <div class="container pd__grid">
      <div class="pd__media-wrap">
        <div class="pd__media">
          <img v-show="view === 'photo'" :src="p.image" :alt="`${p.name} — 500 g jar`" class="pd__photo" width="400" height="530" fetchpriority="high" />
          <div v-show="view === '3d'" class="pd__three">
            <model-viewer
              v-if="ready"
              ref="mv"
              :key="`${p.slug}-${arKey}`"
              class="pd__mv"
              :src="p.model"
              :alt="`3D view of the ${p.name} jar. Drag to turn it.`"
              camera-controls
              disable-zoom
              disable-pan
              touch-action="pan-y"
              interaction-prompt="none"
              shadow-intensity="1"
              shadow-softness="0.9"
              exposure="0.95"
              environment-image="neutral"
              camera-orbit="0deg 80deg 0.62m"
              min-camera-orbit="auto 60deg 0.62m"
              max-camera-orbit="auto 100deg 0.62m"
              field-of-view="26deg"
              loading="eager"
              ar
              ar-modes="webxr scene-viewer quick-look"
              ar-scale="auto"
              ar-placement="floor"
              @load="onLoad"
              @ar-status="onArStatus"
            >
              <span slot="ar-button" hidden />
              <div slot="progress-bar" />
            </model-viewer>
            <div v-else class="pd__spinner" aria-hidden="true" />
          </div>

          <div class="pd__tabs" role="tablist" aria-label="View">
            <button role="tab" :aria-selected="view === 'photo'" :class="{ on: view === 'photo' }" @click="view = 'photo'">Photo</button>
            <button role="tab" :aria-selected="view === '3d'" :class="{ on: view === '3d' }" @click="show3d">3D view</button>
          </div>
          <p v-if="view === '3d'" class="pd__hint"><AppIcon name="rotate" /> Drag to turn</p>
          <button v-if="view === '3d' && canAR" class="btn pd__ar" @click="launchAr"><AppIcon name="cube" /> View in your space</button>
        </div>
      </div>

      <article class="pd__info">
        <nav class="pd__crumbs pd__anim" aria-label="Breadcrumb">
          <NuxtLink to="/">Home</NuxtLink><span aria-hidden="true">/</span>
          <NuxtLink to="/flavours">Flavours</NuxtLink><span aria-hidden="true">/</span>
          <span aria-current="page">{{ p.short }}</span>
        </nav>
        <p class="eyebrow pd__eyebrow pd__anim">{{ p.urdu }} · {{ p.weight }}</p>
        <h1 class="pd__name display pd__anim">{{ p.name }}</h1>
        <p class="pd__tag display pd__anim">{{ p.tagline }}</p>

        <div class="pd__buy pd__anim">
          <div>
            <p class="pd__price">{{ formatPrice(p) }}</p>
            <a :href="WHATSAPP_TEL" target="_blank" rel="noopener" class="pd__num"><AppIcon name="whatsapp" /> {{ WHATSAPP_DISPLAY }}</a>
          </div>
          <a :href="WHATSAPP_URL" target="_blank" rel="noopener" class="btn btn--wa"><AppIcon name="whatsapp" /> Order on WhatsApp</a>
        </div>

        <p class="pd__desc pd__anim">{{ p.description }}</p>

        <div class="pd__block pd__anim">
          <h2 class="eyebrow">Taste profile</h2>
          <TasteMeter :taste="p.taste" />
        </div>
        <div class="pd__block pd__anim">
          <h2 class="eyebrow">Key ingredients</h2>
          <ul class="pd__chips"><li v-for="i in p.ingredients" :key="i">{{ i }}</li></ul>
          <p class="pd__small">Full ingredient and allergen details are printed on the jar. If you have an allergy, please message us before ordering.</p>
        </div>
        <div class="pd__block pd__anim">
          <h2 class="eyebrow">Best with</h2>
          <ul class="pd__pairs"><li v-for="x in p.pairs" :key="x"><AppIcon name="check" /> {{ x }}</li></ul>
        </div>
        <div class="pd__block pd__care pd__anim">
          <p><AppIcon name="fridge" /> <span><strong>Keep refrigerated</strong> after opening.</span></p>
          <p><AppIcon name="leaf" /> <span><strong>No additives</strong> or preservatives.</span></p>
        </div>
      </article>
    </div>

    <section class="container pd__more" aria-labelledby="more-title">
      <div class="pd__more-head">
        <h2 id="more-title" class="display pd__more-title">More from <em>the kitchen</em></h2>
        <NuxtLink to="/flavours" class="btn btn--ghost">All flavours <AppIcon name="arrow" /></NuxtLink>
      </div>
      <div class="pd__more-grid">
        <NuxtLink v-for="o in others" :key="o.slug" :to="`/chutney/${o.slug}`" class="mk" :style="{ '--mt': o.color.tint, '--md': o.color.deep, '--ma': o.color.accent }">
          <span class="mk__disc" aria-hidden="true" />
          <span class="mk__shadow" aria-hidden="true" />
          <img class="mk__img" :src="o.image" :alt="`${o.name} jar`" width="300" height="400" loading="lazy" decoding="async" />
          <span class="mk__body">
            <span class="eyebrow mk__eye">{{ o.urdu }}</span>
            <span class="display mk__name">{{ o.short }}</span>
            <span class="mk__tag">{{ o.tagline }}</span>
          </span>
          <span class="mk__go" aria-hidden="true"><AppIcon name="arrow" /></span>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.pd {
  background: linear-gradient(180deg, var(--t) 0%, var(--t) 55%, var(--cream) 100%);
  padding: calc(var(--header-h) + 28px) 0 clamp(80px, 10vw, 140px);
}
.pd__grid {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  gap: clamp(28px, 5vw, 72px);
  align-items: start;
}
.pd__media-wrap {
  position: sticky;
  top: calc(var(--header-h) + 16px);
}
.pd__media {
  position: relative;
  aspect-ratio: 1 / 1.08;
  max-height: calc(100svh - var(--header-h) - 40px);
  border-radius: var(--radius-lg);
  background: radial-gradient(60% 50% at 50% 58%, color-mix(in srgb, var(--a) 22%, transparent), transparent 70%), color-mix(in srgb, var(--t) 70%, #fff);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--d) 10%, transparent);
  overflow: hidden;
  display: grid;
  place-items: center;
}
.pd__photo {
  position: absolute;
  inset: 9% 10% 8%;
  width: 80%;
  height: 83%;
  object-fit: contain;
  filter: drop-shadow(0 30px 28px color-mix(in srgb, var(--d) 35%, transparent));
}
.pd__three,
.pd__mv {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  --poster-color: transparent;
}
.pd__spinner {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 40px;
  height: 40px;
  margin: -20px;
  border-radius: 50%;
  border: 2px solid color-mix(in srgb, var(--d) 20%, transparent);
  border-top-color: var(--d);
  animation: spin 0.9s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.pd__tabs {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 99px;
  background: color-mix(in srgb, var(--paper) 85%, transparent);
  box-shadow: inset 0 0 0 1px var(--line);
  backdrop-filter: blur(8px);
}
.pd__tabs button {
  min-height: 36px;
  padding: 0 14px;
  border-radius: 99px;
  font-size: 0.85rem;
  font-weight: 600;
  transition: background 0.3s, color 0.3s;
}
.pd__tabs button.on {
  background: var(--ink);
  color: var(--paper);
}
.pd__hint {
  position: absolute;
  left: 18px;
  bottom: 18px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: var(--d);
  opacity: 0.8;
}
.pd__ar {
  position: absolute;
  right: 16px;
  bottom: 16px;
  --btn-bg: var(--d);
}
.pd__crumbs {
  display: flex;
  gap: 8px;
  font-size: var(--fs-small);
  color: var(--ink-3);
  margin-bottom: 22px;
}
.pd__eyebrow { color: var(--a); }
.pd__name {
  font-size: clamp(2.6rem, 5.6vw, 5.2rem);
  color: var(--d);
  margin: 10px 0;
  line-height: 0.95;
}
.pd__tag {
  font-style: italic;
  font-size: clamp(1.25rem, 2vw, 1.7rem);
  font-weight: 450;
  color: var(--a);
}
.pd__buy {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin: 26px 0;
  padding: 18px 0;
  border-block: 1px solid color-mix(in srgb, var(--d) 16%, transparent);
}
.pd__price {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--d);
}
.pd__num {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  font-weight: 600;
  color: #1f8f4e;
}
.pd__desc {
  font-size: var(--fs-lead);
  line-height: 1.55;
  color: var(--ink-2);
}
.pd__block { margin-top: 32px; }
.pd__block > .eyebrow { color: var(--d); margin-bottom: 12px; }
.pd__chips { display: flex; flex-wrap: wrap; gap: 8px; }
.pd__chips li {
  padding: 8px 14px;
  border-radius: 99px;
  font-size: 0.88rem;
  background: color-mix(in srgb, var(--paper) 70%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--d) 14%, transparent);
}
.pd__small { margin-top: 12px; font-size: 0.82rem; color: var(--ink-3); }
.pd__pairs { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.pd__pairs li { display: flex; align-items: center; gap: 8px; color: var(--ink-2); }
.pd__pairs :deep(svg) { color: var(--a); }
.pd__care {
  display: grid;
  gap: 10px;
  padding: 20px;
  border-radius: var(--radius);
  background: color-mix(in srgb, var(--paper) 75%, transparent);
}
.pd__care p { display: flex; gap: 12px; align-items: center; font-size: 0.95rem; color: var(--ink-2); }
.pd__care :deep(svg) { color: var(--d); }
.pd__more { margin-top: clamp(64px, 8vw, 110px); }
.pd__more-head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 26px; }
.pd__more-title { font-size: var(--fs-d2); line-height: 1; }
.pd__more-title em { color: var(--chili); }
.pd__more-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.mk { position: relative; display: grid; grid-template-rows: auto 1fr; padding: 18px 18px 20px; border-radius: var(--radius-lg); background: var(--mt); color: var(--md); overflow: hidden; isolation: isolate; contain: layout paint; transition: transform 0.5s var(--ease-out), box-shadow 0.5s var(--ease-out); }
.mk:hover { transform: translateY(-6px); box-shadow: 0 30px 50px -34px color-mix(in srgb, var(--md) 75%, transparent); }
.mk__disc { position: absolute; z-index: -1; left: 50%; top: 34%; width: 74%; aspect-ratio: 1; border-radius: 50%; background: color-mix(in srgb, var(--ma) 22%, transparent); transform: translate(-50%, -50%) scale(0.86); transition: transform 0.6s var(--ease-out); }
.mk:hover .mk__disc { transform: translate(-50%, -50%) scale(1); }
.mk__img { justify-self: center; height: clamp(170px, 17vw, 230px); width: auto; object-fit: contain; transition: transform 0.6s var(--ease-out); will-change: transform; }
.mk:hover .mk__img { transform: translateY(-8px) rotate(-4deg); }
.mk__shadow { position: absolute; left: 28%; right: 28%; top: calc(18px + clamp(170px, 17vw, 230px) - 10px); height: 18px; border-radius: 50%; background: radial-gradient(closest-side, color-mix(in srgb, var(--md) 35%, transparent), transparent); }
.mk__body { display: grid; gap: 2px; margin-top: 16px; }
.mk__eye { color: var(--ma); }
.mk__name { font-size: 1.7rem; line-height: 1; }
.mk__tag { font-size: 0.86rem; font-style: italic; opacity: 0.8; }
.mk__go { position: absolute; right: 16px; bottom: 18px; display: grid; place-items: center; width: 38px; height: 38px; border-radius: 50%; background: var(--md); color: var(--mt); transform: scale(0.8); opacity: 0; transition: transform 0.4s var(--ease-out), opacity 0.3s; }
.mk:hover .mk__go { transform: scale(1); opacity: 1; }
@media (max-width: 900px) {
  .pd__grid { grid-template-columns: 1fr; }
  .pd__media-wrap { position: relative; top: 0; }
  .pd__media { aspect-ratio: 1 / 1; }
  .pd__more-grid { grid-template-columns: 1fr 1fr; }
  .mk__go { opacity: 1; transform: none; }
  .pd__pairs { grid-template-columns: 1fr; }
}
</style>
