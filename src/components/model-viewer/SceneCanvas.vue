<script setup lang="ts">
import type { ModelOption } from './modelOptions'
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
  model: ModelOption
  modelColor: string
  lightSettings: LightSettings
  viewerDisplaySettings: ViewerDisplaySettings
}>()

const emit = defineEmits<{
  modelResourceStatsChanged: [stats: ModelResourceStats]
  modelSelected: [info: SelectedObjectInfo | undefined]
  modelLoadingStateChanged: [state: ModelLoadingState]
  primitiveVisibleChanged: [visible: boolean]
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
  showPrimitiveModel,
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
  onPrimitiveVisibleChanged(visible) {
    emit('primitiveVisibleChanged', visible)
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

watch(() => props.model, (model) => {
  if (model.kind === 'primitive') {
    showPrimitiveModel(model.primitive)
    setModelColor(props.modelColor)
    return
  }

  loadModel(model.url)
})

onMounted(() => {
  if (!canvas.value)
    return

  init(canvas.value)
  setModelColor(props.modelColor)
  setLightSettings(props.lightSettings)
  setViewerDisplaySettings(props.viewerDisplaySettings)

  if (props.model.kind === 'primitive')
    showPrimitiveModel(props.model.primitive)
  else
    loadModel(props.model.url)
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
