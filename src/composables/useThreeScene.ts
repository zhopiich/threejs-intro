import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export interface ThreeSceneOptions {
  onCubeSelected?: (selected: boolean) => void
}

export function useThreeScene(options: ThreeSceneOptions = {}) {
  let renderer: THREE.WebGLRenderer | undefined
  let scene: THREE.Scene | undefined
  let camera: THREE.PerspectiveCamera | undefined
  let cube: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial> | undefined
  let ground: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial> | undefined
  let pointLightHelper: THREE.PointLightHelper | undefined
  let controls: OrbitControls | undefined
  let timer: THREE.Timer | undefined
  let animationId: number | undefined
  let canvas: HTMLCanvasElement | undefined

  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()

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

  function handleCanvasPointerDown(event: PointerEvent) {
    if (!canvas || !camera || !cube)
      return

    const rect = canvas.getBoundingClientRect()
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    raycaster.setFromCamera(pointer, camera)
    const hits = raycaster.intersectObject(cube)

    options.onCubeSelected?.(hits.length > 0)
  }

  function setCubeColor(color: string) {
    cube?.material.color.set(color)
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
  }

  function removeEventListeners() {
    window.removeEventListener('resize', updateRendererSize)
    canvas?.removeEventListener('pointerdown', handleCanvasPointerDown)
  }

  function startAnimationLoop() {
    function animate(timestamp: number) {
      if (!renderer || !scene || !camera || !cube || !timer)
        return

      timer.update(timestamp)
      const elapsedTime = timer.getElapsed()
      cube.position.y = Math.sin(elapsedTime * 1.5) * 0.3
      cube.rotation.x = elapsedTime * 0.45
      cube.rotation.y = elapsedTime * 0.8

      controls?.update()
      renderer.render(scene, camera)
      animationId = window.requestAnimationFrame(animate)
    }

    animationId = window.requestAnimationFrame(animate)
  }

  function disposeSceneResources() {
    cube?.geometry.dispose()
    cube?.material.dispose()
    ground?.geometry.dispose()
    ground?.material.dispose()
    pointLightHelper?.dispose()
    controls?.dispose()
    timer?.dispose()
    renderer?.dispose()
  }

  function resetSceneReferences() {
    animationId = undefined
    cube = undefined
    ground = undefined
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

    cube = createCube()
    scene.add(cube)

    ground = createGround()
    scene.add(ground)

    const pointLight = addLights(scene)
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

  return { init, dispose, setCubeColor }
}
