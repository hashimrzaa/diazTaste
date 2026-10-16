<script setup lang="ts">
import { products } from '~/data/products'
import type { Stage } from '~/three/Stage'

const props = withDefaults(defineProps<{ only?: string[]; urls?: Record<string, string> }>(), { only: undefined, urls: undefined })
const emit = defineEmits<{ ready: [stage: Stage]; hover: [index: number] }>()
const canvas = ref<HTMLCanvasElement>()
const progress = useLoadProgress()
let stage: Stage | undefined

const onResize = () => stage?.resize()

onMounted(async () => {
  const { Stage } = await import('~/three/Stage')
  stage = new Stage(
    canvas.value!,
    products.filter((p) => !props.only || props.only.includes(p.slug)).map((p) => ({ slug: p.slug, url: props.urls?.[p.slug] ?? p.model })),
    stageState,
  )
  stage.onHover = (i) => emit('hover', i)
  window.addEventListener('resize', onResize)
  try {
    await stage.load((p) => (progress.value = Math.max(progress.value, p * 0.98)))
  } catch (e) {
    console.error('[stage] failed to load models', e)
  }
  progress.value = 1
  emit('ready', stage)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  stage?.dispose()
  stage = undefined
})

defineExpose({ getStage: () => stage })
</script>

<template>
  <canvas ref="canvas" class="stage" aria-hidden="true" />
</template>

<style scoped>
.stage {
  position: fixed;
  inset: 0;
  z-index: 1;
  /* Follow the real viewport box (inset: 0) so the CSS size and the renderer's
     drawing buffer always agree — a fixed 100lvh here stretched the 3D on phones
     whenever the browser bar was visible. */
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0;
}
</style>
