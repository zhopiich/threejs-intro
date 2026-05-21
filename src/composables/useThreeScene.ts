import * as THREE from 'three'

export function useThreeScene() {
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

  function init(canvasElement: HTMLCanvasElement) {
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

  function dispose() {
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

  return { init, dispose }
}
