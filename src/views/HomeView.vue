<script setup lang="ts">
import type {
  LightSettings,
  ModelResourceStats,
  ViewerDisplaySettings,
} from '@/composables/useThreeScene'

import { ref, useTemplateRef } from 'vue'

import DisplayControlPanel from '@/components/model-viewer/DisplayControlPanel.vue'
import LightControlPanel from '@/components/model-viewer/LightControlPanel.vue'
import ModelColorPicker from '@/components/model-viewer/ModelColorPicker.vue'
import ModelInfoPanel from '@/components/model-viewer/ModelInfoPanel.vue'
import ModelLifecycleStats from '@/components/model-viewer/ModelLifecycleStats.vue'
import { modelOptions } from '@/components/model-viewer/modelOptions'
import ModelSelector from '@/components/model-viewer/ModelSelector.vue'
import SceneCanvas from '@/components/model-viewer/SceneCanvas.vue'
import { useModelViewerState } from '@/composables/useModelViewerState'

const defaultModel = modelOptions[0]!

const sceneCanvas = useTemplateRef<InstanceType<typeof SceneCanvas>>('sceneCanvas')
const {
  displayedModel,
  isModelSelected,
  modelLoadingState,
  requestedModelName,
  selectedObjectInfo,
  selectedModel,
  selectedModelId,
  updateModelLoadingState,
  updateSelectedObject,
} = useModelViewerState(modelOptions, defaultModel)
const modelColor = ref('#66a3ff')
const modelColorOptions = ['#66a3ff', '#ff6b6b', '#51cf66']
const isPlaceholderVisible = ref(false)
const modelResourceStats = ref<ModelResourceStats>({
  meshCount: 0,
  materialCount: 0,
  textureCount: 0,
})
const lightSettings = ref<LightSettings>({
  ambientColor: '#ffffff',
  ambientIntensity: 0.2,
  directionalColor: '#ffffff',
  directionalIntensity: 1.2,
  pointColor: '#ffb86c',
  pointIntensity: 2,
  pointPosition: {
    x: -2,
    y: 1.6,
    z: 1.5,
  },
})
const viewerDisplaySettings = ref<ViewerDisplaySettings>({
  autoRotate: false,
  showAxesHelper: true,
  showGridHelper: true,
  showGround: true,
  showPointLightHelper: true,
  toneMappingExposure: 1,
})

function updatePointLightPosition(position: LightSettings['pointPosition']) {
  lightSettings.value = {
    ...lightSettings.value,
    pointPosition: position,
  }
}

function resetView() {
  sceneCanvas.value?.resetCameraView()
}
</script>

<template>
  <main class="home-view" aria-labelledby="model-viewer-title">
    <SceneCanvas
      ref="sceneCanvas"
      :model="selectedModel"
      :model-color="modelColor"
      :light-settings="lightSettings"
      :viewer-display-settings="viewerDisplaySettings"
      @model-loading-state-changed="updateModelLoadingState"
      @model-resource-stats-changed="modelResourceStats = $event"
      @model-selected="updateSelectedObject"
      @placeholder-visible-changed="isPlaceholderVisible = $event"
      @point-light-position-changed="updatePointLightPosition"
    />

    <div class="viewer-shell">
      <div class="viewer-primary-panel">
        <ModelInfoPanel
          :is-model-selected="isModelSelected"
          :loading-state="modelLoadingState"
          :requested-model-name="requestedModelName"
          :displayed-model-name="displayedModel?.name"
          :selected-object-info="selectedObjectInfo"
          @reset-view="resetView"
        />
        <ModelSelector v-model="selectedModelId" :options="modelOptions" />
        <ModelLifecycleStats :stats="modelResourceStats" />
        <ModelColorPicker
          v-if="isPlaceholderVisible"
          v-model="modelColor"
          :options="modelColorOptions"
        />
      </div>

      <div class="viewer-secondary-panel">
        <LightControlPanel v-model:settings="lightSettings" />
        <DisplayControlPanel v-model:settings="viewerDisplaySettings" />
      </div>
    </div>
  </main>
</template>

<style scoped>
.home-view {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: #101820;
}

.viewer-shell {
  position: absolute;
  inset: 24px;
  display: flex;
  justify-content: space-between;
  gap: 24px;
  pointer-events: none;
  user-select: none;
}

.viewer-primary-panel {
  display: grid;
  align-content: start;
  gap: 18px;
}

.viewer-secondary-panel {
  display: grid;
  align-content: start;
  gap: 14px;
}

@media (width <= 760px) {
  .viewer-shell {
    inset: 16px;
    flex-direction: column;
    justify-content: space-between;
  }
}
</style>
