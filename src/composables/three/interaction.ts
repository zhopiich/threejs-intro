import type { LightSettings, SelectedObjectInfo } from './sceneTypes'

import * as THREE from 'three'

export function getHorizontalDragPosition(
  currentPosition: LightSettings['pointPosition'],
  hitPoint: THREE.Vector3,
): LightSettings['pointPosition'] {
  return {
    x: hitPoint.x,
    y: currentPosition.y,
    z: hitPoint.z,
  }
}

export function getSelectedObjectInfo(object: THREE.Object3D | undefined): SelectedObjectInfo | undefined {
  if (!(object instanceof THREE.Mesh))
    return undefined

  const material = Array.isArray(object.material) ? object.material[0] : object.material

  return {
    objectName: object.name || object.parent?.name || 'Unnamed mesh',
    materialName: material?.name || material?.type || 'Unknown material',
    geometryType: object.geometry?.type || 'Unknown geometry',
  }
}
