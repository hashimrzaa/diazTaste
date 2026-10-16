<script setup lang="ts">
import { gsap } from 'gsap'
import QRCode from 'qrcode'
import { products, WHATSAPP_URL, WHATSAPP_DISPLAY, WHATSAPP_TEL } from '~/data/products'

const year = new Date().getFullYear()
const root = ref<HTMLElement>()
const qr = ref('')
let ctx: gsap.Context | undefined

onMounted(async () => {
  qr.value = await QRCode.toDataURL(WHATSAPP_URL, { margin: 1, width: 400, errorCorrectionLevel: 'M', color: { dark: '#0f0f0f', light: '#ffffff' } })
})

onMounted(() => {
  ctx = gsap.context(() => {
    gsap.from('.ftr__badge', {
      yPercent: 40,
      opacity: 0,
      ease: 'none',
      scrollTrigger: { trigger: root.value, start: 'top bottom', end: 'bottom bottom', scrub: true },
    })
  }, root.value)
})
onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <footer ref="root" class="ftr cover" data-header="dark">
    <div class="container">
      <div class="ftr__top">
        <p class="ftr__claim display">Ghar ka zaiqa,<br /><em>delivered.</em></p>
        <a :href="WHATSAPP_URL" target="_blank" rel="noopener" class="btn btn--light">
          <AppIcon name="whatsapp" /> Order on WhatsApp
        </a>
      </div>

      <div class="ftr__contact">
        <img v-if="qr" :src="qr" width="120" height="120" class="ftr__qr" alt="QR code to chat with Dia’s Taste on WhatsApp" />
        <div class="ftr__contact-text">
          <h2 class="eyebrow">Chat with us</h2>
          <a :href="WHATSAPP_TEL" target="_blank" rel="noopener" class="ftr__wa">
            <AppIcon name="whatsapp" />
            <span>{{ WHATSAPP_DISPLAY || 'Message us on WhatsApp' }}</span>
          </a>
          <p class="ftr__wa-sub">Scan the QR with your phone camera, or tap to open a chat. We confirm your order, price &amp; delivery there.</p>
        </div>
        <span class="ftr__badge"><BrandLogo /></span>
      </div>

      <div class="ftr__cols">
        <div>
          <h2 class="eyebrow">Flavours</h2>
          <ul>
            <li v-for="p in products" :key="p.slug">
              <NuxtLink :to="`/chutney/${p.slug}`">{{ p.name }}</NuxtLink>
            </li>
          </ul>
        </div>
        <div>
          <h2 class="eyebrow">Explore</h2>
          <ul>
            <li><NuxtLink to="/flavours">Flavours</NuxtLink></li>
            <li><a :href="WHATSAPP_URL" target="_blank" rel="noopener">WhatsApp</a></li>
          </ul>
        </div>
        <div>
          <h2 class="eyebrow">Legal</h2>
          <ul>
            <li><NuxtLink to="/privacy">Privacy policy</NuxtLink></li>
            <li><NuxtLink to="/terms">Terms of sale</NuxtLink></li>
            <li><NuxtLink to="/cookies">Cookies</NuxtLink></li>
            <li><NuxtLink to="/accessibility">Accessibility</NuxtLink></li>
          </ul>
        </div>
        <div class="ftr__care">
          <h2 class="eyebrow">Care</h2>
          <p><AppIcon name="fridge" /> Keep refrigerated after opening.</p>
          <p><AppIcon name="leaf" /> Pure homemade. No additives.</p>
          <p>Always use a clean, dry spoon.</p>
        </div>
      </div>

      <div class="ftr__legal">
        <p>© {{ year }} Dia’s Taste. All rights reserved.</p>
        <p>Made with love in a home kitchen.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.ftr {
  background: var(--ink);
  color: var(--cream);
  padding: clamp(80px, 12vw, 160px) 0 28px;
  overflow: hidden;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  margin-top: -1px;
}
.ftr__top {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 32px;
  padding-bottom: clamp(48px, 7vw, 96px);
  border-bottom: 1px solid rgba(244, 235, 221, 0.14);
}
.ftr__claim {
  font-size: var(--fs-d2);
}
.ftr__claim em {
  color: color-mix(in srgb, var(--chili) 62%, #fff);
}
.ftr__contact {
  display: flex;
  align-items: center;
  gap: 22px;
  padding: clamp(28px, 4vw, 44px) 0;
  border-bottom: 1px solid rgba(244, 235, 221, 0.14);
}
.ftr__badge { margin-left: auto; flex: none; display: grid; place-items: center; width: 120px; height: 120px; border-radius: 50%; background: var(--cream); --logo-h: 84%; box-shadow: 0 0 0 6px rgba(244, 235, 221, 0.08); }
.ftr__qr {
  width: 108px;
  height: 108px;
  border-radius: 14px;
  padding: 7px;
  background: var(--cream);
  flex: none;
}
.ftr__contact-text .eyebrow {
  color: rgba(244, 235, 221, 0.55);
  margin-bottom: 10px;
}
.ftr__wa {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(1.4rem, 2.4vw, 2rem);
  letter-spacing: -0.02em;
  color: var(--cream);
}
.ftr__wa :deep(svg) {
  color: #4fd473;
  width: 1.1em;
  height: 1.1em;
}
.ftr__wa:hover {
  color: #4fd473;
}
.ftr__wa-sub {
  margin-top: 8px;
  max-width: 46ch;
  font-size: var(--fs-small);
  color: rgba(244, 235, 221, 0.6);
}
.ftr__cols {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
  padding: clamp(40px, 6vw, 72px) 0;
}
@media (max-width: 560px) {
  .ftr__badge { display: none; }
  .ftr__contact {
    flex-direction: column;
    align-items: flex-start;
  }
}
.ftr__cols .eyebrow {
  color: rgba(244, 235, 221, 0.55);
  margin-bottom: 18px;
}
.ftr__cols li + li {
  margin-top: 8px;
}
.ftr__cols a {
  position: relative;
  background: linear-gradient(currentColor, currentColor) 0 100% / 0 1px no-repeat;
  transition: background-size 0.5s var(--ease-out);
}
.ftr__cols a:hover {
  background-size: 100% 1px;
}
.ftr__care p {
  display: flex;
  gap: 10px;
  align-items: center;
  color: rgba(244, 235, 221, 0.78);
}
.ftr__care p + p {
  margin-top: 10px;
}
.ftr__legal {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 20px;
  border-top: 1px solid rgba(244, 235, 221, 0.14);
  font-size: var(--fs-small);
  color: rgba(244, 235, 221, 0.6);
}
@media (max-width: 860px) {
  .ftr__cols {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
