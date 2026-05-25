import type { PrimitiveModelType, ThreeSceneOptions } from './sceneTypes'

import * as THREE from 'three'

import { collectObject3DResourceStats, disposeObject3DResources } from './modelResources'

export function useSceneModels(options: ThreeSceneOptions = {}) {
  let primitiveMesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial> | undefined
  let primitiveType: PrimitiveModelType | undefined
  let loadedModel: THREE.Group | undefined
  let selectableObjects: THREE.Object3D[] = []

  function addPrimitiveToScene(scene: THREE.Scene, type: PrimitiveModelType) {
    primitiveMesh = createPrimitiveMesh(type)
    primitiveType = type
    scene.add(primitiveMesh)
    selectableObjects = [primitiveMesh]
    emitCurrentModelResourceStats()
    emitPrimitiveVisibleChanged(true)
  }

  function showPrimitiveModel(scene: THREE.Scene, type: PrimitiveModelType) {
    disposeLoadedModel(scene)

    if (primitiveMesh && primitiveType !== type)
      disposePrimitiveMesh(scene)

    if (!primitiveMesh) {
      primitiveMesh = createPrimitiveMesh(type)
      primitiveType = type
    }

    if (!primitiveMesh.parent)
      scene.add(primitiveMesh)

    selectableObjects = [primitiveMesh]
    emitCurrentModelResourceStats()
    emitPrimitiveVisibleChanged(true)
  }

  function createPrimitiveMesh(type: PrimitiveModelType) {
    const geometry = type === 'box'
      ? new THREE.BoxGeometry(1, 1, 1)
      : new THREE.TorusKnotGeometry(0.65, 0.22, 128, 18)
    const material = new THREE.MeshStandardMaterial({
      color: '#66a3ff',
      roughness: 0.4,
      metalness: 0.6,
      wireframe: false,
    })
    const primitiveMesh = new THREE.Mesh(geometry, material)
    primitiveMesh.castShadow = true

    return primitiveMesh
  }

  function setLoadedModel(scene: THREE.Scene, model: THREE.Group) {
    disposeLoadedModel(scene)
    disposePrimitiveMesh(scene)

    loadedModel = model
    normalizeLoadedModel(loadedModel)
    prepareLoadedModel(loadedModel)

    scene.add(loadedModel)
    emitCurrentModelResourceStats()
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

  function setModelColor(color: string) {
    primitiveMesh?.material.color.set(color)
  }

  function disposePrimitiveMesh(scene?: THREE.Scene) {
    if (!primitiveMesh)
      return

    scene?.remove(primitiveMesh)
    primitiveMesh.geometry.dispose()
    primitiveMesh.material.dispose()
    primitiveMesh = undefined
    primitiveType = undefined
    emitPrimitiveVisibleChanged(false)
  }

  function disposeLoadedModel(scene?: THREE.Scene) {
    if (!loadedModel)
      return

    scene?.remove(loadedModel)
    disposeObject3DResources(loadedModel)
    loadedModel = undefined
    selectableObjects = primitiveMesh ? [primitiveMesh] : []
    emitCurrentModelResourceStats()
  }

  function emitCurrentModelResourceStats() {
    options.onModelResourceStatsChanged?.(
      collectObject3DResourceStats(loadedModel ?? primitiveMesh),
    )
  }

  function emitPrimitiveVisibleChanged(visible: boolean) {
    options.onPrimitiveVisibleChanged?.(visible)
    options.onPlaceholderVisibleChanged?.(visible)
  }

  function resetReferences() {
    primitiveMesh = undefined
    primitiveType = undefined
    loadedModel = undefined
    selectableObjects = []
  }

  return {
    addPrimitiveToScene,
    addPlaceholderToScene: (scene: THREE.Scene) => addPrimitiveToScene(scene, 'box'),
    disposeLoadedModel,
    disposePrimitiveMesh,
    disposePlaceholderMesh: disposePrimitiveMesh,
    emitCurrentModelResourceStats,
    getLoadedModel: () => loadedModel,
    getPrimitiveMesh: () => primitiveMesh,
    getPlaceholderMesh: () => primitiveMesh,
    getSelectableObjects: () => selectableObjects,
    resetReferences,
    setLoadedModel,
    setModelColor,
    showPrimitiveModel,
    showPlaceholderModel: (scene: THREE.Scene) => showPrimitiveModel(scene, 'box'),
  }
}
