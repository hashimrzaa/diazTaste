<script setup lang="ts">
import { gsap } from 'gsap'

/* Agrumea-style opening: a serif % counter driven by the REAL 3D load, while
   flat ingredient silhouettes tumble in and pile up from the bottom until they
   fill the screen. At 100% a chilli-red panel sweeps up and lifts away. */
const progress = useLoadProgress()
const introDone = useIntroDone()
const root = ref<HTMLElement>()
const shown = ref(0)
const visible = ref(true)
const pieces = ref<{ t: string; x: number; y: number; s: number; r: number; c: string }[]>([])
let dropped = 0
let tw: gsap.core.Tween | undefined
let started = 0
let leaving = false

const KINDS = [
  { t: 'chili', c: '#d2232a' }, { t: 'leaf', c: '#3f8a1c' }, { t: 'lemon', c: '#f2c230' },
  { t: 'garlic', c: '#d8c3a0' }, { t: 'plum', c: '#6a1c45' }, { t: 'date', c: '#6b2f12' },
  { t: 'pod', c: '#9a6232' }, { t: 'chili2', c: '#e8641b' }, { t: 'leaf2', c: '#5aa531' },
]

function layout() {
  const w = window.innerWidth
  const h = window.innerHeight
  const cols = w < 640 ? 5 : w < 1100 ? 7 : 9
  const size = w / cols
  const rows = Math.ceil(h / (size * 0.78)) + 1
  const out: typeof pieces.value = []
  for (let r = 0; r < rows; r++) {
    const row = []
    for (let c = 0; c < cols; c++) {
      const k = KINDS[(r * 7 + c * 3 + ((r * c) % 5)) % KINDS.length]!
      row.push({ t: k.t, c: k.c, s: size * (1.05 + ((r + c) % 3) * 0.12), x: c * size + size * 0.5 + (((r * 13 + c * 7) % 9) - 4) * size * 0.05, y: h - r * size * 0.78 - size * 0.42, r: ((r * 37 + c * 53) % 120) - 60 })
    }
    // drop each row in a shuffled order so the pile builds naturally
    row.sort((a, b) => Math.sin(a.x * 12.9898 + r) - Math.sin(b.x * 12.9898 + r))
    out.push(...row)
  }
  pieces.value = out
}

function dropTo(p: number) {
  const els = root.value?.querySelectorAll<HTMLElement>('.sp__p')
  if (!els) return
  const target = Math.floor(p * els.length)
  for (; dropped < target; dropped++) {
    const el = els[dropped]!
    const piece = pieces.value[dropped]!
    gsap.fromTo(el, { y: -piece.s * 1.4 - Math.random() * 200, rotation: piece.r - 90, opacity: 1 },
      { y: piece.y - piece.s / 2, rotation: piece.r, duration: 0.7 + Math.random() * 0.35, ease: 'bounce.out', delay: Math.random() * 0.12 })
  }
}

function leave() {
  if (leaving) return
  leaving = true
  dropTo(1)
  const reduce = prefersReducedMotion()
  gsap.timeline({ delay: reduce ? 0 : 0.55, onComplete: () => { visible.value = false; lockScroll(false) } })
    .to('.sp__panel', { yPercent: 0, duration: reduce ? 0.01 : 0.75, ease: 'expo.inOut' })
    .set(['.sp__pile', '.sp__count'], { autoAlpha: 0 })
    .call(() => { introDone.value = true })
    .to('.sp__panel', { yPercent: -100, duration: reduce ? 0.01 : 0.85, ease: 'expo.inOut' }, '+=0.05')
    .to('.sp__bg', { autoAlpha: 0, duration: 0.01 }, '<')
}

watch(progress, (p) => {
  tw?.kill()
  tw = gsap.to(shown, { value: p, duration: 0.5, ease: 'power2.out',
    onUpdate: () => dropTo(Math.min(shown.value, 0.97)),
    onComplete: () => { if (p >= 1) setTimeout(leave, Math.max(0, 1500 - (performance.now() - started))) } })
})

onMounted(async () => {
  started = performance.now()
  lockScroll(true)
  layout()
  await nextTick()
  gsap.set('.sp__panel', { yPercent: 100 })
  gsap.set('.sp__p', { opacity: 0 })
  if (progress.value > 0) dropTo(Math.min(progress.value, 0.97))
  if (progress.value >= 1) setTimeout(leave, 1500)
  setTimeout(() => { if (!introDone.value) progress.value = 1 }, 9000) // never strand anyone
})
</script>

<template>
  <div v-if="visible" ref="root" class="sp" role="status" aria-live="polite">
    <span class="sr-only">Loading Dia’s Taste</span>
    <div class="sp__bg" />
    <p class="sp__count display" aria-hidden="true">{{ Math.round(shown * 100) }}%</p>
    <div class="sp__pile" aria-hidden="true">
      <span v-for="(p, i) in pieces" :key="i" class="sp__p" :style="{ left: p.x - p.s / 2 + 'px', width: p.s + 'px', height: p.s + 'px', color: p.c }">
        <svg v-if="p.t.startsWith('chili')" viewBox="0 0 100 100"><path d="M26 22c8-4 14 2 12 8 18-8 40 0 44 22 4 22-12 36-30 40-14 3-26-2-30-12 12 2 22-4 26-14C52 54 40 46 28 40c-6-3-8-12-2-18z" fill="currentColor"/><path d="M28 24c-4-6-2-14 6-16 2 6-2 12-6 16z" fill="#2f6e14"/></svg>
        <svg v-else-if="p.t.startsWith('leaf')" viewBox="0 0 100 100"><path d="M86 14C46 16 14 44 14 86c40 0 70-30 72-72z" fill="currentColor"/></svg>
        <svg v-else-if="p.t === 'lemon'" viewBox="0 0 100 100"><path d="M50 10c22 0 40 18 40 40S72 90 50 90 10 72 10 50c0-8 4-16 8-20-2-6 2-12 8-12 6-6 14-8 24-8z" fill="currentColor"/></svg>
        <svg v-else-if="p.t === 'garlic'" viewBox="0 0 100 100"><path d="M50 8c4 10 4 16 8 20 16 6 28 20 28 36 0 18-16 28-36 28S14 82 14 64c0-16 12-30 28-36 4-4 4-10 8-20z" fill="currentColor"/></svg>
        <svg v-else-if="p.t === 'plum'" viewBox="0 0 100 100"><path d="M50 18c20-4 36 12 36 34S70 90 50 90 14 74 14 52s16-38 36-34z" fill="currentColor"/><path d="M50 18c0-6 4-10 10-12" stroke="#3f8a1c" stroke-width="5" fill="none" stroke-linecap="round"/></svg>
        <svg v-else-if="p.t === 'date'" viewBox="0 0 100 100"><ellipse cx="50" cy="50" rx="24" ry="40" transform="rotate(25 50 50)" fill="currentColor"/></svg>
        <svg v-else viewBox="0 0 100 100"><path d="M10 56c6-14 16-12 22-20 8-10 18-12 26-6 8-8 22-6 30 6 6 10 0 20-10 22-6 10-20 12-28 4-10 6-24 6-32 2-6-2-10-4-8-8z" fill="currentColor"/></svg>
      </span>
    </div>
    <div class="sp__panel"><span class="sp__badge"><BrandLogo /></span></div>
  </div>
</template>

<style scoped>
.sp { position: fixed; inset: 0; z-index: 300; overflow: hidden; }
.sp__bg { position: absolute; inset: 0; background: var(--cream); }
.sp__count { position: absolute; left: 50%; top: 42%; transform: translate(-50%, -50%); font-size: clamp(3.6rem, 9vw, 7.5rem); color: var(--chili); font-variant-numeric: tabular-nums; line-height: 1; }
.sp__pile { position: absolute; inset: 0; }
.sp__p { position: absolute; top: 0; will-change: transform; }
.sp__p svg { width: 100%; height: 100%; display: block; }
.sp__panel { position: absolute; inset: 0; display: grid; place-items: center; background: var(--chili); }
.sp__badge { display: grid; place-items: center; width: clamp(150px, 22vh, 210px); aspect-ratio: 1; border-radius: 50%; background: var(--cream); --logo-h: 86%; box-shadow: 0 30px 60px -30px rgba(0, 0, 0, 0.45); }
</style>
