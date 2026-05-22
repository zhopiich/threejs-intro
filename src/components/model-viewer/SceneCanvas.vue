<script setup lang="ts">
import type { LightSettings, ModelLoadingState } from '@/composables/useThreeScene'

import { onMounted, onUnmounted, useTemplateRef, watch } from 'vue'

import { useThreeScene } from '@/composables/useThreeScene'

const props = defineProps<{
  modelUrl: string
  modelColor: string
  lightSettings: LightSettings
}>()

const emit = defineEmits<{
  modelSelected: [selected: boolean]
  modelLoadingStateChanged: [state: ModelLoadingState]
  pointLightPositionChanged: [position: LightSettings['pointPosition']]
}>()

const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
const { init, dispose, loadModel, setLightSettings, setModelColor } = useThreeScene({
  onModelSelected(selected) {
    emit('modelSelected', selected)
  },
  onModelLoadingStateChanged(state) {
    emit('modelLoadingStateChanged', state)
  },
  onPointLightPositionChanged(position) {
    emit('pointLightPositionChanged', position)
  },
})

watch(() => props.modelColor, (color) => {
  setModelColor(color)
})

watch(() => props.lightSettings, (settings) => {
  setLightSettings(settings)
}, { deep: true })

watch(() => props.modelUrl, (url) => {
  loadModel(url)
})

onMounted(() => {
  if (!canvas.value)
    return

  init(canvas.value)
  setModelColor(props.modelColor)
  setLightSettings(props.lightSettings)
  loadModel(props.modelUrl)
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
