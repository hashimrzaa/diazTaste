<script setup lang="ts">
import { gsap } from 'gsap'
import { WHATSAPP_TEL, WHATSAPP_DISPLAY } from '~/data/products'
import { ENQUIRY_KINDS, LIMITS, type EnquiryKind } from '~/data/inbox'

/* Custom orders: a made-to-order chutney, achaar, or a bulk order for an
   event. The request lands in /admin → Enquiries; we reply by phone/WhatsApp. */
const root = ref<HTMLElement>()
const busy = ref(false)
const sent = ref(false)
const error = ref('')
const form = reactive({ name: '', phone: '', email: '', kind: 'chutney' as EnquiryKind, quantity: '', message: '', website: '' })
const kinds = Object.entries(ENQUIRY_KINDS) as [EnquiryKind, string][]

async function submit() {
  error.value = ''
  busy.value = true
  try {
    await $fetch('/api/enquiries', { method: 'POST', body: form })
    Object.assign(form, { name: '', phone: '', email: '', kind: 'chutney', quantity: '', message: '' })
    sent.value = true
  } catch (e) {
    error.value = (e as { data?: { statusMessage?: string } })?.data?.statusMessage || 'Couldn’t send your message. Please try again, or message us on WhatsApp.'
  } finally {
    busy.value = false
  }
}

let ctx: gsap.Context | undefined
onMounted(() => {
  ctx = gsap.context(() => {
    gsap.from('.ct__intro > *, .ct__card', { y: 40, opacity: 0, stagger: 0.08, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: root.value, start: 'top 80%', once: true } })
  }, root.value)
})
onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <section id="contact" ref="root" class="ct cover" aria-labelledby="ct-title">
    <div class="container ct__grid">
      <div class="ct__intro">
        <p class="eyebrow ct__eyebrow"><span>05</span> Custom orders</p>
        <h2 id="ct-title" class="display ct__title">Something <em>special?</em></h2>
        <p class="lead">A chutney cooked your way, Ammi’s achaar, or jars for a dawat — tell us what you’d like and we’ll get back to you with a price.</p>
        <ul class="ct__list">
          <li><AppIcon name="sparkle" /> Your spice level, or a flavour we don’t make yet</li>
          <li><AppIcon name="leaf" /> Homemade achaar — aam, nimbu, mixed</li>
          <li><AppIcon name="check" /> Bulk jars for weddings, events &amp; gifting</li>
        </ul>
        <p class="ct__alt">Rather talk? <a :href="WHATSAPP_TEL" target="_blank" rel="noopener"><AppIcon name="whatsapp" /> {{ WHATSAPP_DISPLAY }}</a></p>
      </div>

      <div class="ct__card">
        <div v-if="sent" class="ct__thanks" role="status">
          <p class="display">Got it — shukriya!</p>
          <p>We’ll call or WhatsApp you soon to talk it through.</p>
          <button class="btn btn--ghost" @click="sent = false">Send another request</button>
        </div>
        <form v-else @submit.prevent="submit">
          <fieldset class="ct__kinds">
            <legend class="field__label">What would you like?</legend>
            <label v-for="[k, label] in kinds" :key="k" :class="{ on: form.kind === k }">
              <input v-model="form.kind" type="radio" name="kind" :value="k" class="sr-only" />{{ label }}
            </label>
          </fieldset>
          <div class="ct__row">
            <label class="field"><span class="field__label">Name</span><input v-model="form.name" class="input" required :maxlength="LIMITS.name" autocomplete="name" /></label>
            <label class="field"><span class="field__label">Phone / WhatsApp</span><input v-model="form.phone" class="input" type="tel" required :maxlength="LIMITS.phone" autocomplete="tel" placeholder="0300 1234567" /></label>
            <label class="field"><span class="field__label">Email <small>(optional)</small></span><input v-model="form.email" class="input" type="email" :maxlength="LIMITS.email" autocomplete="email" /></label>
            <label class="field"><span class="field__label">How much <small>(optional)</small></span><input v-model="form.quantity" class="input" :maxlength="LIMITS.quantity" placeholder="e.g. 10 jars, 2 kg" /></label>
          </div>
          <label class="field">
            <span class="field__label">Tell us more</span>
            <textarea v-model="form.message" class="input" required :maxlength="LIMITS.enquiry" rows="4" placeholder="Flavour, spice level, when you need it, delivery city…" data-lenis-prevent />
          </label>
          <label class="hp" aria-hidden="true">Website <input v-model="form.website" tabindex="-1" autocomplete="off" /></label>
          <p v-if="error" class="form-msg form-msg--err" role="alert">{{ error }}</p>
          <button class="btn ct__send" :disabled="busy">{{ busy ? 'Sending…' : 'Send request' }} <AppIcon v-if="!busy" name="arrow" /></button>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ct { background: var(--cream); padding: clamp(40px, 6vw, 90px) 0 clamp(64px, 8vw, 120px); }
.ct__grid { display: grid; grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr); gap: clamp(28px, 5vw, 72px); align-items: start; }
.ct__intro { display: grid; gap: 16px; }
.ct__eyebrow { display: flex; gap: 12px; color: var(--ink-2); }
.ct__eyebrow span { color: var(--chili); }
.ct__title { font-size: var(--fs-d2); line-height: 0.98; }
.ct__title em { color: var(--chili); }
.ct__list { display: grid; gap: 10px; margin-top: 4px; }
.ct__list li { display: flex; align-items: center; gap: 10px; color: var(--ink-2); }
.ct__list .icon { color: var(--chili); }
.ct__alt { color: var(--ink-3); }
.ct__alt a { display: inline-flex; align-items: center; gap: 6px; margin-left: 4px; font-weight: 700; color: #1f8f4e; }

.ct__card { padding: clamp(20px, 3vw, 36px); border-radius: var(--radius-lg); background: var(--paper); box-shadow: 0 40px 80px -50px rgba(30, 15, 10, 0.55), inset 0 0 0 1px var(--line); }
.ct__card form { display: grid; gap: 16px; }
.ct__card .input { background: #fff; }
.ct__row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.ct__kinds { display: flex; flex-wrap: wrap; gap: 8px; margin: 0; padding: 0; border: 0; }
.ct__kinds legend { width: 100%; margin-bottom: 8px; }
.ct__kinds label { display: inline-flex; align-items: center; min-height: 40px; padding: 0 16px; border-radius: 99px; box-shadow: inset 0 0 0 1.5px var(--line-strong); font-weight: 600; font-size: 0.9rem; color: var(--ink-2); cursor: pointer; transition: background 0.2s, color 0.2s, box-shadow 0.2s; }
.ct__kinds label:hover { box-shadow: inset 0 0 0 1.5px var(--ink); color: var(--ink); }
.ct__kinds label.on { background: var(--ink); color: var(--paper); box-shadow: none; }
.ct__kinds label:has(input:focus-visible) { outline: 2.5px solid var(--chili); outline-offset: 2px; }
.ct__send { justify-self: start; }
.ct__send:disabled { opacity: 0.6; cursor: progress; }
.ct__thanks { display: grid; justify-items: start; gap: 10px; }
.ct__thanks .display { font-size: var(--fs-h3); color: var(--chili); }

@media (max-width: 900px) {
  .ct__grid { grid-template-columns: 1fr; }
}
@media (max-width: 560px) {
  .ct__row { grid-template-columns: 1fr; }
  .ct__send { justify-self: stretch; }
}
</style>
