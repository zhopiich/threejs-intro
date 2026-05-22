<script setup lang="ts">
import type { ModelOption } from './modelOptions'

defineProps<{
  modelValue: string
  options: ModelOption[]
}>()

const emit = defineEmits<{
  'update:modelValue': [modelId: string]
}>()
</script>

<template>
  <label class="model-selector">
    <span>Model</span>
    <select
      :value="modelValue"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option
        v-for="option in options"
        :key="option.id"
        :value="option.id"
      >
        {{ option.name }}
      </option>
    </select>
  </label>
</template>

<style scoped>
.model-selector {
  display: grid;
  gap: 8px;
  width: min(260px, calc(100vw - 48px));
  color: #f6f8fb;
  font-size: 0.8rem;
  font-weight: 700;
  text-shadow: 0 1px 16px rgb(0 0 0 / 45%);
  pointer-events: auto;
}

.model-selector select {
  min-width: 0;
  height: 34px;
  padding: 0 10px;
  color: #f6f8fb;
  background: rgb(16 24 32 / 78%);
  border: 1px solid rgb(255 255 255 / 22%);
  border-radius: 6px;
  backdrop-filter: blur(16px);
}
</style>
