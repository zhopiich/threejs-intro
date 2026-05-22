<script setup lang="ts">
import type { ModelResourceStats } from '@/composables/useThreeScene'

defineProps<{
  stats: ModelResourceStats
}>()
</script>

<template>
  <section class="lifecycle-stats" aria-label="Model lifecycle stats">
    <span>Meshes {{ stats.meshCount }}</span>
    <span>Materials {{ stats.materialCount }}</span>
    <span>Textures {{ stats.textureCount }}</span>
  </section>
</template>

<style scoped>
.lifecycle-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-width: min(320px, calc(100vw - 48px));
  color: #f6f8fb;
  font-size: 0.74rem;
  font-weight: 700;
  text-shadow: 0 1px 16px rgb(0 0 0 / 45%);
  pointer-events: none;
}

.lifecycle-stats span {
  padding: 5px 8px;
  background: rgb(16 24 32 / 70%);
  border: 1px solid rgb(255 255 255 / 16%);
  border-radius: 6px;
  backdrop-filter: blur(16px);
}
</style>
