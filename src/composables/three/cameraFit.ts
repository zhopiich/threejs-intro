import * as THREE from 'three'

export interface CameraFit {
  center: THREE.Vector3
  position: THREE.Vector3
  near: number
  far: number
}

export function calculateCameraFit(
  center: THREE.Vector3,
  radius: number,
  cameraFov: number,
  direction = new THREE.Vector3(1, 0.65, 1),
): CameraFit {
  const safeRadius = Math.max(radius, 0.1)
  const fov = THREE.MathUtils.degToRad(cameraFov)
  const distance = (safeRadius / Math.sin(fov / 2)) * 1.15
  const normalizedDirection = direction.clone().normalize()

  return {
    center: center.clone(),
    position: center.clone().add(normalizedDirection.multiplyScalar(distance)),
    near: Math.max(distance / 100, 0.01),
    far: distance * 100,
  }
}
