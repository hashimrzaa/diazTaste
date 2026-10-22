<script setup lang="ts">
import { gsap } from 'gsap'
import { products } from '~/data/products'
import { LIMITS, type Testimonial } from '~/data/inbox'

/* Reviews: approved ones from the database run past in one endless row of
   jar-label cards (pauses on hover/focus), plus a form that sends a new one
   to /admin for approval. */
const { data: reviews } = await useFetch<Testimonial[]>('/api/testimonials', { key: 'testimonials', default: () => [] })

const average = computed(() => (reviews.value.length ? reviews.value.reduce((s, r) => s + r.rating, 0) / reviews.value.length : 0))
const productOf = (slug: string) => products.find((p) => p.slug === slug)
// cards take the colours of the flavour they're about
const tint = (slug: string) => {
  const c = productOf(slug)?.color
  return c && { '--a': c.accent, '--t': c.tint, '--d': c.deep }
}
const initials = (name: string) => name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()

/* The row is the list repeated until it's wide enough to loop, then doubled:
   the track slides by exactly one half, so the seam never shows. */
const MIN_CARDS = 8
const loop = computed(() => {
  const list = reviews.value
  if (!list.length) return []
  const base = Array.from({ length: Math.ceil(MIN_CARDS / list.length) }, () => list).flat()
  return [...base, ...base]
})
const half = computed(() => loop.value.length / 2)

const root = ref<HTMLElement>()
const formEl = ref<HTMLElement>()
const open = ref(false)
const busy = ref(false)
const sent = ref(false)
const error = ref('')
const form = reactive({ name: '', city: '', product: '', rating: 0, message: '', website: '' })

async function toggle() {
  open.value = !open.value
  if (!open.value) return
  sent.value = false
  await nextTick()
  formEl.value?.querySelector<HTMLInputElement>('input')?.focus({ preventScroll: true })
}

async function submit() {
  error.value = ''
  if (!form.rating) { error.value = 'Please pick a star rating.'; return }
  busy.value = true
  try {
    await $fetch('/api/testimonials', { method: 'POST', body: form })
    Object.assign(form, { name: '', city: '', product: '', rating: 0, message: '' })
    sent.value = true
  } catch (e) {
    error.value = (e as { data?: { statusMessage?: string } })?.data?.statusMessage || 'Couldn’t send your review. Please try again.'
  } finally {
    busy.value = false
  }
}

let ctx: gsap.Context | undefined
onMounted(() => {
  ctx = gsap.context(() => {
    gsap.from('.ts__head > *', { y: 30, opacity: 0, stagger: 0.08, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: root.value, start: 'top 80%', once: true } })
    gsap.from('.ts__rail', { x: 160, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.ts__rail', start: 'top 90%', once: true } })
  }, root.value)
})
onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <section id="reviews" ref="root" class="ts cover" aria-labelledby="ts-title">
    <div class="container">
      <div class="ts__head">
        <p class="eyebrow ts__eyebrow"><span>04</span> Kind words</p>
        <h2 id="ts-title" class="display ts__title">Loved in <em>every kitchen.</em></h2>
        <div class="ts__meta">
          <p v-if="reviews.length" class="ts__avg">
            <span class="ts__stars" :aria-label="`Rated ${average.toFixed(1)} out of 5`">
              <AppIcon v-for="n in 5" :key="n" name="star" :class="{ off: n > Math.round(average) }" />
            </span>
            <strong>{{ average.toFixed(1) }}</strong> from {{ reviews.length }} {{ reviews.length === 1 ? 'review' : 'reviews' }}
          </p>
          <button class="btn" :class="open ? 'btn--ghost' : ''" :aria-expanded="open" aria-controls="review-form" @click="toggle">
            <AppIcon :name="open ? 'close' : 'pen'" /> {{ open ? 'Close' : 'Write a review' }}
          </button>
        </div>
      </div>

      <div v-if="open" id="review-form" ref="formEl" class="ts__form">
        <div v-if="sent" class="ts__thanks">
          <p class="display">Shukriya!</p>
          <p>Your review is with us — it shows up here once we’ve had a look.</p>
          <button class="btn btn--ghost" @click="sent = false">Write another</button>
        </div>
        <form v-else @submit.prevent="submit">
          <fieldset class="ts__rate">
            <legend class="field__label">Your rating</legend>
            <label v-for="n in 5" :key="n" :class="{ on: n <= form.rating }" :title="`${n} star${n > 1 ? 's' : ''}`">
              <input v-model="form.rating" type="radio" name="rating" :value="n" class="sr-only" />
              <AppIcon name="star" /><span class="sr-only">{{ n }} star{{ n > 1 ? 's' : '' }}</span>
            </label>
          </fieldset>
          <div class="ts__row">
            <label class="field"><span class="field__label">Name</span><input v-model="form.name" class="input" required :maxlength="LIMITS.name" autocomplete="name" /></label>
            <label class="field"><span class="field__label">City <small>(optional)</small></span><input v-model="form.city" class="input" :maxlength="LIMITS.city" autocomplete="address-level2" /></label>
            <label class="field">
              <span class="field__label">Flavour <small>(optional)</small></span>
              <select v-model="form.product" class="input">
                <option value="">All of them</option>
                <option v-for="p in products" :key="p.slug" :value="p.slug">{{ p.name }}</option>
              </select>
            </label>
          </div>
          <label class="field">
            <span class="field__label">Your review</span>
            <textarea v-model="form.message" class="input" required minlength="10" :maxlength="LIMITS.review" rows="4" placeholder="What did you eat it with? Would you order again?" data-lenis-prevent />
          </label>
          <label class="hp" aria-hidden="true">Website <input v-model="form.website" tabindex="-1" autocomplete="off" /></label>
          <p v-if="error" class="form-msg form-msg--err" role="alert">{{ error }}</p>
          <div class="ts__send">
            <button class="btn" :disabled="busy">{{ busy ? 'Sending…' : 'Send review' }} <AppIcon v-if="!busy" name="arrow" /></button>
            <small>We read every review before it goes up. Only your name and city are shown.</small>
          </div>
        </form>
      </div>

      <p v-if="!reviews.length && !open" class="ts__empty">No reviews yet — be the first to tell us what you think.</p>
    </div>

    <div v-if="reviews.length" class="ts__rail">
      <ul class="ts__track" :style="{ '--dur': `${half * 7}s` }">
        <li
          v-for="(r, i) in loop"
          :key="i"
          class="ts__card"
          :style="[tint(r.product), { '--tilt': `${i % 2 ? 1.6 : -1.6}deg` }]"
          :aria-hidden="i >= reviews.length || undefined"
        >
          <img v-if="productOf(r.product)" :src="productOf(r.product)!.image" alt="" class="ts__jar" width="90" height="120" loading="lazy" />
          <AppIcon name="quote" class="ts__mark" />
          <span class="ts__stars" :aria-label="`${r.rating} out of 5`">
            <AppIcon v-for="n in 5" :key="n" name="star" :class="{ off: n > r.rating }" />
          </span>
          <blockquote class="ts__quote" :title="r.message">{{ r.message }}</blockquote>
          <footer class="ts__by">
            <span class="ts__avatar" aria-hidden="true">{{ initials(r.name) }}</span>
            <span class="ts__who">
              <strong>{{ r.name }}</strong>
              <small>{{ [r.city, productOf(r.product)?.short].filter(Boolean).join(' · ') || 'Verified order' }}</small>
            </span>
          </footer>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.ts { background: var(--cream); padding: clamp(56px, 7vw, 100px) 0; overflow: hidden; }
.ts__head { display: grid; gap: 12px; margin-bottom: clamp(24px, 3.5vw, 40px); }
.ts__eyebrow { display: flex; gap: 12px; color: var(--ink-2); }
.ts__eyebrow span { color: var(--chili); }
.ts__title { font-size: var(--fs-d2); line-height: 0.98; max-width: 14ch; }
.ts__title em { color: var(--chili); }
.ts__meta { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; margin-top: 6px; }
.ts__avg { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; color: var(--ink-2); }
.ts__avg strong { color: var(--ink); font-size: 1.1rem; }

.ts__stars { display: inline-flex; gap: 2px; color: var(--a, var(--chili)); }
.ts__stars .icon { width: 1.05em; height: 1.05em; }
.ts__stars .off { color: color-mix(in srgb, var(--d, var(--ink)) 18%, transparent); }

/* ---------- form ---------- */
.ts__form { margin-bottom: clamp(24px, 3.5vw, 40px); padding: clamp(18px, 3vw, 32px); border-radius: var(--radius-lg); background: color-mix(in srgb, var(--paper) 70%, var(--cream)); box-shadow: inset 0 0 0 1px var(--line); }
.ts__form form { display: grid; gap: 16px; }
.ts__row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.ts__rate { display: flex; align-items: center; gap: 4px; margin: 0; padding: 0; border: 0; }
.ts__rate legend { float: left; margin-right: 12px; }
.ts__rate label { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 10px; color: var(--line-strong); cursor: pointer; transition: color 0.2s, transform 0.2s; }
.ts__rate label .icon { width: 28px; height: 28px; }
.ts__rate label.on { color: var(--chili); }
.ts__rate label:hover { transform: scale(1.12); }
.ts__rate label:has(input:focus-visible) { outline: 2.5px solid var(--chili); outline-offset: 1px; }
.ts__send { display: flex; flex-wrap: wrap; align-items: center; gap: 14px; }
.ts__send small { color: var(--ink-3); max-width: 40ch; }
.ts__send .btn:disabled { opacity: 0.6; cursor: progress; }
.ts__thanks { display: grid; justify-items: start; gap: 10px; }
.ts__thanks .display { font-size: var(--fs-h3); color: var(--chili); }
.ts__empty { color: var(--ink-3); }

/* ---------- the endless row ---------- */
.ts__rail {
  position: relative;
  /* the mask clips at this box, so leave room for the jars peeking out, the
     hover lift and the card shadows; the negative margins keep the spacing */
  margin: -40px 0 -48px;
  padding: 96px 0 88px;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
}
.ts__track {
  display: flex;
  gap: clamp(16px, 2vw, 28px);
  width: max-content;
  padding-left: clamp(16px, 2vw, 28px);
  animation: ts-slide var(--dur, 60s) linear infinite;
}
.ts__rail:hover .ts__track,
.ts__rail:focus-within .ts__track { animation-play-state: paused; }
@keyframes ts-slide {
  to { transform: translateX(-50%); }
}

/* a jar label: tinted paper, stitched edge, flavour colours */
.ts__card {
  --a: var(--chili);
  --d: var(--ink);
  --t: var(--paper);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: none;
  width: clamp(270px, 28vw, 340px);
  height: 300px;
  padding: 26px 26px 22px;
  border-radius: 26px;
  background:
    radial-gradient(120% 80% at 100% 0%, color-mix(in srgb, var(--a) 16%, transparent), transparent 60%),
    var(--t);
  color: var(--d);
  box-shadow: 0 30px 50px -36px color-mix(in srgb, var(--d) 80%, transparent), inset 0 0 0 1px color-mix(in srgb, var(--d) 10%, transparent);
  transform: rotate(var(--tilt));
  transition: transform 0.6s var(--ease-out), box-shadow 0.6s var(--ease-out);
}
.ts__card::before {
  content: '';
  position: absolute;
  inset: 9px;
  border-radius: 19px;
  border: 1.5px dashed color-mix(in srgb, var(--d) 22%, transparent);
  pointer-events: none;
}
.ts__card:hover {
  transform: rotate(0deg) translateY(-12px) scale(1.03);
  box-shadow: 0 44px 60px -34px color-mix(in srgb, var(--d) 90%, transparent), inset 0 0 0 1px color-mix(in srgb, var(--d) 14%, transparent);
  z-index: 2;
}
.ts__jar {
  position: absolute;
  top: -40px;
  right: 14px;
  width: 64px;
  height: auto;
  filter: drop-shadow(0 10px 12px rgba(30, 15, 10, 0.3));
  transform: rotate(10deg);
  transition: transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.ts__card:hover .ts__jar { transform: rotate(-8deg) translateY(-10px) scale(1.12); }
.ts__mark {
  position: absolute;
  right: 18px;
  bottom: 14px;
  width: 84px;
  height: 84px;
  color: var(--a);
  opacity: 0.12;
  transition: opacity 0.5s, transform 0.6s var(--ease-out);
}
.ts__card:hover .ts__mark { opacity: 0.22; transform: rotate(-10deg) scale(1.1); }
.ts__quote {
  position: relative;
  margin: 0;
  font-size: 1rem;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 6;
  line-clamp: 6;
  overflow: hidden;
}
.ts__by { position: relative; display: flex; align-items: center; gap: 12px; margin-top: auto; }
.ts__avatar { display: grid; place-items: center; width: 42px; height: 42px; flex: none; border-radius: 50%; background: var(--a); color: #fff; font-family: var(--font-display); font-weight: 700; font-size: 0.85rem; letter-spacing: 0; }
.ts__who { display: grid; line-height: 1.3; min-width: 0; }
.ts__who strong { font-size: 0.95rem; }
.ts__who small { font-size: 0.8rem; opacity: 0.7; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

@media (max-width: 760px) {
  .ts__row { grid-template-columns: 1fr; }
  .ts__card { height: 290px; }
}
@media (prefers-reduced-motion: reduce) {
  .ts__rail { overflow-x: auto; -webkit-mask-image: none; mask-image: none; }
  .ts__track { animation: none; }
  .ts__card { transform: none; }
}
</style>
