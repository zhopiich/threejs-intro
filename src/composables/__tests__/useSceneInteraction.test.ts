import * as THREE from 'three'
import { describe, expect, it } from 'vitest'

import { useSceneInteraction } from '../three/useSceneInteraction'

describe('useSceneInteraction', () => {
  it('detects a point light handle hit from the current pointer ray', () => {
    const interaction = useSceneInteraction()
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100)
    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial(),
    )

    camera.position.set(0, 0, 5)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
    camera.updateMatrixWorld()
    handle.updateMatrixWorld()

    interaction.updatePointer(100, 100, {
      left: 0,
      top: 0,
      width: 200,
      height: 200,
    } as DOMRect)
    interaction.setRayFromCamera(camera)

    expect(interaction.isObjectHit(handle)).toBe(true)
  })

  it('returns selected mesh info from selectable objects', () => {
    const interaction = useSceneInteraction()
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100)
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial())

    mesh.name = 'Selectable model'
    camera.position.set(0, 0, 5)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
    camera.updateMatrixWorld()
    mesh.updateMatrixWorld()

    interaction.updatePointer(100, 100, {
      left: 0,
      top: 0,
      width: 200,
      height: 200,
    } as DOMRect)
    interaction.setRayFromCamera(camera)

    expect(interaction.getSelectedObjectInfo([mesh])?.objectName).toBe('Selectable model')
  })
})
