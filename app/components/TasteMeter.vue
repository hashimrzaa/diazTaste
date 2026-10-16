<script setup lang="ts">
const props = withDefaults(defineProps<{ taste: { sweet: number; tangy: number; heat: number }; compact?: boolean }>(), { compact: false })
const rows = computed(() => [
  { label: 'Sweet', value: props.taste.sweet },
  { label: 'Tangy', value: props.taste.tangy },
  { label: 'Heat', value: props.taste.heat },
])
</script>

<template>
  <dl class="tm" :class="{ 'tm--compact': compact }">
    <div v-for="r in rows" :key="r.label" class="tm__row">
      <dt>{{ r.label }}</dt>
      <dd :aria-label="`${r.value} out of 5`">
        <span v-for="n in 5" :key="n" class="tm__seg" :class="{ on: n <= r.value }" />
      </dd>
    </div>
  </dl>
</template>

<style scoped>
.tm {
  display: grid;
  gap: 10px;
}
.tm__row {
  display: grid;
  grid-template-columns: 64px 1fr;
  align-items: center;
  gap: 16px;
}
.tm dt {
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.75;
}
.tm dd {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 5px;
  max-width: 220px;
}
.tm__seg {
  height: 7px;
  border-radius: 99px;
  background: currentColor;
  opacity: 0.14;
  transform-origin: left;
  transition: opacity 0.6s var(--ease-out);
}
.tm__seg.on {
  opacity: 1;
  background: var(--accent);
}
.tm--compact .tm__row {
  grid-template-columns: 52px 1fr;
  gap: 10px;
}
.tm--compact dd {
  max-width: 130px;
}
.tm--compact .tm__seg {
  height: 5px;
}
</style>
