<script setup lang="ts">
import { gsap } from 'gsap'
import { products, WHATSAPP_URL, WHATSAPP_DISPLAY, WHATSAPP_TEL } from '~/data/products'

/* Shared "Hungry yet?" order block — used on the landing page and /flavours. */
const root = ref<HTMLElement>()
const qr = '/brand/dias-wa-qr.svg' // WhatsApp's own QR for WHATSAPP_URL (static: no QR maths at runtime)
let ctx: gsap.Context | undefined

onMounted(async () => {
  ctx = gsap.context(() => {
    const ot = gsap.timeline({ scrollTrigger: { trigger: root.value, start: 'top 85%', end: 'top 25%', scrub: 0.6 } })
    gsap.utils.toArray<HTMLElement>('.od__w').forEach((w, i) => {
      ot.fromTo(w, { yPercent: 110, rotate: i ? 6 : -6, opacity: 0 }, { yPercent: 0, rotate: 0, opacity: 1, ease: 'power3.out' }, i * 0.15)
    })
    ot.fromTo('.od__lead, .od__ctas', { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1 }, 0.25)
      .fromTo('.od__qr', { rotateY: -70, opacity: 0, transformPerspective: 900 }, { rotateY: 0, opacity: 1, ease: 'power3.out' }, 0.3)
    if (!prefersReducedMotion()) gsap.to('.od__marquee', { xPercent: -50, ease: 'none', duration: 30, repeat: -1 })
  }, root.value)
})
onBeforeUnmount(() => ctx?.revert())
</script>

<template>
    <div id="order" ref="root" class="od">
      <div class="od__marquee" aria-hidden="true">
        <span v-for="n in 2" :key="n">{{ products.map((x) => x.short).join(' · ') }} · </span>
      </div>
      <div class="container od__grid">
        <p class="eyebrow od__eyebrow"><span>03</span> Order</p>
        <h2 class="display od__title"><span class="od__w">Hungry</span> <span class="od__w od__w--red">yet?</span></h2>
        <div class="od__row">
          <div class="od__main">
            <p class="od__lead">Message us your flavours and address — we confirm the price and delivery, and cook it fresh in our kitchen.</p>
            <div class="od__ctas">
              <a v-magnetic="0.25" :href="WHATSAPP_URL" target="_blank" rel="noopener" class="btn btn--wa od__big"><AppIcon name="whatsapp" /> Order on WhatsApp</a>
              <NuxtLink to="/flavours" class="btn btn--ghost od__big">All flavours <AppIcon name="arrow" /></NuxtLink>
            </div>
          </div>
          <div class="od__qr">
            <img :src="qr" loading="lazy" decoding="async" width="140" height="140" alt="QR code to order from Dia’s Taste on WhatsApp" />
            <p>Scan to chat<br /><a :href="WHATSAPP_TEL" target="_blank" rel="noopener" class="od__num"><AppIcon name="whatsapp" /> {{ WHATSAPP_DISPLAY }}</a></p>
          </div>
        </div>
      </div>
    </div>
</template>

<style scoped>
.od { position: relative; margin-top: clamp(56px, 7vw, 100px); padding: clamp(40px, 5vw, 70px) 0 clamp(10px, 2vw, 20px); overflow: hidden; }
.od__marquee { position: absolute; top: 4%; left: 0; display: flex; width: max-content; font-family: var(--font-display); font-weight: 800; font-size: clamp(5rem, 14vw, 13rem); line-height: 1; letter-spacing: -0.05em; color: transparent; -webkit-text-stroke: 1.5px color-mix(in srgb, var(--ink) 10%, transparent); white-space: nowrap; pointer-events: none; }
.od__grid { position: relative; }
.od__eyebrow { display: flex; gap: 12px; color: var(--ink-2); margin-bottom: 8px; }
.od__eyebrow span { color: var(--chili); }
.od__title { font-size: clamp(3.6rem, 11vw, 10.5rem); line-height: 0.95; }
.od__w { display: inline-block; }
.od__w--red { color: var(--chili); font-weight: 400; }
.od__row { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 28px; margin-top: clamp(18px, 3vw, 34px); }
.od__lead { max-width: 42ch; margin-bottom: 22px; font-size: var(--fs-lead); color: var(--ink-2); }
.od__ctas { display: flex; flex-wrap: wrap; gap: 12px; }
.od__big { min-height: 58px; padding: 0 1.8em; font-size: 1rem; }
.od__qr { display: flex; align-items: center; gap: 14px; padding: 14px 20px 14px 14px; border-radius: 26px; background: var(--paper); box-shadow: 0 24px 50px -30px rgba(30, 15, 10, 0.45), inset 0 0 0 1px var(--line); font-size: 0.9rem; color: var(--ink-2); }
.od__qr-badge { display: grid; place-items: center; width: 96px; height: 96px; border-radius: 50%; background: var(--cream); --logo-h: 84%; box-shadow: inset 0 0 0 1px var(--line); }
.od__qr img { width: 96px; height: 96px; border-radius: 10px; }
.od__num { display: inline-flex; align-items: center; gap: 6px; margin-top: 6px; font-weight: 700; color: #1f8f4e; }

@media (max-width: 640px) {
  .od__qr img { display: none; }
  .od__qr { width: 100%; }
}
</style>
