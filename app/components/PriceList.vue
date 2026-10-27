<script setup lang="ts">
import { gsap } from 'gsap'
import { WHATSAPP_URL } from '~/data/products'

/* Price list dock — a little tilted card stuck to the bottom-right corner.
   Click it and the card lifts out of the corner, swings upright and lands in
   the middle of the screen (a FLIP from the thumbnail's own box), with
   Download / Order buttons rising underneath. The open card tilts with the
   pointer and catches a moving sheen. Esc, the ✕ or the backdrop closes it,
   and the card flies back into the corner. */
const SRC = '/images/price-list.webp'
const THUMB = '/images/price-list-thumb.webp' // the docked card only needs a tiny copy
const introDone = useIntroDone()
const open = ref(false)
const thumb = ref<HTMLElement>()
const card = ref<HTMLElement>()
const stage = ref<HTMLElement>()
const closeBtn = ref<HTMLButtonElement>()
let tl: gsap.core.Timeline | undefined

/** transform that puts the big card exactly over the thumbnail */
function fromThumb() {
  const t = thumb.value!.getBoundingClientRect()
  const c = card.value!.getBoundingClientRect()
  return {
    x: t.left + t.width / 2 - (c.left + c.width / 2),
    y: t.top + t.height / 2 - (c.top + c.height / 2),
    scale: t.width / c.width,
    rotation: -8,
  }
}

async function show() {
  if (open.value) return
  open.value = true
  lockScroll(true)
  await nextTick()
  const reduce = prefersReducedMotion()
  tl?.kill()
  gsap.set(card.value!, { ...fromThumb(), rotationX: 0, transformPerspective: 1400 })
  tl = gsap.timeline()
    .to(thumb.value!, { autoAlpha: 0, duration: 0.15 }, 0)
    .fromTo('.pl__scrim', { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0)
    // lift off the corner, swing upright with a little overshoot
    .to(card.value!, { x: 0, y: 0, scale: 1, rotation: 0, duration: reduce ? 0.01 : 0.85, ease: 'back.out(1.15)' }, 0)
    .fromTo(card.value!, { rotationY: reduce ? 0 : -24 }, { rotationY: 0, duration: reduce ? 0.01 : 1.1, ease: 'elastic.out(1, 0.6)' }, 0.05)
    .fromTo('.pl__actions > *', { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.07, ease: 'expo.out' }, reduce ? 0 : 0.45)
    .fromTo('.pl__close', { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(2)' }, reduce ? 0 : 0.5)
  closeBtn.value?.focus({ preventScroll: true })
}

function hide() {
  if (!open.value || !card.value) return
  tl?.kill()
  const reduce = prefersReducedMotion()
  gsap.set(card.value, { rotationX: 0, rotationY: 0 })
  tl = gsap.timeline({
    onComplete: () => {
      open.value = false
      lockScroll(false)
      gsap.to(thumb.value!, { autoAlpha: 1, duration: 0.2 })
      thumb.value?.focus({ preventScroll: true })
    },
  })
    .to('.pl__actions > *, .pl__close', { autoAlpha: 0, y: 12, duration: 0.18, stagger: 0.03 }, 0)
    .to(card.value, { ...fromThumb(), duration: reduce ? 0.01 : 0.6, ease: 'power3.inOut' }, 0.05)
    .to('.pl__scrim', { opacity: 0, duration: 0.45 }, 0.1)
}

/* 3D tilt + sheen while open (mouse / pen only) */
function tilt(e: PointerEvent) {
  if (e.pointerType === 'touch' || !card.value || prefersReducedMotion() || tl?.isActive()) return
  const r = card.value.getBoundingClientRect()
  const px = (e.clientX - r.left) / r.width - 0.5
  const py = (e.clientY - r.top) / r.height - 0.5
  gsap.to(card.value, { rotationY: px * 10, rotationX: -py * 8, duration: 0.6, ease: 'power2.out' })
  card.value.style.setProperty('--sx', `${(px + 0.5) * 100}%`)
  card.value.style.setProperty('--sy', `${(py + 0.5) * 100}%`)
}
function untilt() {
  if (card.value && !tl?.isActive()) gsap.to(card.value, { rotationX: 0, rotationY: 0, duration: 0.8, ease: 'power3.out' })
}

const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') hide() }
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  tl?.kill()
  if (open.value) lockScroll(false)
})
</script>

<template>
  <div class="pl" :class="{ ready: introDone }">
    <!-- the docked card -->
    <button ref="thumb" class="pl__dock" type="button" aria-haspopup="dialog" :aria-expanded="open" aria-label="Open the price list" @click="show">
      <span class="pl__tag"><AppIcon name="sparkle" /> Price list</span>
      <span class="pl__stack" aria-hidden="true">
        <span class="pl__ghost" />
        <img :src="THUMB" alt="" width="240" height="360" loading="lazy" decoding="async" class="pl__mini" />
      </span>
    </button>

    <Teleport to="body">
      <div v-if="open" ref="stage" class="pl__stage" role="dialog" aria-modal="true" aria-label="Dia’s Taste price list" @pointermove="tilt" @pointerleave="untilt">
        <div class="pl__scrim" @click="hide" />
        <div class="pl__wrap">
          <div ref="card" class="pl__card">
            <img :src="SRC" alt="Dia’s Taste price list: Aloo Bukhara Rs 800 (250 g) and Rs 1,500 (500 g); Imli Rs 400 and Rs 750; Green Rs 400 and Rs 700; Garlic Rs 400 and Rs 700. Order on 0324 3560784." width="1024" height="1536" />
            <span class="pl__sheen" aria-hidden="true" />
          </div>
          <div class="pl__actions">
            <a :href="SRC" download="Dias-Taste-Price-List.webp" class="pl__btn pl__btn--dl"><AppIcon name="download" /> Download</a>
            <a :href="WHATSAPP_URL" target="_blank" rel="noopener" class="pl__btn pl__btn--wa"><AppIcon name="whatsapp" /> Order now</a>
          </div>
        </div>
        <button ref="closeBtn" class="pl__close" type="button" aria-label="Close price list" @click="hide"><AppIcon name="close" /></button>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* ---------- dock ---------- */
.pl { position: fixed; right: clamp(14px, 2vw, 30px); bottom: clamp(14px, 2.4vw, 30px); z-index: 55; pointer-events: none; opacity: 0; transform: translateY(40px) rotate(6deg); transition: opacity 0.6s var(--ease-out), transform 0.9s var(--ease-out); }
.pl.ready { opacity: 1; transform: none; }
.pl.ready .pl__dock { pointer-events: auto; }
.pl__dock { position: relative; display: flex; align-items: flex-end; gap: 10px; }

.pl__tag { display: inline-flex; align-items: center; gap: 6px; height: 34px; margin-bottom: 14px; padding: 0 14px; border-radius: 99px; background: var(--ink); color: var(--paper); font-size: 0.8rem; font-weight: 700; white-space: nowrap; box-shadow: 0 10px 24px -12px rgba(30, 15, 10, 0.6); transform-origin: right center; transition: transform 0.5s var(--ease-out), background 0.3s; }
.pl__tag :deep(svg) { width: 14px; height: 14px; color: color-mix(in srgb, var(--chili) 60%, #fff); }

.pl__stack { position: relative; display: block; width: 78px; aspect-ratio: 2 / 3; }
.pl__ghost, .pl__mini { position: absolute; inset: 0; border-radius: 10px; transition: transform 0.55s var(--ease-out); }
.pl__ghost { background: var(--chili); transform: rotate(9deg) translate(6px, 2px); box-shadow: 0 10px 22px -12px rgba(30, 15, 10, 0.5); transition: transform 0.55s var(--ease-out), background 0.6s; }
.pl__mini { width: 100%; height: 100%; object-fit: cover; border: 3px solid #fff; transform: rotate(-8deg); box-shadow: 0 16px 30px -14px rgba(30, 15, 10, 0.65); animation: nudge 7s ease-in-out 3s infinite; }

/* hover: the card straightens and pops, the red one fans out behind */
.pl__dock:hover .pl__mini, .pl__dock:focus-visible .pl__mini { transform: rotate(-2deg) translateY(-8px) scale(1.08); animation: none; }
.pl__dock:hover .pl__ghost, .pl__dock:focus-visible .pl__ghost { transform: rotate(16deg) translate(14px, -2px); }
.pl__dock:hover .pl__tag { transform: translateX(-4px); background: var(--chili); }
.pl__dock:focus-visible { outline: none; }
.pl__dock:focus-visible .pl__mini { outline: 2.5px solid var(--ink); outline-offset: 3px; }

/* a little wiggle now and then so it gets noticed */
@keyframes nudge {
  0%, 86%, 100% { transform: rotate(-8deg); }
  89% { transform: rotate(-13deg) translateY(-4px); }
  92% { transform: rotate(-4deg) translateY(-6px); }
  95% { transform: rotate(-10deg); }
}

/* ---------- open ---------- */
.pl__stage { position: fixed; inset: 0; z-index: 140; display: grid; place-items: center; perspective: 1400px; }
.pl__scrim { position: absolute; inset: 0; background: radial-gradient(circle at 50% 45%, rgba(30, 15, 10, 0.45), rgba(30, 15, 10, 0.78)); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); cursor: zoom-out; }
.pl__wrap { position: relative; display: grid; justify-items: center; gap: 18px; pointer-events: none; }
.pl__card {
  --h: min(78svh, 860px, calc(88vw * 1.5));
  position: relative; height: var(--h); aspect-ratio: 2 / 3; border-radius: 18px; overflow: hidden; pointer-events: auto;
  box-shadow: 0 50px 90px -40px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.12);
  transform-style: preserve-3d; will-change: transform;
}
.pl__card img { display: block; width: 100%; height: 100%; object-fit: cover; }
.pl__sheen { position: absolute; inset: 0; background: radial-gradient(circle at var(--sx, 30%) var(--sy, 20%), rgba(255, 255, 255, 0.28), transparent 45%); mix-blend-mode: soft-light; pointer-events: none; }

.pl__actions { display: flex; gap: 10px; pointer-events: auto; }
.pl__btn { display: inline-flex; align-items: center; gap: 8px; height: 48px; padding: 0 22px; border-radius: 99px; font-weight: 700; font-size: 0.92rem; transition: transform 0.3s var(--ease-out), background 0.3s, color 0.3s; }
.pl__btn :deep(svg) { width: 18px; height: 18px; }
.pl__btn:hover { transform: translateY(-2px); }
.pl__btn--dl { background: var(--paper); color: var(--ink); }
.pl__btn--dl:hover { background: #fff; }
.pl__btn--wa { background: #1f8f4e; color: #fff; }
.pl__btn--wa:hover { background: #22a35a; }

.pl__close { position: absolute; top: clamp(14px, 3vw, 28px); right: clamp(14px, 3vw, 28px); display: grid; place-items: center; width: 48px; height: 48px; border-radius: 50%; background: var(--paper); color: var(--ink); box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5); transition: background 0.3s, color 0.3s; }
.pl__close:hover { background: var(--chili); color: #fff; }
.pl__close :deep(svg) { width: 20px; height: 20px; }

@media (max-width: 640px) {
  .pl__tag { display: none; }
  .pl__stack { width: 56px; }
  .pl__mini { border-width: 2px; border-radius: 8px; }
  .pl__ghost { border-radius: 8px; }
  .pl__card { --h: min(72svh, calc(92vw * 1.5)); border-radius: 14px; }
  .pl__btn { height: 46px; padding: 0 18px; font-size: 0.88rem; }
  .pl__close { width: 42px; height: 42px; }
}
@media (prefers-reduced-motion: reduce) {
  .pl__mini { animation: none; }
}
</style>
