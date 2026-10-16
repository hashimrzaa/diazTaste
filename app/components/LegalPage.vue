<script setup lang="ts">
const props = defineProps<{ title: string; description: string; updated: string; path: string }>()
const config = useRuntimeConfig()
useSeoMeta({ title: props.title, description: props.description, robots: 'index, follow' })
useHead({ link: [{ rel: 'canonical', href: `${config.public.siteUrl}${props.path}` }] })
</script>

<template>
  <div class="legal container">
    <header class="legal__head">
      <p class="eyebrow legal__eyebrow">Legal</p>
      <h1 class="display legal__title">{{ title }}</h1>
      <p class="muted">Last updated {{ updated }}</p>
    </header>
    <div class="prose">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.legal {
  padding-top: calc(var(--header-h) + clamp(48px, 8vw, 110px));
  padding-bottom: clamp(80px, 10vw, 140px);
}
.legal__head {
  display: grid;
  gap: 16px;
  padding-bottom: 32px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--line-strong);
}
.legal__eyebrow {
  color: var(--chili);
}
.legal__title {
  font-size: var(--fs-d1);
}
</style>
