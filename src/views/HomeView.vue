<script setup lang="ts">
import * as THREE from 'three'
import { onMounted, onUnmounted, useTemplateRef } from 'vue'

const canvas = useTemplateRef<HTMLCanvasElement>('canvas')

let renderer: THREE.WebGLRenderer | undefined
let scene: THREE.Scene | undefined
let camera: THREE.PerspectiveCamera | undefined
let cube: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial> | undefined
let timer: THREE.Timer | undefined
let animationId: number | undefined

function initScene(canvasElement: HTMLCanvasElement) {
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  }

  scene = new THREE.Scene()
  scene.background = new THREE.Color('#101820')

  camera = new THREE.PerspectiveCamera(60, sizes.width / sizes.height, 0.1, 100)
  camera.position.set(2.5, 2, 4)
  camera.lookAt(0, 0, 0)
  scene.add(camera)

  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshStandardMaterial({ color: '#66a3ff' })
  cube = new THREE.Mesh(geometry, material)
  scene.add(cube)

  const ambientLight = new THREE.AmbientLight('#ffffff', 0.5)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight('#ffffff', 2)
  directionalLight.position.set(3, 4, 5)
  scene.add(directionalLight)

  const axesHelper = new THREE.AxesHelper(2)
  scene.add(axesHelper)

  renderer = new THREE.WebGLRenderer({
    canvas: canvasElement,
    antialias: true,
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(sizes.width, sizes.height)

  timer = new THREE.Timer()
  timer.connect(document)

  function animate(timestamp: number) {
    if (!renderer || !scene || !camera || !cube || !timer)
      return

    timer.update(timestamp)
    const elapsedTime = timer.getElapsed()
    cube.rotation.x = elapsedTime * 0.45
    cube.rotation.y = elapsedTime * 0.8

    renderer.render(scene, camera)
    animationId = window.requestAnimationFrame(animate)
  }

  animationId = window.requestAnimationFrame(animate)
}

function disposeScene() {
  if (animationId !== undefined)
    window.cancelAnimationFrame(animationId)

  cube?.geometry.dispose()
  cube?.material.dispose()
  timer?.dispose()
  renderer?.dispose()

  animationId = undefined
  cube = undefined
  camera = undefined
  scene = undefined
  timer = undefined
  renderer = undefined
}

onMounted(() => {
  if (canvas.value)
    initScene(canvas.value)
})

onUnmounted(() => {
  disposeScene()
})
</script>

<template>
  <main class="home-view" aria-labelledby="page-title">
    <div class="scene-label">
      <p>Three.js Phase 1</p>
      <h1 id="page-title">
        Core Rendering Flow
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
