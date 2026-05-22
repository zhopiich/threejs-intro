import * as THREE from 'three'
import { describe, expect, it, vi } from 'vitest'

import {
  disposeObject3DResources,
  getHorizontalDragPosition,
} from '../useThreeScene'

describe('useThreeScene drag logic', () => {
  it('updates point light x/z from the drag hit point while preserving y', () => {
    const currentPosition = { x: -2, y: 1.6, z: 1.5 }
    const hitPoint = new THREE.Vector3(1.25, 0, -2.75)

    expect(getHorizontalDragPosition(currentPosition, hitPoint)).toEqual({
      x: 1.25,
      y: 1.6,
      z: -2.75,
    })
  })

  it('disposes loaded model geometry, material, and textures', () => {
    const geometry = new THREE.BoxGeometry()
    const texture = new THREE.Texture()
    const material = new THREE.MeshStandardMaterial({ map: texture })
    const mesh = new THREE.Mesh(geometry, material)
    const group = new THREE.Group()
    const disposeGeometry = vi.spyOn(geometry, 'dispose')
    const disposeMaterial = vi.spyOn(material, 'dispose')
    const disposeTexture = vi.spyOn(texture, 'dispose')

    group.add(mesh)

    disposeObject3DResources(group)

    expect(disposeGeometry).toHaveBeenCalledOnce()
    expect(disposeMaterial).toHaveBeenCalledOnce()
    expect(disposeTexture).toHaveBeenCalledOnce()
  })
})
