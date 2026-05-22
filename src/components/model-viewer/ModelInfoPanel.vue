<script setup lang="ts">
defineProps<{
  isModelSelected: boolean
}>()
</script>

<template>
  <section class="model-info-panel" aria-labelledby="model-viewer-title">
    <p class="eyebrow">
      Three.js
    </p>
    <h1 id="model-viewer-title">
      Model Viewer Placeholder
    </h1>
    <p class="selection-status">
      {{ isModelSelected ? 'Model selected' : 'Click the model' }}
    </p>
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
</style>
