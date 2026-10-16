<script setup lang="ts">
import { gsap } from 'gsap'
import { products, WHATSAPP_URL } from '~/data/products'

/* Navbar: logo (left) · flavour tabs (centre, desktop) · Order now (right).
   Clicking the logo opens a menu that stays open until closed; on phones it
   also carries the flavour list. A flavour on the home page switches the hero
   jar; elsewhere it opens that product. */
const route = useRoute()
const router = useRouter()
const heroFlavour = useHeroFlavour()
const open = ref(false)
const hidden = ref(false)
const panel = ref<HTMLElement>()

const links = [
  { label: 'Home', to: '/' },
  { label: 'Flavours', to: '/flavours' },
  { label: 'Order', to: '/#order' },
]

function close() { open.value = false }

async function go(to: string, e?: MouseEvent) {
  const [path, hash] = to.split('#')
  close()
  if (!hash) return
  e?.preventDefault()
  if (route.path !== (path || '/')) await router.push(path || '/')
  await nextTick()
  setTimeout(() => scrollToTarget(`#${hash}`), route.path === '/' ? 0 : 900)
}

function pickFlavour(i: number) {
  close()
  if (route.path === '/') {
    heroFlavour.value = i
    scrollToTarget(0)
  } else {
    router.push(`/chutney/${products[i]!.slug}`)
  }
}
const isActive = (i: number) => (route.path === '/' ? heroFlavour.value === i : route.path === `/chutney/${products[i]!.slug}`)

watch(open, async (v) => {
  lockScroll(v)
  await nextTick()
  if (v && panel.value) {
    gsap.fromTo(panel.value, { y: -14, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: 'expo.out' })
    gsap.fromTo(panel.value.querySelectorAll('.nv__i'), { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.03, ease: 'expo.out', delay: 0.05 })
  }
})

let lastY = 0
function onScroll() {
  const y = window.scrollY
  if (!open.value) hidden.value = y > 240 && y > lastY + 2 ? true : y < lastY - 2 ? false : hidden.value
  lastY = y
}
const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKey)
})
watch(() => route.fullPath, close)
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <header class="hdr" :class="{ 'is-hidden': hidden, 'is-open': open }">
    <div class="hdr__bar">
      <button class="hdr__logo" :aria-expanded="open" aria-controls="nav-panel" :aria-label="open ? 'Close menu' : 'Open menu'" @click="open = !open">
        <BrandLogo />
        <span class="hdr__burger" aria-hidden="true"><span /><span /></span>
      </button>

      <nav class="hdr__tabs" aria-label="Flavours">
        <button v-for="(f, i) in products" :key="f.slug" class="hdr__tab" :class="{ on: isActive(i) }" :style="{ '--c': f.color.accent }" @click="pickFlavour(i)">
          <span class="hdr__dot" />{{ f.short }}
        </button>
      </nav>

      <a :href="WHATSAPP_URL" target="_blank" rel="noopener" class="hdr__order"><AppIcon name="whatsapp" /><span>Order now</span></a>
    </div>

    <div v-if="open" class="hdr__scrim" @click="close" />
    <div v-if="open" id="nav-panel" ref="panel" class="nv" role="dialog" aria-label="Menu">
      <nav class="nv__col" aria-label="Primary">
        <p class="eyebrow nv__k nv__i">Menu</p>
        <NuxtLink v-for="l in links" :key="l.to" :to="l.to" class="nv__link display nv__i" @click="go(l.to, $event)">{{ l.label }}</NuxtLink>
      </nav>
      <div class="nv__col">
        <p class="eyebrow nv__k nv__i">Flavours</p>
        <button v-for="(f, i) in products" :key="f.slug" class="nv__fl nv__i" :class="{ on: isActive(i) }" :style="{ '--t': f.color.tint }" @click="pickFlavour(i)">
          <img :src="f.image" alt="" width="40" height="53" loading="lazy" />
          <span><strong>{{ f.short }}</strong><small>{{ f.tagline }}</small></span>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.hdr { position: fixed; inset: 0 0 auto 0; z-index: 60; transition: transform 0.6s var(--ease-out); }
.hdr.is-hidden { transform: translateY(-120%); }
.hdr__bar { position: relative; z-index: 3; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 16px; width: 100%; padding: 14px var(--gutter); }
.hdr__logo { position: relative; justify-self: start; display: grid; place-items: center; width: 74px; height: 74px; border-radius: 50%; background: var(--paper); box-shadow: 0 12px 26px -16px rgba(30, 15, 10, 0.45), 0 0 0 1px var(--line); --logo-h: 80%; transition: transform 0.5s var(--ease-out); }
.hdr__logo:hover, .is-open .hdr__logo { transform: rotate(-8deg) scale(1.05); }
.hdr__burger { position: absolute; right: -4px; bottom: 2px; width: 24px; height: 24px; border-radius: 50%; background: var(--ink); }
.hdr__burger span { position: absolute; left: 6px; right: 6px; height: 1.5px; background: var(--paper); transition: transform 0.4s var(--ease-out); }
.hdr__burger span:first-child { top: 9px; } .hdr__burger span:last-child { top: 14px; }
.is-open .hdr__burger span:first-child { transform: translateY(2.5px) rotate(45deg); }
.is-open .hdr__burger span:last-child { transform: translateY(-2.5px) rotate(-45deg); }

.hdr__tabs { display: flex; gap: 4px; padding: 5px; border-radius: 99px; background: color-mix(in srgb, var(--paper) 82%, transparent); backdrop-filter: blur(14px); box-shadow: 0 10px 26px -18px rgba(30, 15, 10, 0.4), inset 0 0 0 1px var(--line); }
.hdr__tab { display: inline-flex; align-items: center; gap: 8px; height: 38px; padding: 0 14px; border-radius: 99px; font-size: 0.86rem; font-weight: 700; color: var(--ink-2); white-space: nowrap; transition: background 0.3s, color 0.3s; }
.hdr__tab:hover { color: var(--ink); }
.hdr__tab.on { background: var(--ink); color: var(--paper); }
.hdr__dot { width: 9px; height: 9px; border-radius: 50%; background: var(--c); }
.hdr__order { justify-self: end; display: inline-flex; align-items: center; gap: 8px; height: 46px; padding: 0 20px; border-radius: 99px; background: var(--ink); color: var(--paper); font-size: 0.9rem; font-weight: 700; transition: background 0.3s; }
.hdr__order:hover { background: #1f8f4e; }

.hdr__scrim { position: fixed; inset: 0; z-index: 1; background: rgba(30, 15, 10, 0.18); backdrop-filter: blur(3px); }
.nv { position: absolute; z-index: 2; left: var(--gutter); top: 96px; display: grid; grid-template-columns: 1fr 1.2fr; gap: 28px; width: min(640px, calc(100vw - 2 * var(--gutter))); padding: 26px; border-radius: 28px; background: var(--paper); box-shadow: 0 40px 80px -40px rgba(30, 15, 10, 0.5), inset 0 0 0 1px var(--line); transform-origin: 0 0; }
.nv__col { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; }
.nv__k { color: var(--ink-3); margin-bottom: 8px; }
.nv__link { font-size: 1.8rem; line-height: 1.15; transition: color 0.25s, transform 0.4s var(--ease-out); }
.nv__link:hover { color: var(--chili); transform: translateX(6px); }
.nv__fl { display: flex; align-items: center; gap: 12px; width: 100%; padding: 6px 10px 6px 6px; border-radius: 16px; text-align: left; transition: background 0.3s; }
.nv__fl:hover, .nv__fl.on { background: var(--t); }
.nv__fl img { width: 40px; height: 53px; object-fit: contain; }
.nv__fl span { display: grid; }
.nv__fl strong { font-family: var(--font-display); font-size: 1rem; }
.nv__fl small { font-size: 0.76rem; color: var(--ink-3); }

@media (max-width: 900px) {
  .hdr__bar { grid-template-columns: auto 1fr auto; padding-top: 10px; }
  .hdr__tabs { display: none; }
  .hdr__logo { width: 56px; height: 56px; }
  .hdr__order { height: 42px; padding: 0 16px; font-size: 0.84rem; }
  .nv { left: var(--gutter); top: 78px; grid-template-columns: 1fr; gap: 16px; padding: 20px; max-height: calc(100svh - 96px); overflow-y: auto; }
  .nv__link { font-size: 1.5rem; }
}
</style>
