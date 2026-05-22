import type { LightSettings, ThreeSceneOptions, ViewerDisplaySettings } from './three/sceneTypes'

import * as THREE from 'three'

import { getModelLoadErrorMessage, getModelLoadProgress, importGLTFLoader } from './three/modelLoading'
import { disposeObject3DResources } from './three/modelResources'
import { useSceneAnimationLoop } from './three/useSceneAnimationLoop'
import { useSceneCamera } from './three/useSceneCamera'
import { useSceneHelpers } from './three/useSceneHelpers'
import { useSceneInteraction } from './three/useSceneInteraction'
import { useSceneLights } from './three/useSceneLights'
import { useSceneModels } from './three/useSceneModels'
import { useSceneRenderer } from './three/useSceneRenderer'

export { calculateCameraFit } from './three/cameraFit'
export { normalizeToneMappingExposure } from './three/displaySettings'
export { getHorizontalDragPosition, getNormalizedPointerPosition, getSelectedObjectInfo } from './three/interaction'
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

export function useThreeScene(options: ThreeSceneOptions = {}) {
  let scene: THREE.Scene | undefined
  let canvas: HTMLCanvasElement | undefined
  let isDraggingPointLight = false
  let modelLoadId = 0

  const sceneAnimationLoop = useSceneAnimationLoop()
  const sceneCamera = useSceneCamera()
  const sceneHelpers = useSceneHelpers()
  const sceneInteraction = useSceneInteraction()
  const sceneLights = useSceneLights()
  const sceneModels = useSceneModels(options)
  const sceneRenderer = useSceneRenderer()

  function getViewportSize() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    }
  }

  function updateRendererSize() {
    const { width, height } = getViewportSize()

    sceneCamera.updateViewport(width, height)
    sceneRenderer.updateViewport(width, height)
  }

  function handleCanvasPointerDown(event: PointerEvent) {
    const camera = sceneCamera.getCamera()

    if (!canvas || !camera)
      return

    updatePointer(event)
    sceneInteraction.setRayFromCamera(camera)

    const pointLight = sceneLights.getPointLight()
    const pointLightHandle = sceneLights.getPointLightHandle()

    if (pointLightHandle && pointLight) {
      if (sceneInteraction.isObjectHit(pointLightHandle)) {
        isDraggingPointLight = true
        sceneRenderer.setControlsEnabled(false)
        sceneInteraction.setHorizontalDragPlane(pointLight.position.y)
        canvas.setPointerCapture(event.pointerId)
        options.onModelSelected?.(undefined)
        return
      }
    }

    options.onModelSelected?.(
      sceneInteraction.getSelectedObjectInfo(sceneModels.getSelectableObjects()),
    )
  }

  function handleCanvasPointerMove(event: PointerEvent) {
    const camera = sceneCamera.getCamera()
    const pointLight = sceneLights.getPointLight()
    const pointLightHandle = sceneLights.getPointLightHandle()

    if (!canvas || !camera || !pointLight || !pointLightHandle || !isDraggingPointLight)
      return

    updatePointer(event)
    sceneInteraction.setRayFromCamera(camera)

    const nextPosition = sceneInteraction.getPointLightDragPosition(pointLight.position)
    if (!nextPosition)
      return

    sceneLights.setPointLightPosition(nextPosition)
    options.onPointLightPositionChanged?.(nextPosition)
  }

  function handleCanvasPointerUp(event: PointerEvent) {
    if (!isDraggingPointLight)
      return

    isDraggingPointLight = false
    sceneRenderer.setControlsEnabled(true)

    if (canvas?.hasPointerCapture(event.pointerId))
      canvas.releasePointerCapture(event.pointerId)
  }

  function updatePointer(event: PointerEvent) {
    if (!canvas)
      return

    const rect = canvas.getBoundingClientRect()
    sceneInteraction.updatePointer(event.clientX, event.clientY, rect)
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
        const controls = sceneRenderer.getControls()
        if (controls)
          sceneCamera.fitCameraToObject(gltf.scene, controls)
        options.onModelLoadingStateChanged?.({ status: 'loaded', progress: 1, url })
      },
      (progressEvent) => {
        if (currentLoadId !== modelLoadId)
          return

        options.onModelLoadingStateChanged?.({
          status: 'loading',
          progress: getModelLoadProgress(progressEvent),
          url,
        })
      },
      (error) => {
        if (currentLoadId !== modelLoadId)
          return

        options.onModelLoadingStateChanged?.({
          status: 'error',
          progress: 0,
          url,
          errorMessage: getModelLoadErrorMessage(error),
        })
      },
    )
  }

  function showPlaceholderModel() {
    if (!scene)
      return

    modelLoadId += 1
    sceneModels.showPlaceholderModel(scene)
    options.onModelLoadingStateChanged?.({ status: 'idle', progress: 0 })

    const controls = sceneRenderer.getControls()
    if (controls)
      sceneCamera.resetCameraView(controls)
  }

  function resetCameraView() {
    const controls = sceneRenderer.getControls()

    if (!controls)
      return

    sceneCamera.resetCameraView(controls)
  }

  function setLightSettings(settings: LightSettings) {
    sceneLights.setLightSettings(settings)
  }

  function setViewerDisplaySettings(settings: ViewerDisplaySettings) {
    sceneRenderer.setControlsAutoRotate(settings.autoRotate)
    sceneHelpers.setVisibility(settings)
    sceneLights.setPointLightHelperVisible(settings.showPointLightHelper)
    sceneRenderer.setToneMappingExposure(settings.toneMappingExposure)
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
    sceneAnimationLoop.start((elapsedTime) => {
      const camera = sceneCamera.getCamera()

      if (!sceneRenderer.getRenderer() || !scene || !camera)
        return false

      const placeholderMesh = sceneModels.getPlaceholderMesh()
      if (placeholderMesh) {
        placeholderMesh.position.y = Math.sin(elapsedTime * 1.5) * 0.3
        placeholderMesh.rotation.x = elapsedTime * 0.45
        placeholderMesh.rotation.y = elapsedTime * 0.8
      }

      sceneRenderer.updateControls()
      sceneRenderer.render(scene, camera)
    })
  }

  function disposeSceneResources() {
    sceneModels.disposeLoadedModel(scene)
    sceneModels.disposePlaceholderMesh(scene)
    sceneHelpers.dispose()
    sceneLights.dispose()
    sceneRenderer.dispose(scene)
  }

  function resetSceneReferences() {
    sceneModels.resetReferences()
    sceneHelpers.resetReferences()
    sceneLights.resetReferences()
    sceneCamera.resetReferences()
    scene = undefined
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

    sceneRenderer.createRenderer(canvasElement, sizes.width, sizes.height)
    sceneRenderer.addEnvironmentLighting(scene)
    sceneRenderer.createControls(camera)
    addEventListeners()

    startAnimationLoop()
  }

  function dispose() {
    sceneAnimationLoop.stop()
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
    showPlaceholderModel,
  }
}
