import * as THREE from 'three'
import { describe, expect, it, vi } from 'vitest'

import { useSceneHelpers } from '../three/useSceneHelpers'

describe('useSceneHelpers', () => {
  it('adds ground, axes, and grid helpers to the scene', () => {
    const scene = new THREE.Scene()
    const sceneHelpers = useSceneHelpers()

    sceneHelpers.addToScene(scene)

    expect(sceneHelpers.getGround()).toBeInstanceOf(THREE.Mesh)
    expect(sceneHelpers.getAxesHelper()).toBeInstanceOf(THREE.AxesHelper)
    expect(sceneHelpers.getGridHelper()).toBeInstanceOf(THREE.GridHelper)
    expect(scene.children).toContain(sceneHelpers.getGround())
    expect(scene.children).toContain(sceneHelpers.getAxesHelper())
    expect(scene.children).toContain(sceneHelpers.getGridHelper())
  })

  it('updates helper visibility from viewer display settings', () => {
    const scene = new THREE.Scene()
    const sceneHelpers = useSceneHelpers()

    sceneHelpers.addToScene(scene)
    sceneHelpers.setVisibility({
      showAxesHelper: false,
      showGridHelper: false,
      showGround: false,
    })

    expect(sceneHelpers.getGround()?.visible).toBe(false)
    expect(sceneHelpers.getAxesHelper()?.visible).toBe(false)
    expect(sceneHelpers.getGridHelper()?.visible).toBe(false)
  })

  it('disposes helper geometry and material resources', () => {
    const scene = new THREE.Scene()
    const sceneHelpers = useSceneHelpers()

    sceneHelpers.addToScene(scene)

    const ground = sceneHelpers.getGround()
    const axesHelper = sceneHelpers.getAxesHelper()
    const gridHelper = sceneHelpers.getGridHelper()
    const disposeGroundGeometry = vi.spyOn(ground!.geometry, 'dispose')
    const disposeGroundMaterial = vi.spyOn(ground!.material, 'dispose')
    const disposeAxesGeometry = vi.spyOn(axesHelper!.geometry, 'dispose')
    const disposeGridGeometry = vi.spyOn(gridHelper!.geometry, 'dispose')

    sceneHelpers.dispose()

    expect(disposeGroundGeometry).toHaveBeenCalledOnce()
    expect(disposeGroundMaterial).toHaveBeenCalledOnce()
    expect(disposeAxesGeometry).toHaveBeenCalledOnce()
    expect(disposeGridGeometry).toHaveBeenCalledOnce()
    expect(sceneHelpers.getGround()).toBeUndefined()
    expect(sceneHelpers.getAxesHelper()).toBeUndefined()
    expect(sceneHelpers.getGridHelper()).toBeUndefined()
  })
})
