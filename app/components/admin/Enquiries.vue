<script setup lang="ts">
import { ENQUIRY_KINDS, type Enquiry, type EnquiryStatus } from '~/data/inbox'

/* Admin → Enquiries: custom chutney / achaar / bulk requests from the contact
   form. Reply by phone or WhatsApp, then mark them contacted or done. */
const emit = defineEmits<{ count: [n: number] }>()

const list = ref<Enquiry[]>([])
const filter = ref<EnquiryStatus | 'all'>('new')
const busy = ref<number | null>(null)
const error = ref('')
const loading = ref(true)

const FILTERS = [['new', 'New'], ['contacted', 'Contacted'], ['done', 'Done'], ['all', 'All']] as const
const count = (f: EnquiryStatus | 'all') => (f === 'all' ? list.value.length : list.value.filter((q) => q.status === f).length)
const shown = computed(() => (filter.value === 'all' ? list.value : list.value.filter((q) => q.status === filter.value)))
const when = (t: number) => new Date(t).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })
const errText = (e: unknown) => (e as { data?: { statusMessage?: string } })?.data?.statusMessage || 'Something went wrong.'

/** 0300 1234567 / +92 300… → 923001234567 for a wa.me link */
const waNumber = (phone: string) => {
  const d = phone.replace(/\D/g, '')
  return d.startsWith('0') ? `92${d.slice(1)}` : d
}
const waLink = (q: Enquiry) =>
  `https://wa.me/${waNumber(q.phone)}?text=${encodeURIComponent(`Assalam o Alaikum ${q.name}! This is Dia’s Taste about your ${ENQUIRY_KINDS[q.kind].toLowerCase()} request.`)}`

async function load() {
  error.value = ''
  try {
    list.value = await $fetch<Enquiry[]>('/api/admin/enquiries')
  } catch (e) {
    error.value = errText(e)
  } finally {
    loading.value = false
  }
}
watch(() => count('new'), (n) => emit('count', n), { immediate: true })

async function setStatus(q: Enquiry, status: EnquiryStatus) {
  busy.value = q.id
  try {
    await $fetch(`/api/admin/enquiries/${q.id}`, { method: 'PATCH', body: { status } })
    q.status = status
  } catch (e) {
    error.value = errText(e)
  } finally {
    busy.value = null
  }
}
async function remove(q: Enquiry) {
  if (!confirm(`Delete the request from ${q.name}? This can’t be undone.`)) return
  busy.value = q.id
  try {
    await $fetch(`/api/admin/enquiries/${q.id}`, { method: 'DELETE' })
    list.value = list.value.filter((x) => x.id !== q.id)
  } catch (e) {
    error.value = errText(e)
  } finally {
    busy.value = null
  }
}

onMounted(load)
</script>

<template>
  <section class="eq">
    <div class="eq__intro">
      <h1 class="display">Enquiries</h1>
      <p>Custom orders sent from the “Something special?” form on the home page.</p>
    </div>

    <div class="eq__bar">
      <div class="eq__filters" role="tablist">
        <button v-for="[f, label] in FILTERS" :key="f" role="tab" :aria-selected="filter === f" :class="{ on: filter === f }" @click="filter = f">
          {{ label }} <span>{{ count(f) }}</span>
        </button>
      </div>
      <button class="ad__ghost ad__sm" @click="load">Refresh</button>
    </div>

    <p v-if="error" class="ad__note ad__note--err">{{ error }}</p>
    <p v-if="loading" class="eq__empty">Loading…</p>
    <p v-else-if="!shown.length" class="eq__empty">{{ filter === 'new' ? 'No new requests.' : 'Nothing here.' }}</p>

    <article v-for="q in shown" :key="q.id" class="eq__item" :class="q.status">
      <div class="eq__top">
        <span class="eq__kind">{{ ENQUIRY_KINDS[q.kind] }}</span>
        <span v-if="q.quantity" class="eq__qty">{{ q.quantity }}</span>
        <small>{{ when(q.createdAt) }}</small>
      </div>
      <p class="eq__msg">{{ q.message }}</p>
      <div class="eq__who">
        <strong>{{ q.name }}</strong>
        <a :href="`tel:${q.phone.replace(/[^\d+]/g, '')}`">{{ q.phone }}</a>
        <a v-if="q.email" :href="`mailto:${q.email}`">{{ q.email }}</a>
      </div>
      <div class="eq__acts">
        <a :href="waLink(q)" target="_blank" rel="noopener" class="ad__btn ad__sm eq__wa">Reply on WhatsApp</a>
        <button v-if="q.status !== 'contacted'" class="ad__ghost ad__sm" :disabled="busy === q.id" @click="setStatus(q, 'contacted')">Mark contacted</button>
        <button v-if="q.status !== 'done'" class="ad__ghost ad__sm" :disabled="busy === q.id" @click="setStatus(q, 'done')">Mark done</button>
        <button v-if="q.status !== 'new'" class="ad__ghost ad__sm" :disabled="busy === q.id" @click="setStatus(q, 'new')">Back to new</button>
        <button class="ad__ghost ad__sm eq__del" :disabled="busy === q.id" @click="remove(q)">Delete</button>
      </div>
    </article>
  </section>
</template>

<style scoped>
.eq__intro { padding: 32px 0 18px; }
.eq__intro h1 { font-size: clamp(1.8rem, 4vw, 2.6rem); }
.eq__intro p { margin-top: 6px; color: var(--ink-2); }
.eq__bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
.eq__filters { display: flex; flex-wrap: wrap; gap: 6px; }
.eq__filters button { display: inline-flex; align-items: center; gap: 6px; height: 34px; padding: 0 14px; border-radius: 99px; font-weight: 700; font-size: 0.82rem; color: var(--ink-2); box-shadow: inset 0 0 0 1px var(--line); }
.eq__filters button.on { background: var(--ink); color: var(--paper); box-shadow: none; }
.eq__filters span { opacity: 0.6; font-weight: 600; }
.eq__empty { padding: 40px 0; text-align: center; color: var(--ink-3); }
.eq__item { display: grid; gap: 10px; margin-top: 10px; padding: 16px 18px; border-radius: 20px; background: var(--paper); box-shadow: inset 0 0 0 1px var(--line); border-left: 5px solid var(--chili); }
.eq__item.contacted { border-left-color: #e2b04a; }
.eq__item.done { border-left-color: #cbbfb3; opacity: 0.7; }
.eq__top { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.eq__top small { margin-left: auto; color: var(--ink-3); }
.eq__kind { padding: 2px 10px; border-radius: 99px; background: var(--ink); color: var(--paper); font-size: 0.74rem; font-weight: 700; }
.eq__qty { padding: 2px 10px; border-radius: 99px; background: #fff1d6; color: #8a5a00; font-size: 0.74rem; font-weight: 700; }
.eq__msg { line-height: 1.55; white-space: pre-line; }
.eq__who { display: flex; flex-wrap: wrap; gap: 6px 16px; font-size: 0.9rem; }
.eq__who a { color: var(--chili-deep); text-decoration: underline; text-underline-offset: 3px; }
.eq__acts { display: flex; flex-wrap: wrap; gap: 8px; }
.eq__acts .ad__btn { display: inline-flex; align-items: center; height: 32px; padding: 0 16px; font-size: 0.8rem; }
.eq__wa { background: #1f8f4e !important; color: #fff !important; }
.eq__del:hover:not(:disabled) { background: #fdecec !important; color: #a11; }
</style>
