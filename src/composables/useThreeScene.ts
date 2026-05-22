import type { LightSettings, ThreeSceneOptions, ViewerDisplaySettings } from './three/sceneTypes'

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

import { normalizeToneMappingExposure } from './three/displaySettings'
import { getHorizontalDragPosition, getSelectedObjectInfo } from './three/interaction'
import { disposeObject3DResources } from './three/modelResources'
import { useSceneCamera } from './three/useSceneCamera'
import { useSceneHelpers } from './three/useSceneHelpers'
import { useSceneLights } from './three/useSceneLights'
import { useSceneModels } from './three/useSceneModels'

export { calculateCameraFit } from './three/cameraFit'
export { normalizeToneMappingExposure } from './three/displaySettings'
export { getHorizontalDragPosition, getSelectedObjectInfo } from './three/interaction'
export {
  collectObject3DResourceStats,
  disposeMaterialResources,
  disposeObject3DResources,
} from './three/modelResources'
export type {
  LightSettings,
  ModelLoadingState,
  ModelResourceStats,
  SelectedObjectInfo,
  ThreeSceneOptions,
  ViewerDisplaySettings,
} from './three/sceneTypes'

type GLTFLoaderModule = typeof import('three/examples/jsm/loaders/GLTFLoader.js')

let gltfLoaderModulePromise: Promise<GLTFLoaderModule> | undefined

function importGLTFLoader() {
  gltfLoaderModulePromise ??= import('three/examples/jsm/loaders/GLTFLoader.js')

  return gltfLoaderModulePromise
}

export function useThreeScene(options: ThreeSceneOptions = {}) {
  let renderer: THREE.WebGLRenderer | undefined
  let scene: THREE.Scene | undefined
  let environmentTexture: THREE.Texture | undefined
  let controls: OrbitControls | undefined
  let timer: THREE.Timer | undefined
  let animationId: number | undefined
  let canvas: HTMLCanvasElement | undefined
  let isDraggingPointLight = false
  let modelLoadId = 0

  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  const dragPlane = new THREE.Plane()
  const dragHitPoint = new THREE.Vector3()
  const sceneCamera = useSceneCamera()
  const sceneHelpers = useSceneHelpers()
  const sceneLights = useSceneLights()
  const sceneModels = useSceneModels(options)

  function getViewportSize() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    }
  }

  function updateRendererSize() {
    if (!renderer)
      return

    const { width, height } = getViewportSize()

    sceneCamera.updateViewport(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height)
  }

  function handleCanvasPointerDown(event: PointerEvent) {
    const camera = sceneCamera.getCamera()

    if (!canvas || !camera)
      return

    updatePointer(event)

    raycaster.setFromCamera(pointer, camera)

    const pointLight = sceneLights.getPointLight()
    const pointLightHandle = sceneLights.getPointLightHandle()

    if (pointLightHandle && pointLight) {
      const lightHandleHits = raycaster.intersectObject(pointLightHandle)

      if (lightHandleHits.length > 0) {
        isDraggingPointLight = true
        if (controls)
          controls.enabled = false
        dragPlane.set(new THREE.Vector3(0, 1, 0), -pointLight.position.y)
        canvas.setPointerCapture(event.pointerId)
        options.onModelSelected?.(undefined)
        return
      }
    }

    const hits = raycaster.intersectObjects(sceneModels.getSelectableObjects(), true)

    options.onModelSelected?.(getSelectedObjectInfo(hits[0]?.object))
  }

  function handleCanvasPointerMove(event: PointerEvent) {
    const camera = sceneCamera.getCamera()
    const pointLight = sceneLights.getPointLight()
    const pointLightHandle = sceneLights.getPointLightHandle()

    if (!canvas || !camera || !pointLight || !pointLightHandle || !isDraggingPointLight)
      return

    updatePointer(event)
    raycaster.setFromCamera(pointer, camera)

    if (!raycaster.ray.intersectPlane(dragPlane, dragHitPoint))
      return

    const nextPosition = getHorizontalDragPosition(pointLight.position, dragHitPoint)
    sceneLights.setPointLightPosition(nextPosition)
    options.onPointLightPositionChanged?.(nextPosition)
  }

  function handleCanvasPointerUp(event: PointerEvent) {
    if (!isDraggingPointLight)
      return

    isDraggingPointLight = false
    if (controls)
      controls.enabled = true

    if (canvas?.hasPointerCapture(event.pointerId))
      canvas.releasePointerCapture(event.pointerId)
  }

  function updatePointer(event: PointerEvent) {
    if (!canvas)
      return

    const rect = canvas.getBoundingClientRect()
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  }

  function setModelColor(color: string) {
    sceneModels.setModelColor(color)
  }

  async function loadModel(url: string) {
    if (!scene)
      return

    const currentLoadId = modelLoadId + 1
    modelLoadId = currentLoadId
    options.onModelLoadingStateChanged?.({ status: 'loading', progress: 0, url })

    const { GLTFLoader } = await importGLTFLoader()

    if (currentLoadId !== modelLoadId || !scene)
      return

    const gltfLoader = new GLTFLoader()

    gltfLoader.load(
      url,
      (gltf) => {
        if (currentLoadId !== modelLoadId || !scene) {
          disposeObject3DResources(gltf.scene)
          return
        }

        sceneModels.setLoadedModel(scene, gltf.scene)
        if (controls)
          sceneCamera.fitCameraToObject(gltf.scene, controls)
        options.onModelLoadingStateChanged?.({ status: 'loaded', progress: 1, url })
      },
      (progressEvent) => {
        if (currentLoadId !== modelLoadId)
          return

        const progress = progressEvent.total > 0
          ? progressEvent.loaded / progressEvent.total
          : 0

        options.onModelLoadingStateChanged?.({ status: 'loading', progress, url })
      },
      (error) => {
        if (currentLoadId !== modelLoadId)
          return

        options.onModelLoadingStateChanged?.({
          status: 'error',
          progress: 0,
          url,
          errorMessage: error instanceof Error ? error.message : 'Failed to load model',
        })
      },
    )
  }

  function resetCameraView() {
    if (!controls)
      return

    sceneCamera.resetCameraView(controls)
  }

  function setLightSettings(settings: LightSettings) {
    sceneLights.setLightSettings(settings)
  }

  function setViewerDisplaySettings(settings: ViewerDisplaySettings) {
    if (controls)
      controls.autoRotate = settings.autoRotate

    sceneHelpers.setVisibility(settings)
    sceneLights.setPointLightHelperVisible(settings.showPointLightHelper)

    if (renderer)
      renderer.toneMappingExposure = normalizeToneMappingExposure(settings.toneMappingExposure)
  }

  function createRenderer(canvasElement: HTMLCanvasElement, width: number, height: number) {
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasElement,
      antialias: true,
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height)
    renderer.shadowMap.enabled = true
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1

    return renderer
  }

  function addEnvironmentLighting(scene: THREE.Scene, renderer: THREE.WebGLRenderer) {
    const pmremGenerator = new THREE.PMREMGenerator(renderer)
    const roomEnvironment = new RoomEnvironment()

    environmentTexture = pmremGenerator.fromScene(roomEnvironment).texture
    scene.environment = environmentTexture

    roomEnvironment.dispose()
    pmremGenerator.dispose()
  }

  function createControls(camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.target.set(0, 0, 0)
    controls.update()

    return controls
  }

  function addEventListeners() {
    window.addEventListener('resize', updateRendererSize)
    canvas?.addEventListener('pointerdown', handleCanvasPointerDown)
    canvas?.addEventListener('pointermove', handleCanvasPointerMove)
    canvas?.addEventListener('pointerup', handleCanvasPointerUp)
    canvas?.addEventListener('pointerleave', handleCanvasPointerUp)
  }

  function removeEventListeners() {
    window.removeEventListener('resize', updateRendererSize)
    canvas?.removeEventListener('pointerdown', handleCanvasPointerDown)
    canvas?.removeEventListener('pointermove', handleCanvasPointerMove)
    canvas?.removeEventListener('pointerup', handleCanvasPointerUp)
    canvas?.removeEventListener('pointerleave', handleCanvasPointerUp)
  }

  function startAnimationLoop() {
    function animate(timestamp: number) {
      const camera = sceneCamera.getCamera()

      if (!renderer || !scene || !camera || !timer)
        return

      timer.update(timestamp)
      const elapsedTime = timer.getElapsed()
      const placeholderMesh = sceneModels.getPlaceholderMesh()
      if (placeholderMesh) {
        placeholderMesh.position.y = Math.sin(elapsedTime * 1.5) * 0.3
        placeholderMesh.rotation.x = elapsedTime * 0.45
        placeholderMesh.rotation.y = elapsedTime * 0.8
      }

      controls?.update()
      renderer.render(scene, camera)
      animationId = window.requestAnimationFrame(animate)
    }

    animationId = window.requestAnimationFrame(animate)
  }

  function disposeSceneResources() {
    sceneModels.disposeLoadedModel(scene)
    sceneModels.disposePlaceholderMesh(scene)
    scene?.environment?.dispose()
    if (scene)
      scene.environment = null
    environmentTexture = undefined
    sceneHelpers.dispose()
    sceneLights.dispose()
    controls?.dispose()
    timer?.dispose()
    renderer?.dispose()
  }

  function resetSceneReferences() {
    animationId = undefined
    sceneModels.resetReferences()
    sceneHelpers.resetReferences()
    sceneLights.resetReferences()
    environmentTexture = undefined
    controls = undefined
    sceneCamera.resetReferences()
    scene = undefined
    timer = undefined
    renderer = undefined
    canvas = undefined
    isDraggingPointLight = false
    modelLoadId += 1
  }

  function init(canvasElement: HTMLCanvasElement) {
    canvas = canvasElement
    const sizes = getViewportSize()

    scene = new THREE.Scene()
    scene.background = new THREE.Color('#101820')

    sceneCamera.addToScene(scene, sizes.width, sizes.height)
    const camera = sceneCamera.getCamera()
    if (!camera)
      return

    sceneModels.addPlaceholderToScene(scene)

    sceneHelpers.addToScene(scene)
    sceneLights.addToScene(scene)

    renderer = createRenderer(canvasElement, sizes.width, sizes.height)
    addEnvironmentLighting(scene, renderer)
    controls = createControls(camera, renderer)
    addEventListeners()

    timer = new THREE.Timer()
    timer.connect(document)

    startAnimationLoop()
  }

  function dispose() {
    if (animationId !== undefined)
      window.cancelAnimationFrame(animationId)

    removeEventListeners()
    disposeSceneResources()
    resetSceneReferences()
  }

  return {
    init,
    dispose,
    loadModel,
    resetCameraView,
    setLightSettings,
    setModelColor,
    setViewerDisplaySettings,
  }
}
