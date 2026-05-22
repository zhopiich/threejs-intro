<script setup lang="ts">
import type { LightSettings } from '@/composables/useThreeScene'

import { onMounted, onUnmounted, useTemplateRef, watch } from 'vue'

import { useThreeScene } from '@/composables/useThreeScene'

const props = defineProps<{
  modelColor: string
  lightSettings: LightSettings
}>()

const emit = defineEmits<{
  modelSelected: [selected: boolean]
}>()

const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
const { init, dispose, setLightSettings, setModelColor } = useThreeScene({
  onModelSelected(selected) {
    emit('modelSelected', selected)
  },
})

watch(() => props.modelColor, (color) => {
  setModelColor(color)
})

watch(() => props.lightSettings, (settings) => {
  setLightSettings(settings)
}, { deep: true })

onMounted(() => {
  if (!canvas.value)
    return

  init(canvas.value)
  setModelColor(props.modelColor)
  setLightSettings(props.lightSettings)
})

onUnmounted(() => {
  dispose()
})
</script>

<template>
  <canvas ref="canvas" class="scene-canvas" data-testid="three-canvas" />
</template>

<style scoped>
.scene-canvas {
  display: block;
  width: 100vw;
  height: 100vh;
}
</style>
