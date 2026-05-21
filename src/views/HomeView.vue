<script setup lang="ts">
import { onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue'

import { useThreeScene } from '@/composables/useThreeScene'

const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
const isCubeSelected = ref(false)
const cubeColor = ref('#66a3ff')
const cubeColorOptions = ['#66a3ff', '#ff6b6b', '#51cf66']
const { init, dispose, setCubeColor } = useThreeScene({
  onCubeSelected(selected) {
    isCubeSelected.value = selected
  },
})

watch(cubeColor, (color) => {
  setCubeColor(color)
})

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
      <p class="selection-status">
        {{ isCubeSelected ? 'Cube selected' : 'Click the cube' }}
      </p>
      <fieldset class="color-controls">
        <legend>Cube color</legend>
        <button
          v-for="color in cubeColorOptions"
          :key="color"
          class="color-swatch"
          :class="{ 'is-active': color === cubeColor }"
          :style="{ backgroundColor: color }"
          type="button"
          :aria-label="`Set cube color to ${color}`"
          @click="cubeColor = color"
        />
      </fieldset>
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

.scene-label .selection-status {
  margin-top: 10px;
  text-transform: none;
}

.color-controls {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 0;
  margin: 12px 0 0;
  border: 0;
  pointer-events: auto;
}

.color-controls legend {
  margin-bottom: 8px;
  font-size: 0.8rem;
  font-weight: 700;
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
