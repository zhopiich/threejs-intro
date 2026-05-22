import * as THREE from 'three'

export function normalizeToneMappingExposure(exposure: number) {
  return THREE.MathUtils.clamp(exposure, 0, 3)
}
