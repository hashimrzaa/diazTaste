<script setup lang="ts">
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { products, WHATSAPP_URL } from '~/data/products'

const config = useRuntimeConfig()
if (import.meta.client) resetStageState()

useSeoMeta({
  title: 'Homemade chutneys, ghar ka zaiqa',
  titleTemplate: 'Dia’s Taste — %s',
  description: 'Dia’s Taste makes five homemade chutneys — Green, Garlic, Aloo Bukhara, Imli and Khajoor — in small batches with no additives. Order on WhatsApp.',
  ogTitle: 'Dia’s Taste — Homemade chutneys, ghar ka zaiqa',
  ogDescription: 'Five homemade chutneys, no additives. Order on WhatsApp.',
  ogUrl: config.public.siteUrl,
})
// Warm the default hero model early, but only where WebGL can actually use it
// (a blocked GPU would otherwise trigger an "unused preload" warning).
const PRELOAD_HERO = `(function(){try{var c=document.createElement('canvas'),g=c.getContext('webgl2')||c.getContext('webgl');if(!g)return;var x=g.getExtension('WEBGL_lose_context');x&&x.loseContext();var l=document.createElement('link');l.rel='preload';l.as='fetch';l.crossOrigin='anonymous';l.href='/models/${products[2]!.slug}.hero.glb';document.head.appendChild(l)}catch(e){}})()`
useHead({
  link: [{ rel: 'canonical', href: config.public.siteUrl }],
  script: [{ innerHTML: PRELOAD_HERO, tagPosition: 'head' }, {
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'Organization', name: 'Dia’s Taste', slogan: 'Ghar ka Zaiqa', url: config.public.siteUrl, logo: `${config.public.siteUrl}/brand/dias-logo.svg`, sameAs: [WHATSAPP_URL] },
        { '@type': 'ItemList', name: 'Dia’s Taste chutneys', itemListElement: products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${config.public.siteUrl}/chutney/${p.slug}`, name: p.name })) },
      ],
    }),
  }],
})
</script>

<template>
  <div class="home">
    <ClientOnly>
      <WebGLStage :urls="Object.fromEntries(products.map((p) => [p.slug, `/models/${p.slug}.hero.glb`]))" @ready="ScrollTrigger.refresh()" />
    </ClientOnly>
    <HomeHeroSection />
    <HomeOrderSection />
  </div>
</template>
