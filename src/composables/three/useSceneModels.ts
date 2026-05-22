import type { ThreeSceneOptions } from './sceneTypes'

import * as THREE from 'three'

import { collectObject3DResourceStats, disposeObject3DResources } from './modelResources'

export function useSceneModels(options: ThreeSceneOptions = {}) {
  let placeholderMesh: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial> | undefined
  let loadedModel: THREE.Group | undefined
  let selectableObjects: THREE.Object3D[] = []

  function addPlaceholderToScene(scene: THREE.Scene) {
    placeholderMesh = createPlaceholderMesh()
    scene.add(placeholderMesh)
    selectableObjects = [placeholderMesh]
    emitCurrentModelResourceStats()
    options.onPlaceholderVisibleChanged?.(true)
  }

  function showPlaceholderModel(scene: THREE.Scene) {
    disposeLoadedModel(scene)

    if (!placeholderMesh)
      placeholderMesh = createPlaceholderMesh()

    if (!placeholderMesh.parent)
      scene.add(placeholderMesh)

    selectableObjects = [placeholderMesh]
    emitCurrentModelResourceStats()
    options.onPlaceholderVisibleChanged?.(true)
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

  function setLoadedModel(scene: THREE.Scene, model: THREE.Group) {
    disposeLoadedModel(scene)
    disposePlaceholderMesh(scene)

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
    placeholderMesh?.material.color.set(color)
  }

  function disposePlaceholderMesh(scene?: THREE.Scene) {
    if (!placeholderMesh)
      return

    scene?.remove(placeholderMesh)
    placeholderMesh.geometry.dispose()
    placeholderMesh.material.dispose()
    placeholderMesh = undefined
    options.onPlaceholderVisibleChanged?.(false)
  }

  function disposeLoadedModel(scene?: THREE.Scene) {
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

  function resetReferences() {
    placeholderMesh = undefined
    loadedModel = undefined
    selectableObjects = []
  }

  return {
    addPlaceholderToScene,
    disposeLoadedModel,
    disposePlaceholderMesh,
    emitCurrentModelResourceStats,
    getLoadedModel: () => loadedModel,
    getPlaceholderMesh: () => placeholderMesh,
    getSelectableObjects: () => selectableObjects,
    resetReferences,
    setLoadedModel,
    setModelColor,
    showPlaceholderModel,
  }
}
