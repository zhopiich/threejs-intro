import * as THREE from 'three'
import { describe, expect, it } from 'vitest'

import { getHorizontalDragPosition } from '../useThreeScene'

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
})
