import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

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
  onModelSelected?: (selected: boolean) => void
  onPointLightPositionChanged?: (position: LightSettings['pointPosition']) => void
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

export function useThreeScene(options: ThreeSceneOptions = {}) {
  let renderer: THREE.WebGLRenderer | undefined
  let scene: THREE.Scene | undefined
  let camera: THREE.PerspectiveCamera | undefined
  let modelMesh: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial> | undefined
  let ground: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial> | undefined
  let ambientLight: THREE.AmbientLight | undefined
  let directionalLight: THREE.DirectionalLight | undefined
  let pointLight: THREE.PointLight | undefined
  let pointLightHandle: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial> | undefined
  let pointLightHelper: THREE.PointLightHelper | undefined
  let controls: OrbitControls | undefined
  let timer: THREE.Timer | undefined
  let animationId: number | undefined
  let canvas: HTMLCanvasElement | undefined
  let isDraggingPointLight = false

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

  function createModelPlaceholder() {
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshStandardMaterial({
      color: '#66a3ff',
      roughness: 0.4,
      metalness: 0.6,
      wireframe: false,
    })
    const modelMesh = new THREE.Mesh(geometry, material)
    modelMesh.castShadow = true

    return modelMesh
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
    ambientLight = new THREE.AmbientLight('#ffffff', 0.5)
    scene.add(ambientLight)

    directionalLight = new THREE.DirectionalLight('#ffffff', 3)
    directionalLight.position.set(3, 4, 5)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.set(1024, 1024)
    scene.add(directionalLight)

    pointLight = new THREE.PointLight('#ffb86c', 6, 8)
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
    if (!canvas || !camera || !modelMesh)
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

    const hits = raycaster.intersectObject(modelMesh)

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
    modelMesh?.material.color.set(color)
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

    return renderer
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
      if (!renderer || !scene || !camera || !modelMesh || !timer)
        return

      timer.update(timestamp)
      const elapsedTime = timer.getElapsed()
      modelMesh.position.y = Math.sin(elapsedTime * 1.5) * 0.3
      modelMesh.rotation.x = elapsedTime * 0.45
      modelMesh.rotation.y = elapsedTime * 0.8

      controls?.update()
      renderer.render(scene, camera)
      animationId = window.requestAnimationFrame(animate)
    }

    animationId = window.requestAnimationFrame(animate)
  }

  function disposeSceneResources() {
    modelMesh?.geometry.dispose()
    modelMesh?.material.dispose()
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
    modelMesh = undefined
    ground = undefined
    ambientLight = undefined
    directionalLight = undefined
    pointLight = undefined
    pointLightHandle = undefined
    pointLightHelper = undefined
    controls = undefined
    camera = undefined
    scene = undefined
    timer = undefined
    renderer = undefined
    canvas = undefined
  }

  function init(canvasElement: HTMLCanvasElement) {
    canvas = canvasElement
    const sizes = getViewportSize()

    scene = new THREE.Scene()
    scene.background = new THREE.Color('#101820')

    camera = createCamera(sizes.width, sizes.height)
    scene.add(camera)

    modelMesh = createModelPlaceholder()
    scene.add(modelMesh)

    ground = createGround()
    scene.add(ground)

    const pointLight = addLights(scene)
    pointLightHandle = createPointLightHandle(pointLight)
    scene.add(pointLightHandle)

    addHelpers(scene, pointLight)

    renderer = createRenderer(canvasElement, sizes.width, sizes.height)
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

  return { init, dispose, setLightSettings, setModelColor }
}
