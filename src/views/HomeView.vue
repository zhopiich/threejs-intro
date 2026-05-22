<script setup lang="ts">
import type { LightSettings } from '@/composables/useThreeScene'

import { ref } from 'vue'

import LightControlPanel from '@/components/model-viewer/LightControlPanel.vue'
import ModelColorPicker from '@/components/model-viewer/ModelColorPicker.vue'
import ModelInfoPanel from '@/components/model-viewer/ModelInfoPanel.vue'
import SceneCanvas from '@/components/model-viewer/SceneCanvas.vue'

const isModelSelected = ref(false)
const modelColor = ref('#66a3ff')
const modelColorOptions = ['#66a3ff', '#ff6b6b', '#51cf66']
const lightSettings = ref<LightSettings>({
  ambientColor: '#ffffff',
  ambientIntensity: 0.5,
  directionalColor: '#ffffff',
  directionalIntensity: 3,
  pointColor: '#ffb86c',
  pointIntensity: 6,
  pointPosition: {
    x: -2,
    y: 1.6,
    z: 1.5,
  },
})

function updatePointLightPosition(position: LightSettings['pointPosition']) {
  lightSettings.value = {
    ...lightSettings.value,
    pointPosition: position,
  }
}
</script>

<template>
  <main class="home-view" aria-labelledby="model-viewer-title">
    <SceneCanvas
      :model-color="modelColor"
      :light-settings="lightSettings"
      @model-selected="isModelSelected = $event"
      @point-light-position-changed="updatePointLightPosition"
    />

    <div class="viewer-shell">
      <div class="viewer-primary-panel">
        <ModelInfoPanel :is-model-selected="isModelSelected" />
        <ModelColorPicker v-model="modelColor" :options="modelColorOptions" />
      </div>

      <LightControlPanel v-model:settings="lightSettings" />
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
}

.viewer-primary-panel {
  display: grid;
  align-content: start;
  gap: 18px;
}

@media (width <= 760px) {
  .viewer-shell {
    inset: 16px;
    flex-direction: column;
    justify-content: space-between;
  }
}
</style>
