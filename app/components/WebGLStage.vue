<script setup lang="ts">
import { products } from '~/data/products'
import type { Stage } from '~/three/Stage'

const props = withDefaults(defineProps<{ only?: string[]; urls?: Record<string, string> }>(), { only: undefined, urls: undefined })
const emit = defineEmits<{ ready: [stage: Stage]; hover: [index: number] }>()
const canvas = ref<HTMLCanvasElement>()
const stageReady = useStageReady()
let stage: Stage | undefined

const onResize = () => stage?.resize()

const heroFlavour = useHeroFlavour()
const noWebGL = useNoWebGL()
onMounted(async () => {
  const fail = (e?: unknown) => {
    if (e) console.warn('[stage] 3D unavailable, showing images instead', e)
    noWebGL.value = true
  }
  if (!hasWebGL()) return fail()
  const { Stage } = await import('~/three/Stage')
  try {
    stage = new Stage(
      canvas.value!,
      products.filter((p) => !props.only || props.only.includes(p.slug)).map((p) => ({ slug: p.slug, url: props.urls?.[p.slug] ?? p.model })),
      stageState,
    )
  } catch (e) {
    return fail(e)
  }
  stage.onHover = (i) => emit('hover', i)
  window.addEventListener('resize', onResize)
  try {
    // the splash no longer waits for this: the hero shows the jar's photo
    // until the 3D one is ready, then cross-fades
    await stage.load(undefined, props.only ? 0 : heroFlavour.value)
    stageReady.value = true
  } catch (e) {
    console.error('[stage] failed to load models', e)
    noWebGL.value = true
  }
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
