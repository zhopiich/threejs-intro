import * as THREE from 'three'
import { describe, expect, it, vi } from 'vitest'

import { calculateCameraFit } from '../three/cameraFit'
import { normalizeToneMappingExposure } from '../three/displaySettings'
import { getHorizontalDragPosition, getSelectedObjectInfo } from '../three/interaction'
import { collectObject3DResourceStats, disposeObject3DResources } from '../three/modelResources'

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

  it('calculates a camera fit that looks at the object center from outside its radius', () => {
    const center = new THREE.Vector3(0, 1, 0)
    const fit = calculateCameraFit(center, 2, 60)

    expect(fit.center).toEqual(center)
    expect(fit.position.distanceTo(center)).toBeGreaterThan(2)
    expect(fit.near).toBeGreaterThan(0)
    expect(fit.far).toBeGreaterThan(fit.position.distanceTo(center))
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

  it('collects unique mesh, material, and texture counts for lifecycle debugging', () => {
    const sharedTexture = new THREE.Texture()
    const sharedMaterial = new THREE.MeshStandardMaterial({ map: sharedTexture })
    const firstMesh = new THREE.Mesh(new THREE.BoxGeometry(), sharedMaterial)
    const secondMesh = new THREE.Mesh(new THREE.SphereGeometry(), sharedMaterial)
    const group = new THREE.Group()

    group.add(firstMesh, secondMesh)

    expect(collectObject3DResourceStats(group)).toEqual({
      meshCount: 2,
      materialCount: 1,
      textureCount: 1,
    })
  })

  it('extracts readable mesh info for the selected object inspector', () => {
    const material = new THREE.MeshStandardMaterial()
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(), material)

    mesh.name = 'Helmet shell'
    material.name = 'Paint'

    expect(getSelectedObjectInfo(mesh)).toEqual({
      objectName: 'Helmet shell',
      materialName: 'Paint',
      geometryType: 'BoxGeometry',
    })
  })

  it('clamps tone mapping exposure to the viewer supported range', () => {
    expect(normalizeToneMappingExposure(-1)).toBe(0)
    expect(normalizeToneMappingExposure(1.25)).toBe(1.25)
    expect(normalizeToneMappingExposure(8)).toBe(3)
  })
})
