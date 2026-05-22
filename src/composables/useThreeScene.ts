import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

export interface LightSettings {
  ambientColor: string
  ambientIntensity: number
  directionalColor: string
  directionalIntensity: number
  pointColor: string
  pointIntensity: number
  pointPosition: {
    x: number
    y: number
    z: number
  }
}

export interface ThreeSceneOptions {
  onModelResourceStatsChanged?: (stats: ModelResourceStats) => void
  onModelSelected?: (selected: boolean) => void
  onModelLoadingStateChanged?: (state: ModelLoadingState) => void
  onPlaceholderVisibleChanged?: (visible: boolean) => void
  onPointLightPositionChanged?: (position: LightSettings['pointPosition']) => void
}

export interface ModelLoadingState {
  status: 'idle' | 'loading' | 'loaded' | 'error'
  progress: number
  url?: string
  errorMessage?: string
}

export interface ModelResourceStats {
  meshCount: number
  materialCount: number
  textureCount: number
}

interface CameraFit {
  center: THREE.Vector3
  position: THREE.Vector3
  near: number
  far: number
}

type GLTFLoaderModule = typeof import('three/examples/jsm/loaders/GLTFLoader.js')

let gltfLoaderModulePromise: Promise<GLTFLoaderModule> | undefined

function importGLTFLoader() {
  gltfLoaderModulePromise ??= import('three/examples/jsm/loaders/GLTFLoader.js')

  return gltfLoaderModulePromise
}

export function getHorizontalDragPosition(
  currentPosition: LightSettings['pointPosition'],
  hitPoint: THREE.Vector3,
): LightSettings['pointPosition'] {
  return {
    x: hitPoint.x,
    y: currentPosition.y,
    z: hitPoint.z,
  }
}

export function calculateCameraFit(
  center: THREE.Vector3,
  radius: number,
  cameraFov: number,
  direction = new THREE.Vector3(1, 0.65, 1),
): CameraFit {
  const safeRadius = Math.max(radius, 0.1)
  const fov = THREE.MathUtils.degToRad(cameraFov)
  const distance = (safeRadius / Math.sin(fov / 2)) * 1.15
  const normalizedDirection = direction.clone().normalize()

  return {
    center: center.clone(),
    position: center.clone().add(normalizedDirection.multiplyScalar(distance)),
    near: Math.max(distance / 100, 0.01),
    far: distance * 100,
  }
}

export function disposeMaterialResources(material: THREE.Material) {
  Object.values(material).forEach((value) => {
    if (value instanceof THREE.Texture)
      value.dispose()
  })

  material.dispose()
}

export function disposeObject3DResources(object: THREE.Object3D) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh))
      return

    child.geometry?.dispose()

    if (Array.isArray(child.material))
      child.material.forEach(disposeMaterialResources)
    else if (child.material)
      disposeMaterialResources(child.material)
  })
}

export function collectObject3DResourceStats(object?: THREE.Object3D): ModelResourceStats {
  const stats: ModelResourceStats = {
    meshCount: 0,
    materialCount: 0,
    textureCount: 0,
  }
  const materials = new Set<THREE.Material>()
  const textures = new Set<THREE.Texture>()

  object?.traverse((child) => {
    if (!(child instanceof THREE.Mesh))
      return

    stats.meshCount += 1

    const childMaterials = Array.isArray(child.material)
      ? child.material
      : [child.material]

    childMaterials.forEach((material) => {
      if (!material || materials.has(material))
        return

      materials.add(material)
      Object.values(material).forEach((value) => {
        if (value instanceof THREE.Texture)
          textures.add(value)
      })
    })
  })

  stats.materialCount = materials.size
  stats.textureCount = textures.size

  return stats
}

export function useThreeScene(options: ThreeSceneOptions = {}) {
  let renderer: THREE.WebGLRenderer | undefined
  let scene: THREE.Scene | undefined
  let camera: THREE.PerspectiveCamera | undefined
  let placeholderMesh: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial> | undefined
  let loadedModel: THREE.Group | undefined
  let ground: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial> | undefined
  let ambientLight: THREE.AmbientLight | undefined
  let directionalLight: THREE.DirectionalLight | undefined
  let pointLight: THREE.PointLight | undefined
  let pointLightHandle: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial> | undefined
  let pointLightHelper: THREE.PointLightHelper | undefined
  let environmentTexture: THREE.Texture | undefined
  let controls: OrbitControls | undefined
  let timer: THREE.Timer | undefined
  let animationId: number | undefined
  let canvas: HTMLCanvasElement | undefined
  let isDraggingPointLight = false
  let lastCameraFit: CameraFit | undefined
  let modelLoadId = 0
  let selectableObjects: THREE.Object3D[] = []

  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  const dragPlane = new THREE.Plane()
  const dragHitPoint = new THREE.Vector3()

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

  function createPlaceholderMesh() {
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshStandardMaterial({
      color: '#66a3ff',
      roughness: 0.4,
      metalness: 0.6,
      wireframe: false,
    })
    const placeholderMesh = new THREE.Mesh(geometry, material)
    placeholderMesh.castShadow = true

    return placeholderMesh
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
    ambientLight = new THREE.AmbientLight('#ffffff', 0.2)
    scene.add(ambientLight)

    directionalLight = new THREE.DirectionalLight('#ffffff', 1.2)
    directionalLight.position.set(3, 4, 5)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.set(1024, 1024)
    scene.add(directionalLight)

    pointLight = new THREE.PointLight('#ffb86c', 2, 8)
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

  function createPointLightHandle(pointLight: THREE.PointLight) {
    const geometry = new THREE.SphereGeometry(0.12, 24, 16)
    const material = new THREE.MeshBasicMaterial({ color: pointLight.color })
    const handle = new THREE.Mesh(geometry, material)
    handle.position.copy(pointLight.position)

    return handle
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

  function handleCanvasPointerDown(event: PointerEvent) {
    if (!canvas || !camera)
      return

    updatePointer(event)

    raycaster.setFromCamera(pointer, camera)

    if (pointLightHandle && pointLight) {
      const lightHandleHits = raycaster.intersectObject(pointLightHandle)

      if (lightHandleHits.length > 0) {
        isDraggingPointLight = true
        if (controls)
          controls.enabled = false
        dragPlane.set(new THREE.Vector3(0, 1, 0), -pointLight.position.y)
        canvas.setPointerCapture(event.pointerId)
        options.onModelSelected?.(false)
        return
      }
    }

    const hits = raycaster.intersectObjects(selectableObjects, true)

    options.onModelSelected?.(hits.length > 0)
  }

  function handleCanvasPointerMove(event: PointerEvent) {
    if (!canvas || !camera || !pointLight || !pointLightHandle || !isDraggingPointLight)
      return

    updatePointer(event)
    raycaster.setFromCamera(pointer, camera)

    if (!raycaster.ray.intersectPlane(dragPlane, dragHitPoint))
      return

    const nextPosition = getHorizontalDragPosition(pointLight.position, dragHitPoint)
    pointLight.position.set(nextPosition.x, nextPosition.y, nextPosition.z)
    pointLightHandle.position.copy(pointLight.position)
    pointLightHelper?.update()
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
    placeholderMesh?.material.color.set(color)
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

        disposeLoadedModel()
        disposePlaceholderMesh()

        loadedModel = gltf.scene
        normalizeLoadedModel(loadedModel)
        prepareLoadedModel(loadedModel)

        scene.add(loadedModel)
        fitCameraToObject(loadedModel)
        emitCurrentModelResourceStats()
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

  function normalizeLoadedModel(model: THREE.Group) {
    const box = new THREE.Box3().setFromObject(model)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()

    box.getSize(size)
    box.getCenter(center)

    const maxAxis = Math.max(size.x, size.y, size.z)
    const scale = maxAxis > 0 ? 1.8 / maxAxis : 1

    model.scale.setScalar(scale)
    model.position.set(
      -center.x * scale,
      -center.y * scale,
      -center.z * scale,
    )
  }

  function prepareLoadedModel(model: THREE.Group) {
    selectableObjects = []

    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh))
        return

      child.castShadow = true
      child.receiveShadow = true
      selectableObjects.push(child)
    })
  }

  function fitCameraToObject(object: THREE.Object3D) {
    if (!camera || !controls)
      return

    const box = new THREE.Box3().setFromObject(object)
    const sphere = new THREE.Sphere()

    box.getBoundingSphere(sphere)
    lastCameraFit = calculateCameraFit(sphere.center, sphere.radius, camera.fov)
    resetCameraView()
  }

  function resetCameraView() {
    if (!camera || !controls || !lastCameraFit)
      return

    camera.position.copy(lastCameraFit.position)
    camera.near = lastCameraFit.near
    camera.far = lastCameraFit.far
    camera.updateProjectionMatrix()

    controls.target.copy(lastCameraFit.center)
    controls.update()
  }

  function disposePlaceholderMesh() {
    if (!placeholderMesh)
      return

    scene?.remove(placeholderMesh)
    placeholderMesh.geometry.dispose()
    placeholderMesh.material.dispose()
    placeholderMesh = undefined
    options.onPlaceholderVisibleChanged?.(false)
  }

  function disposeLoadedModel() {
    if (!loadedModel)
      return

    scene?.remove(loadedModel)
    disposeObject3DResources(loadedModel)
    loadedModel = undefined
    selectableObjects = placeholderMesh ? [placeholderMesh] : []
    emitCurrentModelResourceStats()
  }

  function emitCurrentModelResourceStats() {
    options.onModelResourceStatsChanged?.(
      collectObject3DResourceStats(loadedModel ?? placeholderMesh),
    )
  }

  function setLightSettings(settings: LightSettings) {
    if (ambientLight) {
      ambientLight.color.set(settings.ambientColor)
      ambientLight.intensity = settings.ambientIntensity
    }

    if (directionalLight) {
      directionalLight.color.set(settings.directionalColor)
      directionalLight.intensity = settings.directionalIntensity
    }

    if (pointLight) {
      pointLight.color.set(settings.pointColor)
      pointLight.intensity = settings.pointIntensity
      pointLight.position.set(
        settings.pointPosition.x,
        settings.pointPosition.y,
        settings.pointPosition.z,
      )
      if (pointLightHandle) {
        pointLightHandle.material.color.set(settings.pointColor)
        pointLightHandle.position.copy(pointLight.position)
      }
      pointLightHelper?.update()
    }
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
      if (!renderer || !scene || !camera || !timer)
        return

      timer.update(timestamp)
      const elapsedTime = timer.getElapsed()
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
    disposeLoadedModel()
    disposePlaceholderMesh()
    scene?.environment?.dispose()
    if (scene)
      scene.environment = null
    environmentTexture = undefined
    pointLightHandle?.geometry.dispose()
    pointLightHandle?.material.dispose()
    ground?.geometry.dispose()
    ground?.material.dispose()
    pointLightHelper?.dispose()
    controls?.dispose()
    timer?.dispose()
    renderer?.dispose()
  }

  function resetSceneReferences() {
    animationId = undefined
    placeholderMesh = undefined
    loadedModel = undefined
    ground = undefined
    ambientLight = undefined
    directionalLight = undefined
    pointLight = undefined
    pointLightHandle = undefined
    pointLightHelper = undefined
    environmentTexture = undefined
    controls = undefined
    camera = undefined
    scene = undefined
    timer = undefined
    renderer = undefined
    canvas = undefined
    selectableObjects = []
    isDraggingPointLight = false
    lastCameraFit = undefined
    modelLoadId += 1
  }

  function init(canvasElement: HTMLCanvasElement) {
    canvas = canvasElement
    const sizes = getViewportSize()

    scene = new THREE.Scene()
    scene.background = new THREE.Color('#101820')

    camera = createCamera(sizes.width, sizes.height)
    scene.add(camera)

    placeholderMesh = createPlaceholderMesh()
    scene.add(placeholderMesh)
    selectableObjects = [placeholderMesh]
    emitCurrentModelResourceStats()
    options.onPlaceholderVisibleChanged?.(true)

    ground = createGround()
    scene.add(ground)

    const pointLight = addLights(scene)
    pointLightHandle = createPointLightHandle(pointLight)
    scene.add(pointLightHandle)

    addHelpers(scene, pointLight)

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

  return { init, dispose, loadModel, resetCameraView, setLightSettings, setModelColor }
}
