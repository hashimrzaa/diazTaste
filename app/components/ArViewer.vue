<script setup lang="ts">
import { gsap } from 'gsap'
import QRCode from 'qrcode'
import { products } from '~/data/products'

const ar = useAr()
const panel = ref<HTMLElement>()
const closeBtn = ref<HTMLButtonElement>()
const mv = ref<any>()
const ready = ref(false)
const loaded = ref(false)
const canAR = ref<boolean | null>(null)
const arStatus = ref('not-presenting')
const arKey = ref(0)
let inAr = false
function backFromAr() {
  if (!inAr || document.visibilityState !== 'visible') return
  inAr = false
  arKey.value++
}
const arScale = ref(100)
const qr = ref('')
const touch = ref(false)
// Only surface the "scan to continue on your phone" QR on a desktop/laptop.
const showQr = computed(() => !touch.value)
const product = computed(() => products.find((p) => p.slug === ar.value.slug) ?? products[0]!)
let lastFocus: HTMLElement | null = null

async function makeQr() {
  qr.value = await QRCode.toDataURL(absoluteUrl(`/chutney/${product.value.slug}?ar=1`), {
    margin: 1,
    width: 320,
    color: { dark: '#1e0f0a', light: '#fbf6ee' },
  })
}

function close() {
  ar.value = { ...ar.value, open: false }
}

function onLoad() {
  loaded.value = true
  canAR.value = !!mv.value?.canActivateAR
}

function onArStatus(e: { detail?: { status?: string } }) {
  arStatus.value = e.detail?.status ?? 'not-presenting'
  if (arStatus.value === 'not-presenting' && inAr) { inAr = false; arKey.value++ }
}

// Launch the device’s native AR (Scene Viewer / WebXR on Android, Quick Look on iOS).
function launch() {
  inAr = true
  mv.value?.activateAR?.()
}

function recenter() {
  const m = mv.value
  if (!m) return
  m.cameraOrbit = '0deg 75deg 105%'
  m.cameraTarget = 'auto auto auto'
  m.jumpCameraToGoal?.()
}

function onKey(e: KeyboardEvent) {
  if (!ar.value.open) return
  if (e.key === 'Escape') close()
  if (e.key === 'Tab' && panel.value) {
    const f = panel.value.querySelectorAll<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])')
    const first = f[0]
    const last = f[f.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last?.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first?.focus()
    }
  }
}

watch(
  () => ar.value.open,
  async (open) => {
    lockScroll(open)
    if (open) {
      lastFocus = document.activeElement as HTMLElement
      arStatus.value = 'not-presenting'
      loaded.value = false
      makeQr()
      await loadModelViewer()
      ready.value = true
      await nextTick()
      closeBtn.value?.focus()
      gsap.fromTo(panel.value!, { clipPath: 'circle(0% at 50% 100%)' }, { clipPath: 'circle(150% at 50% 100%)', duration: 1, ease: 'expo.inOut' })
      gsap.fromTo('.arv__anim', { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, delay: 0.45, duration: 0.9, ease: 'expo.out' })
    } else {
      lastFocus?.focus?.()
    }
  },
)
watch(
  () => ar.value.slug,
  () => {
    loaded.value = false
    makeQr()
  },
)

// While a live AR session runs, mirror the object’s scale into the overlay.
let scaleTimer: ReturnType<typeof setInterval> | undefined
watch(arStatus, (s) => {
  clearInterval(scaleTimer)
  if (s === 'presenting') {
    scaleTimer = setInterval(() => {
      const m = mv.value?.model
      if (m?.scale) arScale.value = Math.round(m.scale.x * 100)
    }, 200)
  } else {
    arScale.value = 100
  }
})

onMounted(() => {
  touch.value = isTouch()
  window.addEventListener('keydown', onKey)
  document.addEventListener('visibilitychange', backFromAr)
})
onBeforeUnmount(() => {
  clearInterval(scaleTimer)
  window.removeEventListener('keydown', onKey)
  document.removeEventListener('visibilitychange', backFromAr)
})
</script>

<template>
  <div
    v-if="ar.open"
    ref="panel"
    class="arv"
    role="dialog"
    aria-modal="true"
    aria-labelledby="arv-title"
    :style="{ '--a': product.color.accent, '--t': product.color.tint, '--d': product.color.deep }"
  >
    <header class="arv__top">
      <div class="arv__anim">
        <p class="eyebrow arv__eyebrow">3D &amp; AR viewer</p>
        <h2 id="arv-title" class="arv__title display">{{ product.name }}</h2>
      </div>
      <button ref="closeBtn" class="arv__close arv__anim" aria-label="Close viewer" @click="close">
        <AppIcon name="close" />
      </button>
    </header>

    <div class="arv__stage">
      <model-viewer
        v-if="ready"
        ref="mv"
        :key="`${product.slug}-${arKey}`"
        class="arv__mv"
        :src="product.model"
        :alt="`Interactive 3D model of a ${product.name} jar. Drag to rotate.`"
        camera-controls
        disable-zoom
        disable-pan
        touch-action="pan-y"
        interaction-prompt="auto"
        shadow-intensity="1.2"
        shadow-softness="0.85"
        exposure="1.05"
        environment-image="neutral"
        camera-orbit="0deg 80deg 0.62m"
        min-camera-orbit="auto 60deg 0.62m"
        max-camera-orbit="auto 100deg 0.62m"
        field-of-view="28deg"
        loading="eager"
        power-preference="high-performance"
        ar
        ar-modes="webxr scene-viewer quick-look"
        ar-scale="auto"
        ar-placement="floor"
        @load="onLoad"
        @ar-status="onArStatus"
      >
        <span slot="ar-button" hidden />
        <div slot="progress-bar" />

        <!-- Overlay shown while the live (WebXR) AR session is running -->
        <div v-show="arStatus === 'presenting'" class="arv__live">
          <div class="arv__live-card">
            <span class="arv__live-k">AR setup</span>
            <span>1 · Scan a flat surface to place the jar<br />2 · Pinch to scale · drag to move</span>
          </div>
          <div class="arv__live-scale"><span class="arv__live-k">Scale</span>{{ arScale }}%</div>
          <button class="btn btn--light arv__recenter" @click="recenter"><AppIcon name="rotate" /> Recenter</button>
        </div>
      </model-viewer>
      <div v-if="!loaded" class="arv__spinner" aria-hidden="true" />
    </div>

    <div class="arv__picker arv__anim" role="radiogroup" aria-label="Flavour">
      <button
        v-for="p in products"
        :key="p.slug"
        role="radio"
        :aria-checked="p.slug === product.slug"
        :class="{ on: p.slug === product.slug }"
        :style="{ '--c': p.color.accent }"
        @click="ar.slug = p.slug"
      >
        <span />{{ p.short }}
      </button>
    </div>

    <footer class="arv__bar arv__anim">
      <button v-if="canAR" class="btn btn--light arv__cta" @click="launch">
        <AppIcon name="cube" /> View in your space
      </button>
      <div v-if="showQr && qr" class="arv__qr">
        <img :src="qr" width="88" height="88" alt="QR code that opens this in AR on your phone" />
        <p><strong>On a computer?</strong> Scan with your phone to place the jar in your room.</p>
      </div>
      <p class="arv__hint"><AppIcon name="rotate" /> Drag to turn the jar</p>
    </footer>
  </div>
</template>

<style scoped>
.arv {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: grid;
  grid-template-rows: auto 1fr auto auto;
  background:
    radial-gradient(70% 55% at 50% 58%, color-mix(in srgb, var(--a) 40%, var(--ink)) 0%, var(--ink) 75%);
  color: var(--cream);
  overflow: hidden;
  transition: background 0.8s;
}
.arv__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: clamp(18px, 3vw, 32px) var(--gutter) 0;
}
.arv__eyebrow {
  color: color-mix(in srgb, var(--a) 60%, #fff);
}
.arv__title {
  font-size: clamp(1.9rem, 4vw, 3.4rem);
  margin-top: 6px;
}
.arv__close {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(244, 235, 221, 0.1);
  box-shadow: inset 0 0 0 1px rgba(244, 235, 221, 0.2);
  transition: background 0.3s, transform 0.5s var(--ease-out);
}
.arv__close:hover {
  background: rgba(244, 235, 221, 0.2);
  transform: rotate(90deg);
}
.arv__stage {
  position: relative;
  min-height: 0;
}
.arv__mv {
  width: 100%;
  height: 100%;
  background: transparent;
  --poster-color: transparent;
}
.arv__spinner {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 44px;
  height: 44px;
  margin: -22px;
  border-radius: 50%;
  border: 2px solid rgba(244, 235, 221, 0.2);
  border-top-color: var(--cream);
  animation: spin 0.9s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.arv__picker {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0 var(--gutter) 16px;
}
.arv__picker button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 38px;
  padding: 0 13px;
  border-radius: 99px;
  font-size: 0.84rem;
  font-weight: 550;
  color: rgba(244, 235, 221, 0.75);
  box-shadow: inset 0 0 0 1px rgba(244, 235, 221, 0.18);
  transition: background 0.3s, color 0.3s;
}
.arv__picker button.on {
  background: var(--cream);
  color: var(--ink);
}
.arv__picker span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--c);
}
.arv__bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 12px 16px;
  padding: 0 var(--gutter) max(24px, env(safe-area-inset-bottom));
}
.arv__cta {
  min-height: 56px;
}
.arv__ghost {
  --btn-fg: var(--cream);
  --btn-hover: var(--cream);
  box-shadow: inset 0 0 0 1.5px rgba(244, 235, 221, 0.3);
}
.arv__ghost:hover {
  color: var(--ink);
}
.arv__qr {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 14px 8px 8px;
  border-radius: 18px;
  background: rgba(244, 235, 221, 0.08);
  box-shadow: inset 0 0 0 1px rgba(244, 235, 221, 0.15);
  font-size: 0.8rem;
  max-width: 300px;
  color: rgba(244, 235, 221, 0.7);
}
.arv__qr img {
  width: 64px;
  height: 64px;
  border-radius: 8px;
}
.arv__qr strong {
  display: block;
  color: var(--cream);
}
.arv__hint {
  flex-basis: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  color: rgba(244, 235, 221, 0.5);
}
.arv__na {
  flex: 1;
  text-align: center;
  font-size: 0.9rem;
  color: rgba(244, 235, 221, 0.65);
}

/* Live AR (WebXR) overlay */
.arv__live {
  position: absolute;
  inset: 0;
  padding: 22px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
}
.arv__live > * {
  pointer-events: auto;
}
.arv__live-card {
  display: grid;
  gap: 4px;
  max-width: 280px;
  padding: 14px 18px;
  border-radius: 18px;
  background: rgba(20, 10, 6, 0.8);
  backdrop-filter: blur(14px);
  box-shadow: inset 0 0 0 1px rgba(244, 235, 221, 0.12);
  font-size: 0.82rem;
  color: var(--cream);
  line-height: 1.5;
}
.arv__live-k {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.55;
}
.arv__live-scale {
  position: absolute;
  top: 22px;
  right: 22px;
  display: grid;
  gap: 2px;
  padding: 10px 16px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--a), var(--d));
  font-weight: 800;
  font-size: 1.1rem;
  color: #fff;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
}
.arv__recenter {
  align-self: center;
  margin-bottom: 18px;
}
</style>
