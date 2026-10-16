const SITE_URL = process.env.NUXT_PUBLIC_SITE_URL || 'https://diastaste.com'

export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: false },
  buildDir: process.env.NUXT_BUILD_DIR || '.nuxt',

  css: [
    '@fontsource-variable/unbounded',
    '@fontsource-variable/manrope',
    'lenis/dist/lenis.css',
    '~/assets/css/main.css',
  ],

  runtimeConfig: {
    public: { siteUrl: SITE_URL },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      titleTemplate: '%s · Dia’s Taste',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#1E0F0A' },
        { name: 'format-detection', content: 'telephone=no' },
        { property: 'og:site_name', content: 'Dia’s Taste' },
        { property: 'og:type', content: 'website' },
        { property: 'og:image', content: `${SITE_URL}/images/og.jpg` },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', sizes: '64x64', href: '/favicon-64.png' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/icon-192.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
        { rel: 'preload', href: '/models/aloo-bukhara.hero.glb', as: 'fetch', crossorigin: 'anonymous' },
      ],
    },
  },

  vue: {
    compilerOptions: { isCustomElement: (tag) => tag === 'model-viewer' },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/flavours', '/privacy', '/terms', '/cookies', '/accessibility'],
    },
  },

  vite: {
    optimizeDeps: { include: ['three', 'gsap', 'gsap/ScrollTrigger', 'gsap/SplitText', 'lenis', 'qrcode'] },
  },
})
