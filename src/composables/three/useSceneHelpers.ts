import * as THREE from 'three'

export interface SceneHelpersVisibility {
  showAxesHelper: boolean
  showGridHelper: boolean
  showGround: boolean
}

export function useSceneHelpers() {
  let ground: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial> | undefined
  let axesHelper: THREE.AxesHelper | undefined
  let gridHelper: THREE.GridHelper | undefined

  function addToScene(scene: THREE.Scene) {
    ground = createGround()
    scene.add(ground)

    axesHelper = new THREE.AxesHelper(2)
    scene.add(axesHelper)

    gridHelper = new THREE.GridHelper(7, 7, '#6b7280', '#2f3a46')
    scene.add(gridHelper)
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

  function setVisibility(settings: SceneHelpersVisibility) {
    if (axesHelper)
      axesHelper.visible = settings.showAxesHelper

    if (gridHelper)
      gridHelper.visible = settings.showGridHelper

    if (ground)
      ground.visible = settings.showGround
  }

  function dispose() {
    ground?.geometry.dispose()
    ground?.material.dispose()

    axesHelper?.geometry.dispose()
    if (Array.isArray(axesHelper?.material))
      axesHelper.material.forEach(material => material.dispose())
    else
      axesHelper?.material.dispose()

    gridHelper?.geometry.dispose()
    if (Array.isArray(gridHelper?.material))
      gridHelper.material.forEach(material => material.dispose())
    else
      gridHelper?.material.dispose()

    resetReferences()
  }

  function resetReferences() {
    ground = undefined
    axesHelper = undefined
    gridHelper = undefined
  }

  return {
    addToScene,
    dispose,
    getAxesHelper: () => axesHelper,
    getGridHelper: () => gridHelper,
    getGround: () => ground,
    resetReferences,
    setVisibility,
  }
}
