<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef } from 'vue'

import { useThreeScene } from '@/composables/useThreeScene'

const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
const { init, dispose } = useThreeScene()

onMounted(() => {
  if (canvas.value)
    init(canvas.value)
})

onUnmounted(() => {
  dispose()
})
</script>

<template>
  <main class="home-view" aria-labelledby="page-title">
    <div class="scene-label">
      <p>Three.js Phase 1</p>
      <h1 id="page-title">
        Floating Cube With Three Lights
      </h1>
    </div>

    <canvas ref="canvas" class="three-canvas" data-testid="three-canvas" />
  </main>
</template>

<style scoped>
.home-view {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: #101820;
}

.scene-label {
  position: absolute;
  z-index: 1;
  top: 24px;
  left: 24px;
  color: #f6f8fb;
  text-shadow: 0 1px 16px rgb(0 0 0 / 45%);
  pointer-events: none;
}

.scene-label p {
  margin: 0 0 6px;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.scene-label h1 {
  margin: 0;
  font-size: 1.5rem;
  line-height: 1.15;
  letter-spacing: 0;
}

.three-canvas {
  display: block;
  width: 100vw;
  height: 100vh;
}
</style>
