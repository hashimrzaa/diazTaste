<script setup lang="ts">
import { products } from '~/data/products'
import { LIMITS, type AdminTestimonial, type ReviewStatus } from '~/data/inbox'

/* Admin → Reviews. New reviews from the site wait here as “pending”; only
   approved ones show on the home page. Changes are live immediately. */
const emit = defineEmits<{ count: [n: number] }>()

const list = ref<AdminTestimonial[]>([])
const filter = ref<ReviewStatus | 'all'>('pending')
const busy = ref<number | null>(null)
const error = ref('')
const loading = ref(true)

const FILTERS = [['pending', 'Waiting'], ['approved', 'Live'], ['rejected', 'Hidden'], ['all', 'All']] as const
const count = (f: ReviewStatus | 'all') => (f === 'all' ? list.value.length : list.value.filter((r) => r.status === f).length)
const shown = computed(() => (filter.value === 'all' ? list.value : list.value.filter((r) => r.status === filter.value)))
const productName = (slug: string) => products.find((p) => p.slug === slug)?.short
const when = (t: number) => new Date(t).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })
const errText = (e: unknown) => (e as { data?: { statusMessage?: string } })?.data?.statusMessage || 'Something went wrong.'

async function load() {
  error.value = ''
  try {
    list.value = await $fetch<AdminTestimonial[]>('/api/admin/testimonials')
    // nothing waiting → open on what's live
    if (filter.value === 'pending' && !count('pending') && loading.value) filter.value = 'approved'
  } catch (e) {
    error.value = errText(e)
  } finally {
    loading.value = false
  }
}
watch(() => count('pending'), (n) => emit('count', n), { immediate: true })

async function setStatus(r: AdminTestimonial, status: ReviewStatus) {
  busy.value = r.id
  try {
    await $fetch(`/api/admin/testimonials/${r.id}`, { method: 'PATCH', body: { status } })
    r.status = status
  } catch (e) {
    error.value = errText(e)
  } finally {
    busy.value = null
  }
}
async function remove(r: AdminTestimonial) {
  if (!confirm(`Delete the review from ${r.name}? This can’t be undone.`)) return
  busy.value = r.id
  try {
    await $fetch(`/api/admin/testimonials/${r.id}`, { method: 'DELETE' })
    list.value = list.value.filter((x) => x.id !== r.id)
  } catch (e) {
    error.value = errText(e)
  } finally {
    busy.value = null
  }
}

/* add one by hand — e.g. a review someone sent on WhatsApp */
const adding = ref(false)
const saving = ref(false)
const draft = reactive({ name: '', city: '', product: '', rating: 5, message: '' })
async function add() {
  saving.value = true
  error.value = ''
  try {
    await $fetch('/api/admin/testimonials', { method: 'POST', body: draft })
    Object.assign(draft, { name: '', city: '', product: '', rating: 5, message: '' })
    adding.value = false
    filter.value = 'approved'
    await load()
  } catch (e) {
    error.value = errText(e)
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <section class="rv">
    <div class="rv__intro">
      <h1 class="display">Reviews</h1>
      <p>Reviews sent from the site wait here until you approve them. Approved reviews show on the home page straight away.</p>
    </div>

    <div class="rv__bar">
      <div class="rv__filters" role="tablist">
        <button v-for="[f, label] in FILTERS" :key="f" role="tab" :aria-selected="filter === f" :class="{ on: filter === f }" @click="filter = f">
          {{ label }} <span>{{ count(f) }}</span>
        </button>
      </div>
      <button class="ad__ghost" @click="adding = !adding">{{ adding ? 'Cancel' : '+ Add a review' }}</button>
    </div>

    <form v-if="adding" class="rv__add" @submit.prevent="add">
      <label class="ad__field"><span>Name</span><input v-model="draft.name" required :maxlength="LIMITS.name" /></label>
      <label class="ad__field"><span>City <small>(optional)</small></span><input v-model="draft.city" :maxlength="LIMITS.city" /></label>
      <label class="ad__field">
        <span>Flavour</span>
        <select v-model="draft.product">
          <option value="">— none —</option>
          <option v-for="p in products" :key="p.slug" :value="p.slug">{{ p.name }}</option>
        </select>
      </label>
      <label class="ad__field">
        <span>Stars</span>
        <select v-model.number="draft.rating"><option v-for="n in [5, 4, 3, 2, 1]" :key="n" :value="n">{{ '★'.repeat(n) }}</option></select>
      </label>
      <label class="ad__field rv__wide"><span>Review</span><textarea v-model="draft.message" required minlength="10" :maxlength="LIMITS.review" rows="3" /></label>
      <button class="ad__btn" :disabled="saving">{{ saving ? 'Saving…' : 'Publish review' }}</button>
    </form>

    <p v-if="error" class="ad__note ad__note--err">{{ error }} <button class="ad__ghost ad__sm" @click="load">Reload</button></p>
    <p v-if="loading" class="rv__empty">Loading…</p>
    <p v-else-if="!shown.length" class="rv__empty">{{ filter === 'pending' ? 'Nothing waiting — all caught up.' : 'No reviews here.' }}</p>

    <article v-for="r in shown" :key="r.id" class="rv__item" :class="r.status">
      <div class="rv__top">
        <span class="rv__stars" :aria-label="`${r.rating} out of 5`">{{ '★'.repeat(r.rating) }}<i>{{ '★'.repeat(5 - r.rating) }}</i></span>
        <span class="rv__tag" :class="r.status">{{ r.status === 'pending' ? 'Waiting' : r.status === 'approved' ? 'Live' : 'Hidden' }}</span>
        <span v-if="r.demo" class="rv__tag demo" title="Sample review added when the site was set up — replace it with real ones">Sample</span>
      </div>
      <p class="rv__msg">“{{ r.message }}”</p>
      <p class="rv__by">
        <strong>{{ r.name }}</strong><template v-if="r.city"> · {{ r.city }}</template>
        <template v-if="productName(r.product)"> · {{ productName(r.product) }}</template>
        · {{ when(r.createdAt) }}
      </p>
      <div class="rv__acts">
        <button v-if="r.status !== 'approved'" class="ad__btn ad__sm rv__ok" :disabled="busy === r.id" @click="setStatus(r, 'approved')">Approve</button>
        <button v-if="r.status !== 'rejected'" class="ad__ghost ad__sm" :disabled="busy === r.id" @click="setStatus(r, 'rejected')">{{ r.status === 'approved' ? 'Hide from site' : 'Reject' }}</button>
        <button class="ad__ghost ad__sm rv__del" :disabled="busy === r.id" @click="remove(r)">Delete</button>
      </div>
    </article>
  </section>
</template>

<style scoped>
.rv__intro { padding: 32px 0 18px; }
.rv__intro h1 { font-size: clamp(1.8rem, 4vw, 2.6rem); }
.rv__intro p { margin-top: 6px; color: var(--ink-2); }
.rv__bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
.rv__filters { display: flex; flex-wrap: wrap; gap: 6px; }
.rv__filters button { display: inline-flex; align-items: center; gap: 6px; height: 34px; padding: 0 14px; border-radius: 99px; font-weight: 700; font-size: 0.82rem; color: var(--ink-2); box-shadow: inset 0 0 0 1px var(--line); }
.rv__filters button.on { background: var(--ink); color: var(--paper); box-shadow: none; }
.rv__filters span { opacity: 0.6; font-weight: 600; }
.rv__add { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; align-items: end; margin-bottom: 12px; padding: 16px; border-radius: 20px; background: var(--paper); box-shadow: inset 0 0 0 1px var(--line); }
.rv__wide { grid-column: 1 / -1; }
.rv__add .ad__btn { justify-self: start; }
.rv__empty { padding: 40px 0; text-align: center; color: var(--ink-3); }
.rv__item { display: grid; gap: 8px; margin-top: 10px; padding: 16px 18px; border-radius: 20px; background: var(--paper); box-shadow: inset 0 0 0 1px var(--line); border-left: 5px solid #e2b04a; }
.rv__item.approved { border-left-color: #1f8f4e; }
.rv__item.rejected { border-left-color: #cbbfb3; opacity: 0.7; }
.rv__top { display: flex; align-items: center; gap: 8px; }
.rv__stars { color: var(--chili); letter-spacing: 2px; }
.rv__stars i { font-style: normal; color: var(--line-strong); }
.rv__tag { padding: 2px 10px; border-radius: 99px; font-size: 0.72rem; font-weight: 700; background: #fff1d6; color: #8a5a00; }
.rv__tag.approved { background: #e3f4e9; color: #145c32; }
.rv__tag.rejected { background: #eee6de; color: var(--ink-3); }
.rv__tag.demo { background: #e8e6fb; color: #3d3590; }
.rv__msg { line-height: 1.55; white-space: pre-line; }
.rv__by { font-size: 0.85rem; color: var(--ink-3); }
.rv__by strong { color: var(--ink-2); }
.rv__acts { display: flex; flex-wrap: wrap; gap: 8px; }
.rv__acts .ad__btn { height: 32px; padding: 0 16px; font-size: 0.8rem; }
.rv__ok { background: #1f8f4e !important; }
.rv__del:hover:not(:disabled) { background: #fdecec !important; color: #a11; }

@media (max-width: 760px) {
  .rv__add { grid-template-columns: 1fr 1fr; }
}
</style>
