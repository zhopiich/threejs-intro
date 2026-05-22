<script setup lang="ts">
import type { LightSettings } from '@/composables/useThreeScene'

defineProps<{
  settings: LightSettings
}>()

const emit = defineEmits<{
  'update:settings': [settings: LightSettings]
}>()

function updateSettings(settings: LightSettings, patch: Partial<LightSettings>) {
  emit('update:settings', {
    ...settings,
    ...patch,
  })
}

function getInputValue(event: Event) {
  return (event.target as HTMLInputElement).value
}

function updatePointPosition(
  settings: LightSettings,
  axis: keyof LightSettings['pointPosition'],
  value: number,
) {
  emit('update:settings', {
    ...settings,
    pointPosition: {
      ...settings.pointPosition,
      [axis]: value,
    },
  })
}
</script>

<template>
  <section class="light-panel" aria-label="Light controls">
    <div class="control-row">
      <label for="ambient-intensity">Ambient</label>
      <input
        id="ambient-intensity"
        :value="settings.ambientIntensity"
        type="range"
        min="0"
        max="5"
        step="0.05"
        @input="updateSettings(settings, { ambientIntensity: Number(getInputValue($event)) })"
      >
      <input
        :value="settings.ambientColor"
        type="color"
        aria-label="Ambient color"
        @input="updateSettings(settings, { ambientColor: getInputValue($event) })"
      >
    </div>

    <div class="control-row">
      <label for="directional-intensity">Directional</label>
      <input
        id="directional-intensity"
        :value="settings.directionalIntensity"
        type="range"
        min="0"
        max="10"
        step="0.1"
        @input="updateSettings(settings, { directionalIntensity: Number(getInputValue($event)) })"
      >
      <input
        :value="settings.directionalColor"
        type="color"
        aria-label="Directional color"
        @input="updateSettings(settings, { directionalColor: getInputValue($event) })"
      >
    </div>

    <div class="control-row">
      <label for="point-intensity">Point</label>
      <input
        id="point-intensity"
        :value="settings.pointIntensity"
        type="range"
        min="0"
        max="20"
        step="0.1"
        @input="updateSettings(settings, { pointIntensity: Number(getInputValue($event)) })"
      >
      <input
        :value="settings.pointColor"
        type="color"
        aria-label="Point color"
        @input="updateSettings(settings, { pointColor: getInputValue($event) })"
      >
    </div>

    <div class="position-grid" aria-label="Point light position">
      <label>
        X
        <input
          :value="settings.pointPosition.x"
          type="number"
          min="-5"
          max="5"
          step="0.1"
          @input="updatePointPosition(settings, 'x', Number(getInputValue($event)))"
        >
      </label>
      <label>
        Y
        <input
          :value="settings.pointPosition.y"
          type="number"
          min="-1"
          max="5"
          step="0.1"
          @input="updatePointPosition(settings, 'y', Number(getInputValue($event)))"
        >
      </label>
      <label>
        Z
        <input
          :value="settings.pointPosition.z"
          type="number"
          min="-5"
          max="5"
          step="0.1"
          @input="updatePointPosition(settings, 'z', Number(getInputValue($event)))"
        >
      </label>
    </div>
  </section>
</template>

<style scoped>
.light-panel {
  display: grid;
  gap: 12px;
  min-width: min(320px, calc(100vw - 48px));
  padding: 16px;
  color: #f6f8fb;
  background: rgb(16 24 32 / 78%);
  border: 1px solid rgb(255 255 255 / 16%);
  border-radius: 8px;
  backdrop-filter: blur(16px);
}

.control-row {
  display: grid;
  grid-template-columns: 84px minmax(96px, 1fr) 32px;
  gap: 10px;
  align-items: center;
}

label {
  font-size: 0.78rem;
  font-weight: 700;
}

input[type='range'] {
  width: 100%;
}

input[type='color'] {
  width: 32px;
  height: 28px;
  padding: 0;
  border: 1px solid rgb(255 255 255 / 30%);
  border-radius: 4px;
  background: transparent;
}

.position-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.position-grid label {
  display: grid;
  gap: 4px;
}

.position-grid input {
  min-width: 0;
  height: 30px;
  padding: 0 8px;
  color: #f6f8fb;
  background: rgb(255 255 255 / 10%);
  border: 1px solid rgb(255 255 255 / 20%);
  border-radius: 4px;
}
</style>
