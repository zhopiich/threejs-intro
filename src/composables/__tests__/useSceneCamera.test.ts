import * as THREE from 'three'
import { describe, expect, it, vi } from 'vitest'

import { useSceneCamera } from '../three/useSceneCamera'

describe('useSceneCamera', () => {
  it('adds a perspective camera to the scene', () => {
    const scene = new THREE.Scene()
    const sceneCamera = useSceneCamera()

    sceneCamera.addToScene(scene, 800, 400)

    const camera = sceneCamera.getCamera()

    expect(camera).toBeInstanceOf(THREE.PerspectiveCamera)
    expect(camera?.aspect).toBe(2)
    expect(scene.children).toContain(camera)
  })

  it('updates the camera aspect when the viewport changes', () => {
    const scene = new THREE.Scene()
    const sceneCamera = useSceneCamera()

    sceneCamera.addToScene(scene, 800, 400)
    sceneCamera.updateViewport(300, 600)

    expect(sceneCamera.getCamera()?.aspect).toBe(0.5)
  })

  it('fits and resets camera view around an object', () => {
    const scene = new THREE.Scene()
    const sceneCamera = useSceneCamera()
    const object = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshStandardMaterial())
    const controls = {
      target: new THREE.Vector3(),
      update: vi.fn(),
    }

    sceneCamera.addToScene(scene, 800, 400)
    sceneCamera.fitCameraToObject(object, controls)

    const camera = sceneCamera.getCamera()

    expect(camera?.position.distanceTo(object.position)).toBeGreaterThan(1)
    expect(camera?.near).toBeGreaterThan(0)
    expect(camera?.far).toBeGreaterThan(camera?.near ?? 0)
    expect(controls.target.toArray()).toEqual([0, 0, 0])
    expect(controls.update).toHaveBeenCalled()
  })
})
