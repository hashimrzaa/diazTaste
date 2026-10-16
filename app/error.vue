<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
useSeoMeta({ title: props.error.statusCode === 404 ? 'Page not found' : 'Something went wrong', robots: 'noindex' })
const home = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="err">
    <BrandLogo mark class="err__mark" />
    <p class="eyebrow err__code">Error {{ error.statusCode }}</p>
    <h1 class="display err__title">{{ error.statusCode === 404 ? 'This jar is empty.' : 'Something spilled.' }}</h1>
    <p class="lead">
      {{ error.statusCode === 404 ? 'The page you’re looking for doesn’t exist — but our chutneys do.' : 'Please try again in a moment.' }}
    </p>
    <button class="btn" @click="home">Back to the kitchen</button>
  </div>
</template>

<style scoped>
.err {
  min-height: 100svh;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 18px;
  padding: var(--gutter);
  text-align: center;
}
.err__mark {
  --logo-h: 110px;
}
.err__code {
  color: var(--chili);
}
.err__title {
  font-size: var(--fs-d1);
}
</style>
