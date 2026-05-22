<script setup lang="ts">
import type {
  LightSettings,
  ModelLoadingState,
  ModelResourceStats,
  SelectedObjectInfo,
  ViewerDisplaySettings,
} from '@/composables/useThreeScene'

import { onMounted, onUnmounted, useTemplateRef, watch } from 'vue'

import { useThreeScene } from '@/composables/useThreeScene'

const props = defineProps<{
  modelUrl: string
  modelColor: string
  lightSettings: LightSettings
  viewerDisplaySettings: ViewerDisplaySettings
}>()

const emit = defineEmits<{
  modelResourceStatsChanged: [stats: ModelResourceStats]
  modelSelected: [info: SelectedObjectInfo | undefined]
  modelLoadingStateChanged: [state: ModelLoadingState]
  placeholderVisibleChanged: [visible: boolean]
  pointLightPositionChanged: [position: LightSettings['pointPosition']]
}>()

const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
const {
  init,
  dispose,
  loadModel,
  resetCameraView,
  setLightSettings,
  setModelColor,
  setViewerDisplaySettings,
} = useThreeScene({
  onModelResourceStatsChanged(stats) {
    emit('modelResourceStatsChanged', stats)
  },
  onModelSelected(info) {
    emit('modelSelected', info)
  },
  onModelLoadingStateChanged(state) {
    emit('modelLoadingStateChanged', state)
  },
  onPlaceholderVisibleChanged(visible) {
    emit('placeholderVisibleChanged', visible)
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

watch(() => props.viewerDisplaySettings, (settings) => {
  setViewerDisplaySettings(settings)
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
  setViewerDisplaySettings(props.viewerDisplaySettings)
  loadModel(props.modelUrl)
})

onUnmounted(() => {
  dispose()
})

defineExpose({
  resetCameraView,
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
