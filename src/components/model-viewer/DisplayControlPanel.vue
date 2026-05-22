<script setup lang="ts">
import type { ViewerDisplaySettings } from '@/composables/useThreeScene'

defineProps<{
  settings: ViewerDisplaySettings
}>()

const emit = defineEmits<{
  'update:settings': [settings: ViewerDisplaySettings]
}>()

function updateSettings(settings: ViewerDisplaySettings, patch: Partial<ViewerDisplaySettings>) {
  emit('update:settings', {
    ...settings,
    ...patch,
  })
}

function getInputValue(event: Event) {
  return (event.target as HTMLInputElement).value
}

function getInputChecked(event: Event) {
  return (event.target as HTMLInputElement).checked
}
</script>

<template>
  <section class="display-panel" aria-label="Display controls">
    <label class="toggle-row">
      <span>Auto rotate</span>
      <input
        :checked="settings.autoRotate"
        type="checkbox"
        @change="updateSettings(settings, { autoRotate: getInputChecked($event) })"
      >
    </label>

    <label class="toggle-row">
      <span>Grid</span>
      <input
        :checked="settings.showGridHelper"
        type="checkbox"
        @change="updateSettings(settings, { showGridHelper: getInputChecked($event) })"
      >
    </label>

    <label class="toggle-row">
      <span>Axes</span>
      <input
        :checked="settings.showAxesHelper"
        type="checkbox"
        @change="updateSettings(settings, { showAxesHelper: getInputChecked($event) })"
      >
    </label>

    <label class="toggle-row">
      <span>Ground</span>
      <input
        :checked="settings.showGround"
        type="checkbox"
        @change="updateSettings(settings, { showGround: getInputChecked($event) })"
      >
    </label>

    <label class="toggle-row">
      <span>Light helper</span>
      <input
        :checked="settings.showPointLightHelper"
        type="checkbox"
        @change="updateSettings(settings, { showPointLightHelper: getInputChecked($event) })"
      >
    </label>

    <div class="control-row">
      <label for="tone-mapping-exposure">Exposure</label>
      <input
        id="tone-mapping-exposure"
        :value="settings.toneMappingExposure"
        type="range"
        min="0"
        max="3"
        step="0.05"
        @input="updateSettings(settings, { toneMappingExposure: Number(getInputValue($event)) })"
      >
      <output>{{ settings.toneMappingExposure.toFixed(2) }}</output>
    </div>
  </section>
</template>

<style scoped>
.display-panel {
  display: grid;
  gap: 10px;
  min-width: min(320px, calc(100vw - 48px));
  padding: 16px;
  color: #f6f8fb;
  background: rgb(16 24 32 / 78%);
  border: 1px solid rgb(255 255 255 / 16%);
  border-radius: 8px;
  backdrop-filter: blur(16px);
  pointer-events: auto;
}

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 26px;
  font-size: 0.78rem;
  font-weight: 700;
}

input[type='checkbox'] {
  width: 16px;
  height: 16px;
  accent-color: #66a3ff;
}

.control-row {
  display: grid;
  grid-template-columns: 64px minmax(96px, 1fr) 44px;
  gap: 10px;
  align-items: center;
  padding-top: 2px;
}

.control-row label,
output {
  font-size: 0.78rem;
  font-weight: 700;
}

input[type='range'] {
  width: 100%;
}
</style>
