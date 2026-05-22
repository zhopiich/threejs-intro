import type { ModelResourceStats } from './sceneTypes'

import * as THREE from 'three'

export function disposeMaterialResources(material: THREE.Material) {
  Object.values(material).forEach((value) => {
    if (value instanceof THREE.Texture)
      value.dispose()
  })

  material.dispose()
}

export function disposeObject3DResources(object: THREE.Object3D) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh))
      return

    child.geometry?.dispose()

    if (Array.isArray(child.material))
      child.material.forEach(disposeMaterialResources)
    else if (child.material)
      disposeMaterialResources(child.material)
  })
}

export function collectObject3DResourceStats(object?: THREE.Object3D): ModelResourceStats {
  const stats: ModelResourceStats = {
    meshCount: 0,
    materialCount: 0,
    textureCount: 0,
  }
  const materials = new Set<THREE.Material>()
  const textures = new Set<THREE.Texture>()

  object?.traverse((child) => {
    if (!(child instanceof THREE.Mesh))
      return

    stats.meshCount += 1

    const childMaterials = Array.isArray(child.material)
      ? child.material
      : [child.material]

    childMaterials.forEach((material) => {
      if (!material || materials.has(material))
        return

      materials.add(material)
      Object.values(material).forEach((value) => {
        if (value instanceof THREE.Texture)
          textures.add(value)
      })
    })
  })

  stats.materialCount = materials.size
  stats.textureCount = textures.size

  return stats
}
