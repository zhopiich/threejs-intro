import type { LightSettings } from './sceneTypes'

import * as THREE from 'three'

export function useSceneLights() {
  let ambientLight: THREE.AmbientLight | undefined
  let directionalLight: THREE.DirectionalLight | undefined
  let pointLight: THREE.PointLight | undefined
  let pointLightHandle: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial> | undefined
  let pointLightHelper: THREE.PointLightHelper | undefined

  function addToScene(scene: THREE.Scene) {
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

    pointLightHandle = createPointLightHandle(pointLight)
    scene.add(pointLightHandle)

    pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2)
    scene.add(pointLightHelper)
  }

  function createPointLightHandle(pointLight: THREE.PointLight) {
    const geometry = new THREE.SphereGeometry(0.12, 24, 16)
    const material = new THREE.MeshBasicMaterial({ color: pointLight.color })
    const handle = new THREE.Mesh(geometry, material)
    handle.position.copy(pointLight.position)

    return handle
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

    setPointLightPosition(settings.pointPosition)

    if (pointLight) {
      pointLight.color.set(settings.pointColor)
      pointLight.intensity = settings.pointIntensity
    }

    if (pointLightHandle)
      pointLightHandle.material.color.set(settings.pointColor)
  }

  function setPointLightPosition(position: LightSettings['pointPosition']) {
    pointLight?.position.set(position.x, position.y, position.z)

    if (pointLight && pointLightHandle)
      pointLightHandle.position.copy(pointLight.position)

    pointLightHelper?.update()
  }

  function setPointLightHelperVisible(visible: boolean) {
    if (pointLightHelper)
      pointLightHelper.visible = visible
  }

  function dispose() {
    pointLightHandle?.geometry.dispose()
    pointLightHandle?.material.dispose()
    pointLightHelper?.dispose()
    resetReferences()
  }

  function resetReferences() {
    ambientLight = undefined
    directionalLight = undefined
    pointLight = undefined
    pointLightHandle = undefined
    pointLightHelper = undefined
  }

  return {
    addToScene,
    dispose,
    getAmbientLight: () => ambientLight,
    getDirectionalLight: () => directionalLight,
    getPointLight: () => pointLight,
    getPointLightHandle: () => pointLightHandle,
    getPointLightHelper: () => pointLightHelper,
    resetReferences,
    setLightSettings,
    setPointLightHelperVisible,
    setPointLightPosition,
  }
}
