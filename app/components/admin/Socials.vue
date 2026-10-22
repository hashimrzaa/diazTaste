<script setup lang="ts">
import { SOCIALS, type Socials } from '~/data/socials'

/* Admin → Social links. Shown as icons in the site footer; leave a field
   empty to hide that network. */
const form = reactive<Record<string, string>>(Object.fromEntries(SOCIALS.map((s) => [s.key, ''])))
const saved = ref('')
const busy = ref(false)
const msg = ref<{ kind: 'ok' | 'err'; text: string } | null>(null)
const dirty = computed(() => JSON.stringify(form) !== saved.value)
const errText = (e: unknown) => (e as { data?: { statusMessage?: string } })?.data?.statusMessage || 'Something went wrong.'

const fill = (s: Socials) => {
  for (const { key } of SOCIALS) form[key] = s[key] ?? ''
  saved.value = JSON.stringify(form)
}

async function save() {
  busy.value = true
  msg.value = null
  try {
    fill(await $fetch<Socials>('/api/admin/socials', { method: 'PUT', body: form }))
    msg.value = { kind: 'ok', text: 'Saved — the footer shows these links now.' }
  } catch (e) {
    msg.value = { kind: 'err', text: errText(e) }
  } finally {
    busy.value = false
  }
}

onMounted(async () => {
  try {
    fill(await $fetch<Socials>('/api/admin/socials'))
  } catch (e) {
    msg.value = { kind: 'err', text: errText(e) }
  }
})
</script>

<template>
  <section class="sl">
    <div class="sl__intro">
      <h1 class="display">Social links</h1>
      <p>These show as icons in the site footer. Paste the full link (starting with https://). Leave a box empty to hide it.</p>
    </div>
    <form class="sl__card" @submit.prevent="save">
      <label v-for="s in SOCIALS" :key="s.key" class="sl__row">
        <span class="sl__icon" :class="{ on: form[s.key] }"><AppIcon :name="s.key" /></span>
        <span class="sl__name">{{ s.label }}</span>
        <input v-model.trim="form[s.key]" :type="s.key === 'email' ? 'email' : 'url'" :placeholder="s.placeholder" maxlength="200" />
      </label>
      <p v-if="msg" class="ad__note" :class="{ 'ad__note--err': msg.kind === 'err' }">{{ msg.text }}</p>
      <button class="ad__btn" :disabled="busy || !dirty">{{ busy ? 'Saving…' : 'Save links' }}</button>
    </form>
  </section>
</template>

<style scoped>
.sl__intro { padding: 32px 0 18px; }
.sl__intro h1 { font-size: clamp(1.8rem, 4vw, 2.6rem); }
.sl__intro p { margin-top: 6px; color: var(--ink-2); }
.sl__card { display: grid; gap: 10px; padding: 18px; border-radius: 20px; background: var(--paper); box-shadow: inset 0 0 0 1px var(--line); }
.sl__row { display: grid; grid-template-columns: 40px 120px 1fr; align-items: center; gap: 12px; }
.sl__icon { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; background: rgba(30, 15, 10, 0.06); color: var(--ink-3); transition: background 0.2s, color 0.2s; }
.sl__icon.on { background: var(--ink); color: var(--paper); }
.sl__name { font-weight: 700; font-size: 0.9rem; }
.sl__card .ad__btn { justify-self: start; margin-top: 6px; }

@media (max-width: 560px) {
  .sl__row { grid-template-columns: 40px 1fr; }
  .sl__row input { grid-column: 1 / -1; }
}
</style>
