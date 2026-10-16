<script setup lang="ts">
import { gsap } from 'gsap'
import { formatPrice, WHATSAPP_URL, type Product } from '~/data/products'

const props = defineProps<{ product: Product; index?: number }>()
const card = ref<HTMLElement>()
const img = ref<HTMLElement>()
let rx: gsap.QuickToFunc, ry: gsap.QuickToFunc

onMounted(() => {
  rx = gsap.quickTo(img.value!, 'rotationX', { duration: 0.8, ease: 'power3' })
  ry = gsap.quickTo(img.value!, 'rotationY', { duration: 0.8, ease: 'power3' })
})
function tilt(e: PointerEvent) {
  if (e.pointerType !== 'mouse') return
  const r = card.value!.getBoundingClientRect()
  ry(((e.clientX - r.left) / r.width - 0.5) * 22)
  rx(-((e.clientY - r.top) / r.height - 0.5) * 14)
}
function untilt() {
  rx?.(0)
  ry?.(0)
}
const p = computed(() => props.product)
</script>

<template>
  <article
    ref="card"
    class="pc"
    :style="{ '--t': p.color.tint, '--a': p.color.accent, '--d': p.color.deep }"
    @pointermove="tilt"
    @pointerleave="untilt"
  >
    <div class="pc__media">
      <span class="pc__index display" aria-hidden="true">0{{ (index ?? 0) + 1 }}</span>
      <div ref="img" class="pc__img">
        <img :src="p.image" :alt="`${p.name} — ${p.weight} jar`" width="400" height="530" loading="lazy" />
      </div>
      <span class="pc__glow" aria-hidden="true" />
    </div>
    <div class="pc__body">
      <p class="eyebrow pc__weight">{{ p.weight }} · {{ p.urdu }}</p>
      <h2 class="pc__name display">
        <NuxtLink :to="`/chutney/${p.slug}`" class="pc__link">{{ p.name }}</NuxtLink>
      </h2>
      <p class="pc__tag">{{ p.tagline }}</p>
      <div class="pc__meter"><TasteMeter :taste="p.taste" compact /></div>
      <div class="pc__foot">
        <p class="pc__price">{{ formatPrice(p) }}</p>
        <div class="pc__actions">
          <button class="pc__icon" :aria-label="`View ${p.name} in 3D`" @click="openAr(p.slug)">
            <AppIcon name="cube" />
          </button>
          <a :href="WHATSAPP_URL" target="_blank" rel="noopener" class="btn pc__order" :aria-label="`Order ${p.name} on WhatsApp`">
            Order
          </a>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.pc {
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-lg);
  background: var(--t);
  color: var(--d);
  overflow: hidden;
  transition: transform 0.6s var(--ease-out), box-shadow 0.6s var(--ease-out);
}
.pc:hover {
  transform: translateY(-6px);
  box-shadow: 0 40px 60px -40px color-mix(in srgb, var(--d) 70%, transparent);
}
.pc__media {
  position: relative;
  aspect-ratio: 1 / 1;
  padding: 22px 0 10px;
  display: grid;
  place-items: center;
  perspective: 900px;
}
.pc__index {
  position: absolute;
  left: 22px;
  top: 18px;
  font-size: 1rem;
  font-weight: 600;
  opacity: 0.6;
}
.pc__img {
  position: relative;
  z-index: 1;
  height: 100%;
  width: auto;
  max-width: 70%;
  display: grid;
  place-items: center;
  transform-style: preserve-3d;
  will-change: transform;
}
.pc__img img {
  width: auto;
  height: 100%;
  max-width: 100%;
  object-fit: contain;
  transition: transform 0.8s var(--ease-out);
}
.pc:hover .pc__img img {
  transform: translateY(-8px) scale(1.04);
}
.pc__glow {
  position: absolute;
  left: 50%;
  top: 55%;
  width: 70%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(closest-side, color-mix(in srgb, var(--a) 35%, transparent), transparent);
  transform: translate(-50%, -50%);
}
.pc__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 0 26px 24px;
}
.pc__weight {
  color: var(--a);
}
.pc__name {
  font-size: clamp(1.7rem, 2.4vw, 2.2rem);
  line-height: 1;
  margin: 8px 0 6px;
}
.pc__link::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
}
.pc__link:focus-visible {
  outline: none;
}
.pc__link:focus-visible::after {
  outline: 2.5px solid var(--d);
  outline-offset: -6px;
  border-radius: var(--radius-lg);
}
.pc__tag {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.05rem;
  opacity: 0.85;
}
.pc__meter {
  margin: 18px 0 20px;
  --accent: var(--a);
}
.pc__foot {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid color-mix(in srgb, var(--d) 15%, transparent);
}
.pc__price {
  font-weight: 600;
  font-size: 0.92rem;
}
.pc__actions {
  position: relative;
  z-index: 2;
  display: flex;
  gap: 8px;
}
.pc__icon {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--d) 30%, transparent);
  transition: background 0.3s, color 0.3s;
}
.pc__icon:hover {
  background: var(--d);
  color: var(--t);
}
.pc__order {
  --btn-bg: var(--d);
  --btn-hover: var(--a);
  min-height: 46px;
  padding: 0 1.3em;
}
</style>
