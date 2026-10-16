<script setup lang="ts">
/** The official Dia’s Taste badge (vector, square). Colour on light
 *  backgrounds, cream knock-out on dark ones. `mark` is the same square badge,
 *  used where a compact icon is wanted. */
withDefaults(defineProps<{ mark?: boolean; dark?: boolean; tagline?: boolean }>(), {
  mark: false,
  dark: false,
  tagline: true,
})
</script>

<template>
  <img
    class="logo"
    :class="{ 'logo--mark': mark }"
    :src="dark ? '/brand/dias-logo-cream.svg' : '/brand/dias-logo.svg'"
    width="1080"
    height="1080"
    alt="Dia’s Taste — Ghar ka Zaiqa"
    decoding="async"
  />
</template>

<style scoped>
.logo {
  display: block;
  height: var(--logo-h, 100%);
  width: auto;
  object-fit: contain;
}
</style>
