<script setup lang="ts">
defineProps<{
  modelValue: string
  options: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [color: string]
}>()
</script>

<template>
  <fieldset class="color-controls">
    <legend>Model color</legend>
    <button
      v-for="color in options"
      :key="color"
      class="color-swatch"
      :class="{ 'is-active': color === modelValue }"
      :style="{ backgroundColor: color }"
      type="button"
      :aria-label="`Set model color to ${color}`"
      @click="emit('update:modelValue', color)"
    />
  </fieldset>
</template>

<style scoped>
.color-controls {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 0;
  margin: 0;
  border: 0;
}

.color-controls legend {
  margin-bottom: 8px;
  color: #f6f8fb;
  font-size: 0.8rem;
  font-weight: 700;
  text-shadow: 0 1px 16px rgb(0 0 0 / 45%);
}

.color-swatch {
  width: 28px;
  height: 28px;
  padding: 0;
  border: 2px solid rgb(255 255 255 / 35%);
  border-radius: 999px;
  cursor: pointer;
}

.color-swatch.is-active {
  border-color: #fff;
  box-shadow: 0 0 0 2px rgb(0 0 0 / 35%);
}
</style>
