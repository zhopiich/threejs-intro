import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

import { normalizeToneMappingExposure } from './displaySettings'

interface ConfigurableRenderer {
  outputColorSpace: string | undefined
  setPixelRatio: (pixelRatio: number) => void
  setSize: (width: number, height: number) => void
  shadowMap: { enabled: boolean }
  toneMapping: number | undefined
  toneMappingExposure: number
}

export function configureRenderer(
  renderer: ConfigurableRenderer,
  width: number,
  height: number,
  pixelRatio: number,
) {
  renderer.setPixelRatio(Math.min(pixelRatio, 2))
  renderer.setSize(width, height)
  renderer.shadowMap.enabled = true
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1
}

export function useSceneRenderer() {
  let renderer: THREE.WebGLRenderer | undefined
  let controls: OrbitControls | undefined
  let environmentTexture: THREE.Texture | undefined

  function createRenderer(
    canvasElement: HTMLCanvasElement,
    width: number,
    height: number,
    pixelRatio = window.devicePixelRatio,
  ) {
    renderer = new THREE.WebGLRenderer({
      canvas: canvasElement,
      antialias: true,
    })

    configureRenderer(renderer, width, height, pixelRatio)

    return renderer
  }

  function updateViewport(width: number, height: number, pixelRatio = window.devicePixelRatio) {
    if (!renderer)
      return

    renderer.setPixelRatio(Math.min(pixelRatio, 2))
    renderer.setSize(width, height)
  }

  function addEnvironmentLighting(scene: THREE.Scene) {
    if (!renderer)
      return

    const pmremGenerator = new THREE.PMREMGenerator(renderer)
    const roomEnvironment = new RoomEnvironment()

    environmentTexture = pmremGenerator.fromScene(roomEnvironment).texture
    scene.environment = environmentTexture

    roomEnvironment.dispose()
    pmremGenerator.dispose()
  }

  function createControls(camera: THREE.PerspectiveCamera) {
    if (!renderer)
      return undefined

    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.target.set(0, 0, 0)
    controls.update()

    return controls
  }

  function setControlsEnabled(enabled: boolean) {
    if (controls)
      controls.enabled = enabled
  }

  function setControlsAutoRotate(autoRotate: boolean) {
    if (controls)
      controls.autoRotate = autoRotate
  }

  function updateControls() {
    controls?.update()
  }

  function setToneMappingExposure(exposure: number) {
    if (renderer)
      renderer.toneMappingExposure = normalizeToneMappingExposure(exposure)
  }

  function render(scene: THREE.Scene, camera: THREE.Camera) {
    renderer?.render(scene, camera)
  }

  function dispose(scene?: THREE.Scene) {
    if (scene && scene.environment === environmentTexture)
      scene.environment = null

    environmentTexture?.dispose()
    environmentTexture = undefined

    controls?.dispose()
    controls = undefined

    renderer?.dispose()
    renderer = undefined
  }

  function getControls() {
    return controls
  }

  function getRenderer() {
    return renderer
  }

  return {
    addEnvironmentLighting,
    createControls,
    createRenderer,
    dispose,
    getControls,
    getRenderer,
    render,
    setControlsAutoRotate,
    setControlsEnabled,
    setToneMappingExposure,
    updateControls,
    updateViewport,
  }
}
