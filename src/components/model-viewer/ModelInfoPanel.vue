<script setup lang="ts">
import type { ModelLoadingState } from '@/composables/useThreeScene'

defineProps<{
  isModelSelected: boolean
  loadingState: ModelLoadingState
  requestedModelName: string
  displayedModelName?: string
}>()

const emit = defineEmits<{
  resetView: []
}>()
</script>

<template>
  <section class="model-info-panel" aria-labelledby="model-viewer-title">
    <p class="eyebrow">
      Three.js
    </p>
    <h1 id="model-viewer-title">
      Model Viewer
    </h1>
    <p class="selection-status">
      {{ isModelSelected ? 'Model selected' : 'Click the model' }}
    </p>
    <p class="loading-status">
      <template v-if="loadingState.status === 'loading'">
        Loading {{ requestedModelName }} {{ Math.round(loadingState.progress * 100) }}%
        <span v-if="displayedModelName">
          - Showing {{ displayedModelName }}
        </span>
      </template>
      <template v-else-if="loadingState.status === 'loaded'">
        {{ displayedModelName ?? requestedModelName }} loaded
      </template>
      <template v-else-if="loadingState.status === 'error'">
        Failed to load {{ requestedModelName }}
        <span v-if="loadingState.errorMessage">
          - {{ loadingState.errorMessage }}
        </span>
        <span v-if="displayedModelName">
          - Showing {{ displayedModelName }}
        </span>
      </template>
      <template v-else>
        Placeholder ready
      </template>
    </p>
    <button class="reset-button" type="button" @click="emit('resetView')">
      Reset view
    </button>
  </section>
</template>

<style scoped>
.model-info-panel {
  color: #f6f8fb;
  text-shadow: 0 1px 16px rgb(0 0 0 / 45%);
  pointer-events: none;
}

.eyebrow {
  margin: 0 0 6px;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: 1.5rem;
  line-height: 1.15;
  letter-spacing: 0;
}

.selection-status {
  margin: 10px 0 0;
  font-size: 0.8rem;
  font-weight: 700;
}

.loading-status {
  margin: 6px 0 0;
  max-width: 28rem;
  font-size: 0.8rem;
  font-weight: 700;
}

.reset-button {
  margin-top: 12px;
  padding: 7px 12px;
  color: #f6f8fb;
  font-size: 0.78rem;
  font-weight: 700;
  background: rgb(255 255 255 / 12%);
  border: 1px solid rgb(255 255 255 / 26%);
  border-radius: 6px;
  cursor: pointer;
  pointer-events: auto;
}

.reset-button:hover {
  background: rgb(255 255 255 / 18%);
}
</style>
