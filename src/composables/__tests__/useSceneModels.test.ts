import * as THREE from 'three'
import { describe, expect, it, vi } from 'vitest'

import { useSceneModels } from '../three/useSceneModels'

describe('useSceneModels', () => {
  it('adds a placeholder model and exposes it as the selectable object', () => {
    const scene = new THREE.Scene()
    const onPlaceholderVisibleChanged = vi.fn()
    const onModelResourceStatsChanged = vi.fn()
    const sceneModels = useSceneModels({
      onModelResourceStatsChanged,
      onPlaceholderVisibleChanged,
    })

    sceneModels.addPlaceholderToScene(scene)

    expect(sceneModels.getPlaceholderMesh()).toBeInstanceOf(THREE.Mesh)
    expect(sceneModels.getSelectableObjects()).toEqual([sceneModels.getPlaceholderMesh()])
    expect(onPlaceholderVisibleChanged).toHaveBeenCalledWith(true)
    expect(onModelResourceStatsChanged).toHaveBeenLastCalledWith({
      meshCount: 1,
      materialCount: 1,
      textureCount: 0,
    })
  })

  it('replaces the placeholder with a normalized loaded model and selectable meshes', () => {
    const scene = new THREE.Scene()
    const sceneModels = useSceneModels()
    const model = new THREE.Group()
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 1), new THREE.MeshStandardMaterial())

    model.add(mesh)
    sceneModels.addPlaceholderToScene(scene)
    sceneModels.setLoadedModel(scene, model)

    expect(sceneModels.getPlaceholderMesh()).toBeUndefined()
    expect(sceneModels.getLoadedModel()).toBe(model)
    expect(sceneModels.getSelectableObjects()).toEqual([mesh])
    expect(scene.children).toContain(model)
    expect(model.scale.x).toBeCloseTo(0.45)
    expect(mesh.castShadow).toBe(true)
    expect(mesh.receiveShadow).toBe(true)
  })

  it('disposes loaded model resources and clears selectable objects', () => {
    const scene = new THREE.Scene()
    const sceneModels = useSceneModels()
    const geometry = new THREE.BoxGeometry()
    const material = new THREE.MeshStandardMaterial()
    const model = new THREE.Group()
    const mesh = new THREE.Mesh(geometry, material)
    const disposeGeometry = vi.spyOn(geometry, 'dispose')
    const disposeMaterial = vi.spyOn(material, 'dispose')

    model.add(mesh)
    sceneModels.setLoadedModel(scene, model)
    sceneModels.disposeLoadedModel(scene)

    expect(disposeGeometry).toHaveBeenCalledOnce()
    expect(disposeMaterial).toHaveBeenCalledOnce()
    expect(sceneModels.getLoadedModel()).toBeUndefined()
    expect(sceneModels.getSelectableObjects()).toEqual([])
    expect(scene.children).not.toContain(model)
  })
})
