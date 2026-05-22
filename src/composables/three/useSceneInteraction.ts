import type { LightSettings } from './sceneTypes'

import * as THREE from 'three'

import {
  getHorizontalDragPosition,
  getNormalizedPointerPosition,
  getSelectedObjectInfo as getObjectInfo,
} from './interaction'

export function useSceneInteraction() {
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  const dragPlane = new THREE.Plane()
  const dragHitPoint = new THREE.Vector3()

  function updatePointer(clientX: number, clientY: number, rect: DOMRect) {
    const normalizedPointer = getNormalizedPointerPosition(clientX, clientY, rect)

    pointer.set(normalizedPointer.x, normalizedPointer.y)
  }

  function setRayFromCamera(camera: THREE.Camera) {
    raycaster.setFromCamera(pointer, camera)
  }

  function isObjectHit(object: THREE.Object3D) {
    return raycaster.intersectObject(object).length > 0
  }

  function getSelectedObjectInfo(selectableObjects: THREE.Object3D[]) {
    const hits = raycaster.intersectObjects(selectableObjects, true)

    return getObjectInfo(hits[0]?.object)
  }

  function setHorizontalDragPlane(y: number) {
    dragPlane.set(new THREE.Vector3(0, 1, 0), -y)
  }

  function getPointLightDragPosition(currentPosition: LightSettings['pointPosition']) {
    if (!raycaster.ray.intersectPlane(dragPlane, dragHitPoint))
      return undefined

    return getHorizontalDragPosition(currentPosition, dragHitPoint)
  }

  return {
    getPointLightDragPosition,
    getSelectedObjectInfo,
    isObjectHit,
    setHorizontalDragPlane,
    setRayFromCamera,
    updatePointer,
  }
}
