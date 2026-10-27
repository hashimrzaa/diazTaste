<script setup lang="ts">
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { products, countWord, sizesShort } from '~/data/products'
const lead = `${countWord()} chutneys cooked the way Ammi always made them — real fruit, fresh herbs, nothing added.`
const sizes = sizesShort()

/* Hero, one straight line:  Dia's  |  jar on a light disc  |  Taste
   under "Dia's": description + stats · under "Taste": the white flavour card.
   Sizes follow the viewport height so every screen looks like the laptop.
   Mobile: "Dia's Taste" on one line, the jar, then the description.
   Letter under the cursor lifts · jar hover = one turn to the label.
   Scroll: copy fades, cap opens, labelled ingredients, they drop in, cap closes. */
const root = ref<HTMLElement>()
const introDone = useIntroDone()
const progress = useLoadProgress()
const active = useHeroFlavour()
const noWebGL = useNoWebGL()
const stageReady = useStageReady()
/** photo stand-in: no WebGL at all, or the 3D jar is still on its way */
const still = computed(() => noWebGL.value || !stageReady.value)
/* The disc and hit area sit at a fixed anchor (their CSS box never moves) and
   follow the 3D jar only through translate/scale — so tracking the jar every
   frame costs no layout and never counts as a layout shift. */
const anchor = reactive({ ax: 0, ay: 0, dn: 0 })
function measure() {
  const d = root.value?.querySelector<HTMLElement>('.hx__disc')
  if (d) Object.assign(anchor, { ax: d.offsetLeft, ay: d.offsetTop, dn: d.offsetWidth })
}
const anchorVars = computed(() => ({
  '--ax': anchor.ax,
  '--ay': anchor.ay,
  '--dn': anchor.dn || 1,
  // photo mode: pretend the jar sits exactly on the anchor
  ...(still.value && { '--jar-xn': anchor.ax, '--jar-yn': anchor.ay, '--jar-hn': anchor.dn * (isMobile() ? 0.72 : 0.8) }),
}))
let ro: ResizeObserver | undefined
const p = computed(() => products[active.value]!)
const callouts = computed(() => p.value.ingredients.slice(0, 4).map((k, i) => ({ k: k.replace(/\s*\(.*?\)/g, ''), pos: ['tl', 'tr', 'bl', 'br'][i]! })))
let ctx: gsap.Context | undefined
let split: SplitText[] = []
let chars: HTMLElement[] = []
let played = false
let floatTl: gsap.core.Timeline | undefined

const base = () => (isMobile() ? { x: 0, y: -0.085, scale: 0.62 } : { x: 0, y: -0.02, scale: 0.8 })

function intro() {
  if (played) return
  played = true
  const reduce = prefersReducedMotion()
  const b = base()
  gsap.timeline({ defaults: { ease: 'expo.out' } })
    .fromTo('.hx__disc', { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: reduce ? 0.01 : 1.3 }, 0)
    .fromTo(stageState, { y: b.y - 0.1, opacity: 0, spin: -Math.PI }, { y: b.y, opacity: 1, spin: 0, duration: reduce ? 0.01 : 1.6, ease: 'power3.out' }, 0.15)
    .to(stageState, { ingredients: 1, duration: 1.2, ease: 'power2.out' }, 0.5)
    .fromTo(chars, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.05 }, 0.05)
    .from('.hx__reveal', { y: 16, opacity: 0, duration: 0.9, stagger: 0.08 }, 0.6)
    .call(() => {
      if (prefersReducedMotion()) return
      floatTl = gsap.timeline({ repeat: -1, yoyo: true }).to(chars, { y: -6, duration: 1.4, ease: 'sine.inOut', stagger: 0.09 })
    })
}

function lift(e: PointerEvent) {
  const c = (e.target as HTMLElement).closest('.hx__c')
  if (c) gsap.to(c, { yPercent: -18, rotate: -4, duration: 0.35, ease: 'back.out(3)', overwrite: 'auto' })
}
function drop(e: PointerEvent) {
  const c = (e.target as HTMLElement).closest('.hx__c')
  if (c) gsap.to(c, { yPercent: 0, rotate: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' })
}
function turnToFront() {
  const TAU = Math.PI * 2
  gsap.to(stageState, { spin: (Math.floor(stageState.spin / TAU) + 1) * TAU, idle: 0, duration: 1.3, ease: 'power3.inOut', overwrite: 'auto' })
}
function releaseJar() { /* stay label-front */ }

watch(active, (i) => {
  gsap.timeline()
    .to(stageState, { opacity: 0, duration: 0.25, ease: 'power2.in' })
    .call(() => { stageState.flavour = i })
    .to({}, { duration: 0.1 })
    .fromTo(stageState, { spin: stageState.spin - 1.2 }, { spin: stageState.spin, opacity: 1, duration: 0.8, ease: 'power3.out' })
})

onMounted(() => {
  gsap.set(stageState, { ...base(), spin: 0, tilt: 0, cap: 0, spread: 0.35, ingredients: 0, opacity: 0, idle: 1, flavour: active.value, lineup: 0, mix: 0, push: 0 })
  ctx = gsap.context(() => {
    split = gsap.utils.toArray<HTMLElement>('.hx__w').map((el) => SplitText.create(el, { type: 'chars', charsClass: 'hx__c' }))
    chars = split.flatMap((s) => s.chars as HTMLElement[])
    gsap.set(chars, { opacity: 0 })
    gsap.set('.hx__callout', { autoAlpha: 0 })
    const mm = gsap.matchMedia()
    mm.add({ desktop: '(min-width: 769px)', mobile: '(max-width: 768px)' }, (c) => {
      const m = c.conditions!.mobile
      const b = m ? { y: -0.085, scale: 0.62 } : { y: -0.02, scale: 0.8 }
      gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: root.value, start: 'top top', end: 'bottom bottom', scrub: 0.3 } })
        .to(['.hx__row', '.hx__notes', '.hx__mtitle', '.hx__mcopy', '.hx__recipe'], { autoAlpha: 0, y: -30, duration: 0.1 }, 0)
        .fromTo(stageState, b, { y: m ? -0.03 : -0.02, scale: m ? 0.72 : 0.9, duration: 0.14, ease: 'power2.inOut', immediateRender: false }, 0.02)
        .fromTo(stageState, { cap: 0, spread: 0.35 }, { cap: 1, spread: 1.5, duration: 0.18, ease: 'power2.out', immediateRender: false }, 0.14)
        .fromTo('.hx__callout', { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, stagger: 0.03, duration: 0.06, immediateRender: false }, 0.26)
        .to('.hx__callout', { autoAlpha: 0, duration: 0.05 }, 0.5)
        .fromTo(stageState, { mix: 0 }, { mix: 1, duration: 0.26, ease: 'power1.inOut', immediateRender: false }, 0.52)
        .to(stageState, { cap: 0, duration: 0.12, ease: 'power2.inOut' }, 0.8)
        .fromTo(stageState, { spin: 0 }, { spin: Math.PI * 2, duration: 1, ease: 'power1.inOut', immediateRender: false }, 0)
    })
  }, root.value)
  measure()
  ro = new ResizeObserver(measure)
  ro.observe(root.value!.querySelector('.hx__back')!)
  const ready = () => introDone.value && progress.value >= 1
  if (ready()) intro()
  else {
    const stop = watch([introDone, progress], () => { if (ready()) { stop(); intro() } })
  }
})
onBeforeUnmount(() => { ro?.disconnect(); floatTl?.kill(); split.forEach((s) => s.revert()); ctx?.revert() })
</script>

<template>
  <section id="top" ref="root" class="hx" :class="{ nogl: still }" :style="{ '--a': p.color.accent, '--d': p.color.deep, '--t': p.color.tint, ...anchorVars }" aria-labelledby="hx-title">
    <div class="hx__back">
      <div class="hx__disc" aria-hidden="true"><span class="hx__dshadow" /><span class="hx__face"><span class="hx__glow" /></span></div>
      <Transition name="still">
        <img v-if="still" :key="p.slug" :src="p.image" :alt="`${p.name} jar`" class="hx__still" width="400" height="530" fetchpriority="high" />
      </Transition>
    </div>

    <div class="hx__front">
      <h1 id="hx-title" class="sr-only">Dia’s Taste — homemade chutneys</h1>

      <div class="hx__row">
        <div class="hx__col hx__col--l">
          <div class="hx__stack">
            <span class="hx__w display" aria-hidden="true" @pointerover="lift" @pointerout="drop">Dia’s</span>
            <div class="hx__copy hx__reveal">
              <p class="hx__lead">{{ lead }}</p>
              <dl class="hx__stats">
                <div><dt>Homemade</dt><dd class="display">100%</dd></div>
                <div><dt>Additives</dt><dd class="display">0</dd></div>
                <div><dt>Jar sizes</dt><dd class="display">{{ sizes }}</dd></div>
              </dl>
            </div>
          </div>
        </div>
        <div class="hx__gap" />
        <div class="hx__col hx__col--r">
          <div class="hx__stack">
            <span class="hx__w hx__w--red display" aria-hidden="true" @pointerover="lift" @pointerout="drop">Taste</span>
            <NuxtLink :to="`/chutney/${p.slug}`" class="hx__fname hx__reveal">
              <span class="hx__fname-in display"><span v-for="(ch, ci) in p.name" :key="p.slug + ci" class="hx__fl" :style="{ '--i': ci }">{{ ch === ' ' ? ' ' : ch }}</span></span>
              <AppIcon name="arrow" />
            </NuxtLink>
          </div>
        </div>
      </div>

      <div class="hx__notes hx__reveal" aria-hidden="true">
        <div class="hx__note n-heat"><span class="hx__nt"><span class="hx__nk">Heat</span><span class="hx__dots"><i v-for="n in 5" :key="n" :class="{ on: n <= p.taste.heat }" /></span></span><svg class="hx__arr" viewBox="0 0 120 50" aria-hidden="true"><path d="M2 8 H44 L112 44" /><path class="hx__ah" d="M100 44 L113 45 L107 33" /></svg></div>
        <div class="hx__note n-sweet"><span class="hx__nt"><span class="hx__nk">Sweet</span><span class="hx__dots"><i v-for="n in 5" :key="n" :class="{ on: n <= p.taste.sweet }" /></span></span><svg class="hx__arr" viewBox="0 0 120 50" aria-hidden="true"><path d="M2 8 H44 L112 44" /><path class="hx__ah" d="M100 44 L113 45 L107 33" /></svg></div>
        <div class="hx__note n-tangy"><span class="hx__nt"><span class="hx__nk">Tangy</span><span class="hx__dots"><i v-for="n in 5" :key="n" :class="{ on: n <= p.taste.tangy }" /></span></span><svg class="hx__arr" viewBox="0 0 120 50" aria-hidden="true"><path d="M2 8 H44 L112 44" /><path class="hx__ah" d="M100 44 L113 45 L107 33" /></svg></div>
      </div>

      <p class="hx__mtitle display hx__reveal" aria-hidden="true">Dia’s <span>Taste</span></p>
      <div class="hx__recipe hx__reveal">
        <span class="hx__rk eyebrow">Quick recipe</span>
        <strong class="display">{{ p.recipe.title }}</strong>
        <ol><li v-for="(st, si) in p.recipe.steps" :key="si">{{ st }}</li></ol>
      </div>
      <div class="hx__mcopy hx__reveal">
        <p>{{ lead }}</p>
        <dl class="hx__mstats">
          <div><dd class="display">100%</dd><dt>Homemade</dt></div>
          <div><dd class="display">0</dd><dt>Additives</dt></div>
          <div><dd class="display">{{ sizes }}</dd><dt>Jar sizes</dt></div>
        </dl>
      </div>

      <div class="hx__hot" aria-hidden="true" @pointerenter="turnToFront" @pointerleave="releaseJar" />
      <div v-for="c in callouts" :key="c.pos" class="hx__callout" :class="`p-${c.pos}`" aria-hidden="true">
        <span class="hx__ck display">{{ c.k }}</span><svg class="hx__arr" viewBox="0 0 120 50" aria-hidden="true"><path d="M2 8 H44 L112 44" /><path class="hx__ah" d="M100 44 L113 45 L107 33" /></svg>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hx { --D: min(56vh, 38vw); position: relative; height: 340vh; height: 340svh; }
.hx__back, .hx__front { position: sticky; top: 0; height: 100vh; height: 100svh; overflow: hidden; }
.hx__back { z-index: 0; }
.hx__front { z-index: 3; margin-top: -100vh; margin-top: -100svh; pointer-events: none; }
.hx__front a, .hx__front button { pointer-events: auto; }

.hx__disc { position: absolute; left: 50%; top: 52%; width: var(--D); aspect-ratio: 1;
  translate: calc(-50% + (var(--jar-xn, var(--ax, 0)) - var(--ax, 0)) * 1px) calc(-50% + (var(--jar-yn, var(--ay, 0)) - var(--ay, 0)) * 1px);
  scale: calc(var(--jar-hn, calc(var(--dn, 1) * 0.8)) * 1.26 / var(--dn, 1)); }
/* the face clips the moving glow; the soft shadow is a plain gradient below it
   (a blurred box-shadow on a scaled layer rasterised as a hard-edged box) */
.hx__face { position: absolute; inset: 0; border-radius: 50%; overflow: hidden;
  background: radial-gradient(circle at 35% 30%, #fff 0%, var(--t) 45%, color-mix(in srgb, var(--a) 35%, var(--t)) 100%); transition: background 0.8s var(--ease-out); }
.hx__dshadow { position: absolute; left: 8%; right: 8%; top: 62%; height: 52%; border-radius: 50%;
  background: radial-gradient(closest-side, color-mix(in srgb, var(--a) 38%, transparent), transparent); transition: background 0.8s; }
.hx__glow { position: absolute; left: 30%; top: 25%; width: 70%; aspect-ratio: 1; transform: translate(-50%, -50%); border-radius: 50%; background: radial-gradient(closest-side, rgba(255, 255, 255, 0.7), transparent 70%); animation: glow 8s ease-in-out infinite alternate; }
/* no WebGL: a still photo of the jar stands in for the 3D one */
.hx__still { position: absolute; left: 50%; top: 52%; height: calc(var(--D) * 0.864); width: auto; translate: -50% -50%; object-fit: contain; filter: drop-shadow(0 30px 30px rgba(30, 15, 10, 0.25)); animation: still-in 0.8s var(--ease-out); }
@keyframes still-in { from { opacity: 0; transform: translateY(20px); } }
.still-leave-active { transition: opacity 0.7s ease 0.15s; }
.still-leave-to { opacity: 0; }
@keyframes glow { to { transform: translate(-4.3%, -28.6%); } }

/* one straight line; each word fills its side, copy sits under it at the word's width */
.hx { --col: calc((100vw - var(--D) - 6vh - 2 * var(--gutter)) / 2); --fsL: min(calc(var(--col) / 2.95), 19vh); --fsR: min(calc(var(--col) / 3.45), 17vh); }
.hx__row { position: absolute; left: 0; right: 0; top: 52%; translate: 0 calc(var(--fsR) * -0.62); display: grid; grid-template-columns: 1fr calc(var(--D) + 6vh) 1fr; align-items: start; padding: 0 var(--gutter); }
.hx__col { display: flex; }
.hx__col--l { justify-content: flex-end; padding-right: 3.5vh; }
.hx__col--r { justify-content: flex-start; }
.hx__stack { display: flex; flex-direction: column; gap: 2.6vh; width: min-content; }
.hx__w { display: block; font-size: var(--fsL); font-weight: 800; line-height: 1; letter-spacing: -0.045em; white-space: nowrap; pointer-events: auto; }
.hx__w--red { font-size: var(--fsR); padding-right: 0.06em; background: linear-gradient(100deg, var(--a) 0%, color-mix(in srgb, var(--a) 55%, #fff) 35%, var(--a) 60%, var(--d) 100%) 0 0 / 220% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; animation: shine 6s linear 2.5s 2; }
.hx__w--red:hover { animation: shine 3s linear infinite; }
.hx__w--red :deep(.hx__c) { background: inherit; -webkit-background-clip: text; background-clip: text; padding: 0 0.08em; margin: 0 -0.08em; }
@keyframes shine { to { background-position: -220% 0; } }
:deep(.hx__c) { display: inline-block; will-change: transform; cursor: default; }

.hx__copy { width: 0; min-width: 100%; }
.hx__lead { font-size: clamp(0.9rem, 2.2vh, 1.2rem); line-height: 1.55; color: var(--ink-2); }
.hx__stats { display: flex; justify-content: space-between; gap: 2vh; margin-top: 2.2vh; padding-top: 2vh; border-top: 1px solid var(--line); }
.hx__stats div { display: flex; flex-direction: column-reverse; }
.hx__stats dt { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-3); }
.hx__stats dd { font-size: clamp(1.1rem, 3.4vh, 2rem); line-height: 1.1; }


/* flavour name under "Taste" — letters ripple on hover */
.hx__fname { pointer-events: auto; display: inline-flex; align-items: center; gap: 10px; width: max-content; color: var(--d); padding-top: 1.4vh; border-top: 1.5px solid color-mix(in srgb, var(--a) 40%, transparent); }
.hx__fname-in { font-size: clamp(1.2rem, 3.4vh, 2rem); }
.hx__fl { display: inline-block; transition: transform 0.45s var(--ease-out), color 0.3s; transition-delay: calc(var(--i) * 18ms); }
.hx__fname:hover .hx__fl { transform: translateY(-0.28em) rotate(-4deg); color: var(--a); }
.hx__fname :deep(svg) { transition: transform 0.4s var(--ease-out); }
.hx__fname:hover :deep(svg) { transform: translateX(6px); }

/* taste notes with elbow arrows pointing at the jar */
.hx__notes { position: absolute; inset: 0; pointer-events: none; }
.hx__note { position: absolute; display: flex; align-items: flex-start; }
.hx__nt { display: grid; gap: 6px; }
.hx__nk { font-family: var(--font-display); font-size: clamp(1rem, 2.6vh, 1.5rem); font-weight: 700; color: var(--ink); }
.hx__dots { display: flex; gap: 5px; }
.hx__dots i { width: 11px; height: 11px; border-radius: 50%; background: var(--line-strong); }
.hx__dots i.on { background: var(--a); }
.hx__arr { width: clamp(70px, 11vh, 120px); height: auto; margin-top: 10px; overflow: visible; }
.hx__arr path { fill: none; stroke: var(--ink); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; opacity: 0.55; }
.hx__arr .hx__ah { stroke: var(--a); opacity: 1; }
.n-heat { right: calc(50% + var(--D) * 0.3); top: calc(52% - var(--D) * 0.5); }
.n-sweet { left: calc(50% + var(--D) * 0.3); top: calc(52% - var(--D) * 0.5); flex-direction: row-reverse; }
.n-sweet .hx__arr { transform: scaleX(-1); }
.n-sweet .hx__nt { justify-items: end; }
.n-tangy { left: calc(50% + var(--D) * 0.3); top: calc(52% + var(--D) * 0.36); flex-direction: row-reverse; align-items: flex-end; }
.n-tangy .hx__arr { transform: scale(-1, -1); margin: 0 0 10px; }
.n-tangy .hx__nt { justify-items: end; }

.hx__recipe { display: none; }
.hx__mtitle, .hx__mcopy { display: none; }
.hx__hot { position: absolute; left: 50%; top: 52%; width: calc(var(--D) * 0.5); height: calc(var(--D) * 0.9);
  translate: calc(-50% + (var(--jar-xn, var(--ax, 0)) - var(--ax, 0)) * 1px) calc(-50% + (var(--jar-yn, var(--ay, 0)) - var(--ay, 0)) * 1px); pointer-events: auto; cursor: grab; }

.hx__callout { position: absolute; display: flex; align-items: flex-start; }
.hx__ck { font-size: clamp(1rem, 2.8vh, 1.6rem); line-height: 1; white-space: nowrap; }
.p-tl { right: calc(50% + var(--D) * 0.3); top: calc(50% - var(--D) * 0.52); }
.p-tr { left: calc(50% + var(--D) * 0.3); top: calc(50% - var(--D) * 0.52); flex-direction: row-reverse; }
.p-tr .hx__arr { transform: scaleX(-1); }
.p-bl { right: calc(50% + var(--D) * 0.3); top: calc(50% + var(--D) * 0.34); align-items: flex-end; }
.p-bl .hx__arr { transform: scaleY(-1); margin: 0 0 10px; }
.p-br { left: calc(50% + var(--D) * 0.3); top: calc(50% + var(--D) * 0.34); flex-direction: row-reverse; align-items: flex-end; }
.p-br .hx__arr { transform: scale(-1, -1); margin: 0 0 10px; }

@media (max-width: 768px) {
  .hx { --D: min(38vh, 78vw); }
  .hx__row, .hx__notes { display: none; }
  .hx__disc, .hx__hot, .hx__still { top: 57%; }
  .hx__still { height: calc(var(--D) * 0.78); }
  .hx__mtitle { display: block; position: absolute; left: 0; right: 0; top: 92px; text-align: center; font-size: clamp(2.2rem, 11vw, 3rem); font-weight: 800; letter-spacing: -0.04em; }
  .hx__mtitle span { color: var(--a); transition: color 0.6s; }
  .hx__recipe { display: grid; gap: 4px; position: absolute; left: var(--gutter); right: var(--gutter); top: 150px; padding: 12px 16px; border-radius: 18px; background: #fff; box-shadow: 0 16px 36px -24px rgba(30, 15, 10, 0.4), inset 0 0 0 1px var(--line); border-left: 5px solid var(--a); }
  .hx__rk { color: var(--a); font-size: 0.62rem; }
  .hx__recipe strong { font-size: 1rem; }
  .hx__recipe ol { margin: 2px 0 0; padding-left: 18px; list-style: decimal; font-size: 0.8rem; line-height: 1.45; color: var(--ink-2); }
  .hx__mstats { display: flex; justify-content: space-around; margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--line); }
  .hx__mstats div { display: grid; justify-items: center; }
  .hx__mstats dd { font-size: 1.4rem; line-height: 1.1; }
  .hx__mstats dt { font-size: 0.64rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-3); }
  .hx__mcopy { display: block; position: absolute; left: var(--gutter); right: var(--gutter); top: calc(57% + var(--D) / 2 + 14px); text-align: center; font-size: 0.95rem; line-height: 1.5; color: var(--ink-2); }
  /* label at the screen edge, arrow tucked under/over it pointing in at the jar */
  .hx__callout { flex-direction: column; gap: 6px; }
  .hx__callout .hx__arr { width: 64px; margin: 0; }
  .hx__callout .hx__ck { font-size: 0.8rem; }
  .p-tl, .p-tr { top: 57%; translate: 0 calc((var(--jar-yn, var(--ay, 0)) - var(--ay, 0) - var(--jar-hn, 150) * 0.42) * 1px); }
  .p-bl, .p-br { top: 57%; translate: 0 calc((var(--jar-yn, var(--ay, 0)) - var(--ay, 0) + var(--jar-hn, 150) * 0.08) * 1px); flex-direction: column-reverse; }
  .p-tl, .p-bl { left: var(--gutter); right: auto; align-items: flex-start; }
  .p-tr, .p-br { right: var(--gutter); left: auto; align-items: flex-end; }
  .p-tl .hx__arr, .p-bl .hx__arr { margin-left: 24px; }
  .p-tr .hx__arr, .p-br .hx__arr { margin-right: 24px; }
  .p-bl .hx__arr, .p-br .hx__arr { margin: 0; }
  .p-bl .hx__arr { margin-left: 24px; } .p-br .hx__arr { margin-right: 24px; }
}
</style>
