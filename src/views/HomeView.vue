<script setup lang="ts">
import * as THREE from 'three'
import { onMounted, onUnmounted, useTemplateRef } from 'vue'

const canvas = useTemplateRef<HTMLCanvasElement>('canvas')

let renderer: THREE.WebGLRenderer | undefined
let scene: THREE.Scene | undefined
let camera: THREE.PerspectiveCamera | undefined
let cube: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial> | undefined
let ground: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial> | undefined
let pointLightHelper: THREE.PointLightHelper | undefined
let timer: THREE.Timer | undefined
let animationId: number | undefined

function getViewportSize() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

function createCamera(width: number, height: number) {
  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100)
  camera.position.set(3, 2.4, 4.5)
  camera.lookAt(0, 0.25, 0)

  return camera
}

function createCube() {
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshStandardMaterial({
    color: '#66a3ff',
    roughness: 0.4,
    metalness: 0.6,
    wireframe: false,
  })
  const cube = new THREE.Mesh(geometry, material)
  cube.castShadow = true

  return cube
}

function createGround() {
  const groundGeometry = new THREE.PlaneGeometry(7, 7)
  const groundMaterial = new THREE.MeshStandardMaterial({ color: '#111118', roughness: 0.9 })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -1
  ground.receiveShadow = true

  return ground
}

function addLights(scene: THREE.Scene) {
  const ambientLight = new THREE.AmbientLight('#ffffff', 0.5)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
  directionalLight.position.set(3, 4, 5)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.set(1024, 1024)
  scene.add(directionalLight)

  const pointLight = new THREE.PointLight('#ffb86c', 6, 8)
  pointLight.position.set(-2, 1.6, 1.5)
  scene.add(pointLight)

  return pointLight
}

function addHelpers(scene: THREE.Scene, pointLight: THREE.PointLight) {
  pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2)
  scene.add(pointLightHelper)

  const axesHelper = new THREE.AxesHelper(2)
  scene.add(axesHelper)
}

function updateRendererSize() {
  if (!camera || !renderer)
    return

  const { width, height } = getViewportSize()

  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(width, height)
}

function initScene(canvasElement: HTMLCanvasElement) {
  const sizes = getViewportSize()

  scene = new THREE.Scene()
  scene.background = new THREE.Color('#101820')

  camera = createCamera(sizes.width, sizes.height)
  scene.add(camera)

  cube = createCube()
  scene.add(cube)

  ground = createGround()
  scene.add(ground)

  const pointLight = addLights(scene)
  addHelpers(scene, pointLight)

  renderer = new THREE.WebGLRenderer({
    canvas: canvasElement,
    antialias: true,
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(sizes.width, sizes.height)
  renderer.shadowMap.enabled = true
  window.addEventListener('resize', updateRendererSize)

  timer = new THREE.Timer()
  timer.connect(document)

  function animate(timestamp: number) {
    if (!renderer || !scene || !camera || !cube || !timer)
      return

    timer.update(timestamp)
    const elapsedTime = timer.getElapsed()
    cube.position.y = Math.sin(elapsedTime * 1.5) * 0.3
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

  window.removeEventListener('resize', updateRendererSize)

  cube?.geometry.dispose()
  cube?.material.dispose()
  ground?.geometry.dispose()
  ground?.material.dispose()
  pointLightHelper?.dispose()
  timer?.dispose()
  renderer?.dispose()

  animationId = undefined
  cube = undefined
  ground = undefined
  pointLightHelper = undefined
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
