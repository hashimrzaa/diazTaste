<script setup lang="ts">
import type { Catalog, CatalogProduct } from '~/data/products'

/* /admin — show/hide products and edit everything about them.
   Saving commits app/data/catalog.json to GitHub; Vercel then redeploys the
   site (about 1–2 minutes). Not linked anywhere, never indexed. */
useHead({ title: 'Admin', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

interface Session { loggedIn: boolean; configured: boolean; canPublish: boolean; mode: 'github' | 'local' | 'none' }
type Editable = CatalogProduct & { _ingredients: string; _allergens: string; _pairs: string; _steps: string }

const session = ref<Session>()
const password = ref('')
const loginError = ref('')
const busy = ref(false)
const items = ref<Editable[]>([])
const sha = ref<string>()
const defaultSlug = ref<string>()
const saved = ref('') // JSON of the last saved state, for the “unsaved” check
const open = ref<string | null>(null)
const msg = ref<{ kind: 'ok' | 'err'; text: string; url?: string } | null>(null)
const uploading = ref<string | null>(null)
const loadError = ref('')

const lines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean)
const toEditable = (p: CatalogProduct): Editable => ({
  ...structuredClone(toRaw(p)),
  _ingredients: p.ingredients.join('\n'),
  _allergens: p.allergens.join('\n'),
  _pairs: p.pairs.join('\n'),
  _steps: p.recipe.steps.join('\n'),
})
const toCatalog = (): Catalog => ({
  defaultSlug: defaultSlug.value,
  products: items.value.map(({ _ingredients, _allergens, _pairs, _steps, ...p }) => ({
    ...p,
    ingredients: lines(_ingredients),
    allergens: lines(_allergens),
    pairs: lines(_pairs),
    recipe: { title: p.recipe.title, steps: lines(_steps) },
    sizes: p.sizes.map((s) => ({ label: s.label, price: (s.price as unknown) === '' || s.price == null ? null : Number(s.price) })),
  })),
})
const dirty = computed(() => !!items.value.length && JSON.stringify(toCatalog()) !== saved.value)
const visibleCount = computed(() => items.value.filter((p) => !p.hidden).length)

const errText = (e: unknown) => (e as { data?: { statusMessage?: string }; statusMessage?: string })?.data?.statusMessage || (e as { statusMessage?: string })?.statusMessage || 'Something went wrong.'

async function loadSession() {
  session.value = await $fetch<Session>('/api/admin/session')
  if (session.value.loggedIn) await loadCatalog()
}
async function loadCatalog() {
  loadError.value = ''
  const r = await $fetch<{ catalog: Catalog; sha?: string }>('/api/admin/catalog').catch((e) => {
    loadError.value = errText(e)
    throw e
  })
  items.value = r.catalog.products.map(toEditable)
  defaultSlug.value = [r.catalog.defaultSlug ?? 'aloo-bukhara'].find((s) => r.catalog.products.some((p) => p.slug === s && !p.hidden)) ?? r.catalog.products.find((p) => !p.hidden)?.slug
  sha.value = r.sha
  saved.value = JSON.stringify(toCatalog())
}
async function login() {
  busy.value = true
  loginError.value = ''
  try {
    await $fetch('/api/admin/login', { method: 'POST', body: { password: password.value } })
    password.value = ''
    await loadSession()
  } catch (e) {
    loginError.value = errText(e)
  } finally {
    busy.value = false
  }
}
async function logout() {
  await $fetch('/api/admin/logout', { method: 'POST' })
  items.value = []
  await loadSession()
}

async function save() {
  busy.value = true
  msg.value = null
  try {
    const before = new Map((JSON.parse(saved.value) as Catalog).products.map((x) => [x.slug, JSON.stringify(x)]))
    const now = toCatalog()
    const changed = now.products.filter((x) => before.get(x.slug) !== JSON.stringify(x)).map((x) => x.short)
    if (now.products.map((x) => x.slug).join() !== [...before.keys()].join()) changed.push('order')
    const r = await $fetch<{ commit: string; url: string; sha?: string; catalog: Catalog }>('/api/admin/catalog', {
      method: 'PUT',
      body: { catalog: toCatalog(), sha: sha.value, note: changed.length ? `update ${changed.join(', ')}` : undefined },
    })
    items.value = r.catalog.products.map(toEditable)
    defaultSlug.value = r.catalog.defaultSlug
    sha.value = r.sha
    saved.value = JSON.stringify(toCatalog())
    msg.value = r.commit === 'local'
      ? { kind: 'ok', text: 'Saved to app/data/catalog.json (local dev).' }
      : { kind: 'ok', text: 'Saved. The live site updates in about 1–2 minutes, once Vercel finishes rebuilding.', url: r.url }
  } catch (e) {
    msg.value = { kind: 'err', text: errText(e) }
  } finally {
    busy.value = false
  }
}

async function upload(p: Editable, e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (file.size > 3 * 1024 * 1024) { msg.value = { kind: 'err', text: 'That image is over 3 MB. Please use a smaller one.' }; return }
  uploading.value = p.slug
  msg.value = null
  try {
    const fd = new FormData()
    fd.append('slug', p.slug)
    fd.append('file', file)
    const r = await $fetch<{ path: string }>('/api/admin/upload', { method: 'POST', body: fd })
    p.image = r.path
    previews[r.path] = URL.createObjectURL(file) // the new file is only served after the redeploy
    msg.value = { kind: 'ok', text: `New photo uploaded for ${p.short}. Press “Save & publish” to use it.` }
  } catch (err) {
    msg.value = { kind: 'err', text: errText(err) }
  } finally {
    uploading.value = null
  }
}
const previews = reactive<Record<string, string>>({})
const imgSrc = (p: Editable) => previews[p.image] || p.image

function addSize(p: Editable) { if (p.sizes.length < 4) p.sizes.push({ label: '', price: null }) }
function removeSize(p: Editable, i: number) { if (p.sizes.length > 1) p.sizes.splice(i, 1) }
function move(i: number, d: number) {
  const j = i + d
  if (j < 0 || j >= items.value.length) return
  const a = items.value
  ;[a[i], a[j]] = [a[j]!, a[i]!]
}
function revert() {
  const c = JSON.parse(saved.value) as Catalog
  items.value = c.products.map(toEditable)
  defaultSlug.value = c.defaultSlug
  msg.value = null
}

const tastes = [['sweet', 'Sweet'], ['tangy', 'Tangy'], ['heat', 'Heat']] as const
const colours = [['accent', 'Main colour'], ['deep', 'Dark text'], ['tint', 'Light background'], ['ink', 'Darkest']] as const

const warn = (e: BeforeUnloadEvent) => { if (dirty.value) { e.preventDefault(); e.returnValue = '' } }
onMounted(() => {
  loadSession().catch((e) => { if (!loadError.value) loginError.value = errText(e) })
  window.addEventListener('beforeunload', warn)
})
onBeforeUnmount(() => window.removeEventListener('beforeunload', warn))
</script>

<template>
  <div class="ad" data-lenis-prevent>
    <header class="ad__top">
      <div class="ad__brand"><span class="ad__logo"><BrandLogo /></span><strong class="display">Admin</strong></div>
      <div v-if="session?.loggedIn" class="ad__topr">
        <NuxtLink to="/" class="ad__link" target="_blank">View site ↗</NuxtLink>
        <button class="ad__ghost" @click="logout">Log out</button>
      </div>
    </header>

    <p v-if="!session" class="ad__center">Loading…</p>

    <!-- login -->
    <form v-else-if="!session.loggedIn" class="ad__login" @submit.prevent="login">
      <h1 class="display">Dia’s Taste admin</h1>
      <p v-if="!session.configured" class="ad__note ad__note--err">
        Admin isn’t set up yet. Add an <code>ADMIN_PASSWORD</code> environment variable in Vercel, then redeploy.
      </p>
      <template v-else>
        <label class="ad__field">
          <span>Password</span>
          <input v-model="password" type="password" autocomplete="current-password" required autofocus />
        </label>
        <button class="ad__btn" :disabled="busy">{{ busy ? 'Checking…' : 'Log in' }}</button>
      </template>
      <p v-if="loginError" class="ad__note ad__note--err">{{ loginError }}</p>
    </form>

    <!-- editor -->
    <main v-else class="ad__main">
      <div class="ad__intro">
        <h1 class="display">Products</h1>
        <p>{{ visibleCount }} of {{ items.length }} showing on the site. Changes go live after you press <b>Save &amp; publish</b>.</p>
        <p v-if="loadError" class="ad__note ad__note--err">
          Couldn’t load the products: {{ loadError }}
          <button class="ad__ghost ad__sm" style="margin-left: 8px" @click="loadCatalog().catch(() => {})">Try again</button>
        </p>
        <p v-if="!session.canPublish" class="ad__note ad__note--err">
          Saving is off: add a <code>GITHUB_TOKEN</code> environment variable in Vercel (fine-grained token for this repo, “Contents: read and write”).
        </p>
      </div>

      <section v-for="(p, i) in items" :key="p.slug" class="ad__card" :class="{ off: p.hidden, open: open === p.slug }" :style="{ '--a': p.color.accent, '--t': p.color.tint, '--d': p.color.deep }">
        <div class="ad__row">
          <button class="ad__head" :aria-expanded="open === p.slug" @click="open = open === p.slug ? null : p.slug">
            <img :src="imgSrc(p)" alt="" width="48" height="64" />
            <span class="ad__title">
              <strong class="display">{{ p.name || 'Untitled' }}</strong>
              <small>{{ p.sizes.map((s) => `${s.label}${s.price != null && (s.price as unknown) !== '' ? ` · Rs ${s.price}` : ''}`).join('  |  ') }}</small>
            </span>
            <span class="ad__chev" aria-hidden="true">▾</span>
          </button>
          <div class="ad__order" title="Order on the site">
            <button :disabled="i === 0" aria-label="Move up" @click="move(i, -1)">↑</button>
            <button :disabled="i === items.length - 1" aria-label="Move down" @click="move(i, 1)">↓</button>
          </div>
          <label class="ad__def" :class="{ on: defaultSlug === p.slug }" :title="p.hidden ? 'Hidden products can’t be the default' : 'The site opens on this flavour'">
            <input v-model="defaultSlug" type="radio" name="default-flavour" :value="p.slug" :disabled="p.hidden" />
            <span>{{ defaultSlug === p.slug ? '★ Default' : 'Set default' }}</span>
          </label>
          <label class="ad__switch" :title="p.hidden ? 'Hidden from the site' : 'Showing on the site'">
            <input v-model="p.hidden" type="checkbox" :true-value="false" :false-value="true" />
            <span class="ad__track"><span /></span>
            <em>{{ p.hidden ? 'Hidden' : 'Visible' }}</em>
          </label>
        </div>

        <div v-if="open === p.slug" class="ad__body">
          <div class="ad__grid">
            <div class="ad__photo">
              <img :src="imgSrc(p)" :alt="p.name" />
              <label class="ad__ghost ad__file">
                {{ uploading === p.slug ? 'Uploading…' : 'Change photo' }}
                <input type="file" accept="image/webp,image/png,image/jpeg" :disabled="!!uploading" @change="upload(p, $event)" />
              </label>
              <small>WebP or PNG with a transparent background works best. Max 3 MB.</small>
            </div>

            <div class="ad__fields">
              <label class="ad__field ad__span2"><span>Full name</span><input v-model="p.name" maxlength="60" /></label>
              <label class="ad__field"><span>Short name (tabs, buttons)</span><input v-model="p.short" maxlength="24" /></label>
              <label class="ad__field"><span>Urdu / second name</span><input v-model="p.urdu" maxlength="40" /></label>
              <label class="ad__field ad__span2"><span>Tagline</span><input v-model="p.tagline" maxlength="90" /></label>
              <label class="ad__field ad__span2"><span>Description</span><textarea v-model="p.description" rows="4" maxlength="900" /></label>
            </div>
          </div>

          <fieldset class="ad__set">
            <legend>Sizes &amp; prices <small>(leave a price empty to show “Price on WhatsApp”)</small></legend>
            <div v-for="(s, si) in p.sizes" :key="si" class="ad__size">
              <input v-model="s.label" placeholder="e.g. 250 g" maxlength="20" aria-label="Size" />
              <span class="ad__rs">Rs</span>
              <input v-model.number="s.price" type="number" min="0" step="10" placeholder="—" aria-label="Price" />
              <button class="ad__x" :disabled="p.sizes.length < 2" aria-label="Remove size" @click="removeSize(p, si)">×</button>
            </div>
            <button v-if="p.sizes.length < 4" class="ad__ghost ad__sm" @click="addSize(p)">+ Add size</button>
          </fieldset>

          <div class="ad__cols">
            <label class="ad__field"><span>Ingredients <small>(one per line, first 4 show around the jar)</small></span><textarea v-model="p._ingredients" rows="6" /></label>
            <label class="ad__field"><span>Best with <small>(one per line)</small></span><textarea v-model="p._pairs" rows="6" /></label>
            <label class="ad__field"><span>Allergens <small>(one per line)</small></span><textarea v-model="p._allergens" rows="6" /></label>
          </div>

          <div class="ad__cols">
            <fieldset class="ad__set">
              <legend>Taste profile</legend>
              <label v-for="[k, t] in tastes" :key="k" class="ad__taste">
                <span>{{ t }}</span>
                <input v-model.number="p.taste[k]" type="range" min="1" max="5" step="1" />
                <b>{{ p.taste[k] }}</b>
              </label>
            </fieldset>
            <fieldset class="ad__set ad__span2c">
              <legend>Quick recipe</legend>
              <label class="ad__field"><span>Title</span><input v-model="p.recipe.title" maxlength="60" /></label>
              <label class="ad__field"><span>Steps <small>(one per line)</small></span><textarea v-model="p._steps" rows="3" /></label>
            </fieldset>
          </div>

          <fieldset class="ad__set">
            <legend>Colours</legend>
            <div class="ad__colours">
              <label v-for="[k, t] in colours" :key="k" class="ad__colour">
                <input v-model="p.color[k]" type="color" />
                <span>{{ t }}<code>{{ p.color[k] }}</code></span>
              </label>
            </div>
          </fieldset>
        </div>
      </section>

      <div class="ad__bar" :class="{ show: dirty || msg }">
        <p v-if="msg" class="ad__msg" :class="msg.kind">
          {{ msg.text }} <a v-if="msg.url" :href="msg.url" target="_blank" rel="noopener">See change ↗</a>
        </p>
        <p v-else class="ad__msg">You have unsaved changes.</p>
        <div class="ad__actions">
          <button v-if="dirty" class="ad__ghost" :disabled="busy" @click="revert">Undo changes</button>
          <button class="ad__btn" :disabled="busy || !dirty || !session.canPublish" @click="save">{{ busy ? 'Saving…' : 'Save & publish' }}</button>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.ad { min-height: 100svh; padding-bottom: 120px; background: var(--cream); color: var(--ink); font-size: 0.95rem; }
.ad__top { position: sticky; top: 0; z-index: 5; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px var(--gutter); background: color-mix(in srgb, var(--paper) 92%, transparent); backdrop-filter: blur(12px); box-shadow: 0 1px 0 var(--line); }
.ad__brand { display: flex; align-items: center; gap: 12px; font-size: 1.1rem; }
.ad__logo { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; background: var(--paper); box-shadow: 0 0 0 1px var(--line); --logo-h: 80%; }
.ad__topr { display: flex; align-items: center; gap: 10px; }
.ad__link { font-weight: 700; font-size: 0.85rem; }
.ad__center { padding: 80px var(--gutter); text-align: center; color: var(--ink-3); }

.ad__login { display: grid; gap: 16px; width: min(380px, calc(100% - 2 * var(--gutter))); margin: 12vh auto 0; padding: 28px; border-radius: 24px; background: var(--paper); box-shadow: 0 30px 60px -40px rgba(30, 15, 10, 0.5), inset 0 0 0 1px var(--line); }
.ad__login h1 { font-size: 1.4rem; }

.ad__main { width: min(1040px, calc(100% - 2 * var(--gutter))); margin: 0 auto; }
.ad__intro { padding: 32px 0 18px; }
.ad__intro h1 { font-size: clamp(1.8rem, 4vw, 2.6rem); }
.ad__intro p { margin-top: 6px; color: var(--ink-2); }

.ad__note { padding: 12px 14px; border-radius: 12px; background: #fff7e6; box-shadow: inset 0 0 0 1px #f0d9a8; font-size: 0.88rem; line-height: 1.45; }
.ad__note--err { background: #fdecec; box-shadow: inset 0 0 0 1px #f2c3c3; color: #7a1212; }
code { font-size: 0.85em; padding: 1px 5px; border-radius: 5px; background: rgba(30, 15, 10, 0.07); }

.ad__card { margin-top: 12px; border-radius: 20px; background: var(--paper); box-shadow: inset 0 0 0 1px var(--line); border-left: 5px solid var(--a); transition: opacity 0.3s; overflow: hidden; }
.ad__card.off { opacity: 0.62; }
.ad__card.off.open { opacity: 1; }
.ad__row { display: flex; align-items: center; gap: 10px; padding: 10px 14px 10px 10px; }
.ad__head { flex: 1; min-width: 0; display: flex; align-items: center; gap: 14px; text-align: left; }
.ad__head img { width: 48px; height: 64px; object-fit: contain; border-radius: 10px; background: var(--t); }
.ad__title { display: grid; min-width: 0; }
.ad__title strong { font-size: 1.05rem; }
.ad__title small { color: var(--ink-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ad__chev { margin-left: auto; color: var(--ink-3); transition: transform 0.3s; }
.open .ad__chev { transform: rotate(180deg); }
.ad__order { display: flex; gap: 2px; }
.ad__order button { width: 30px; height: 30px; border-radius: 8px; color: var(--ink-2); }
.ad__order button:hover:not(:disabled) { background: rgba(30, 15, 10, 0.06); }
.ad__order button:disabled { opacity: 0.25; }

.ad__def { position: relative; display: inline-flex; align-items: center; height: 30px; padding: 0 12px; border-radius: 99px; font-size: 0.78rem; font-weight: 700; color: var(--ink-3); box-shadow: inset 0 0 0 1px var(--line); cursor: pointer; white-space: nowrap; }
.ad__def input { position: absolute; opacity: 0; pointer-events: none; }
.ad__def:hover { color: var(--ink); }
.ad__def.on { background: var(--a); color: #fff; box-shadow: none; }
.ad__def:has(input:disabled) { opacity: 0.35; cursor: not-allowed; }
.ad__def:has(input:focus-visible) { outline: 2px solid var(--ink); outline-offset: 2px; }
.ad__switch { display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; }
.ad__switch input { position: absolute; opacity: 0; pointer-events: none; }
.ad__track { position: relative; width: 42px; height: 24px; border-radius: 99px; background: #cbbfb3; transition: background 0.25s; }
.ad__track span { position: absolute; left: 3px; top: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25); transition: transform 0.25s var(--ease-out); }
.ad__switch input:checked + .ad__track { background: #1f8f4e; }
.ad__switch input:checked + .ad__track span { transform: translateX(18px); }
.ad__switch input:focus-visible + .ad__track { outline: 2px solid var(--ink); outline-offset: 2px; }
.ad__switch em { width: 52px; font-style: normal; font-size: 0.8rem; font-weight: 700; color: var(--ink-2); }

.ad__body { display: grid; gap: 18px; padding: 8px 18px 22px; border-top: 1px solid var(--line); }
.ad__grid { display: grid; grid-template-columns: 200px 1fr; gap: 20px; padding-top: 14px; }
.ad__photo { display: grid; gap: 8px; align-content: start; justify-items: center; text-align: center; }
.ad__photo img { width: 100%; aspect-ratio: 3 / 4; object-fit: contain; border-radius: 16px; background: var(--t); }
.ad__photo small { color: var(--ink-3); font-size: 0.74rem; }
.ad__file { position: relative; cursor: pointer; }
.ad__file input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.ad__fields { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-content: start; }
.ad__span2 { grid-column: span 2; }

.ad__field { display: grid; gap: 5px; }
.ad__field > span, .ad__set legend { font-size: 0.74rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-2); }
.ad__field small, .ad__set legend small { text-transform: none; letter-spacing: 0; font-weight: 500; color: var(--ink-3); }
input:not([type='checkbox']):not([type='range']):not([type='color']):not([type='file']), textarea {
  width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid var(--line-strong); background: #fff; font: inherit; color: var(--ink); line-height: 1.45;
}
textarea { resize: vertical; }
input:focus, textarea:focus { outline: 2px solid var(--a, var(--ink)); outline-offset: 0; border-color: transparent; }

.ad__set { display: grid; gap: 10px; min-width: 0; padding: 14px; border: 1px solid var(--line); border-radius: 14px; }
.ad__set legend { padding: 0 6px; }
.ad__size { display: grid; grid-template-columns: minmax(0, 160px) auto minmax(0, 160px) auto; justify-content: start; align-items: center; gap: 8px; }
.ad__rs { color: var(--ink-3); font-weight: 700; }
.ad__x { width: 34px; height: 34px; border-radius: 8px; font-size: 1.2rem; color: var(--ink-3); }
.ad__x:hover:not(:disabled) { background: #fdecec; color: #a11; }
.ad__x:disabled { opacity: 0.25; }
.ad__cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.ad__span2c { grid-column: span 2; }
.ad__taste { display: grid; grid-template-columns: 54px 1fr 16px; align-items: center; gap: 10px; font-weight: 600; }
.ad__taste input { accent-color: var(--a); }
.ad__colours { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.ad__colour { display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 0.85rem; font-weight: 600; }
.ad__colour input { width: 40px; height: 40px; padding: 0; border: 0; border-radius: 10px; background: none; cursor: pointer; }
.ad__colour span { display: grid; }
.ad__colour code { justify-self: start; margin-top: 2px; font-size: 0.72rem; }

.ad__btn { height: 44px; padding: 0 22px; border-radius: 99px; background: var(--ink); color: var(--paper); font-weight: 700; transition: opacity 0.2s, background 0.2s; }
.ad__btn:hover:not(:disabled) { background: #1f8f4e; }
.ad__btn:disabled { opacity: 0.4; cursor: not-allowed; }
.ad__ghost { display: inline-flex; align-items: center; justify-content: center; height: 38px; padding: 0 16px; border-radius: 99px; box-shadow: inset 0 0 0 1px var(--line-strong); font-weight: 700; font-size: 0.85rem; background: var(--paper); }
.ad__ghost:hover:not(:disabled) { background: #fff; }
.ad__sm { justify-self: start; height: 32px; font-size: 0.8rem; }

.ad__bar { position: fixed; left: 50%; bottom: 16px; z-index: 6; display: flex; align-items: center; gap: 16px; width: min(1040px, calc(100% - 2 * var(--gutter))); padding: 12px 12px 12px 20px; border-radius: 20px; background: var(--ink); color: var(--paper); box-shadow: 0 20px 50px -20px rgba(30, 15, 10, 0.6); transform: translate(-50%, 140%); visibility: hidden; transition: transform 0.4s var(--ease-out), visibility 0s 0.4s; }
.ad__bar.show { transform: translate(-50%, 0); visibility: visible; transition: transform 0.4s var(--ease-out); }
.ad__msg { flex: 1; font-size: 0.88rem; line-height: 1.4; }
.ad__msg.ok { color: #9be3b4; }
.ad__msg.err { color: #ffb4b4; }
.ad__msg a { color: inherit; text-decoration: underline; }
.ad__actions { display: flex; gap: 8px; }
.ad__bar .ad__btn { background: var(--paper); color: var(--ink); }
.ad__bar .ad__btn:hover:not(:disabled) { background: #9be3b4; }
.ad__bar .ad__ghost { background: transparent; color: var(--paper); box-shadow: inset 0 0 0 1px rgba(251, 246, 238, 0.3); }

@media (max-width: 760px) {
  .ad__grid, .ad__cols, .ad__fields { grid-template-columns: 1fr; }
  .ad__span2, .ad__span2c { grid-column: auto; }
  .ad__photo { grid-template-columns: 110px 1fr; justify-items: start; text-align: left; align-items: center; }
  .ad__photo img { grid-row: span 2; }
  .ad__colours { grid-template-columns: 1fr 1fr; }
  .ad__size { grid-template-columns: 1fr auto 1fr auto; }
  .ad__row { flex-wrap: wrap; }
  .ad__head { flex-basis: 100%; }
  .ad__def { margin-right: auto; }
  .ad__switch em { display: none; }
  .ad__bar { flex-direction: column; align-items: stretch; gap: 10px; padding: 14px; }
  .ad__actions { justify-content: flex-end; }
}
</style>
