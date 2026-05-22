import * as THREE from 'three'
import { describe, expect, it, vi } from 'vitest'

import { useSceneLights } from '../three/useSceneLights'

describe('useSceneLights', () => {
  it('creates scene lights and keeps point light handle in sync with light settings', () => {
    const scene = new THREE.Scene()
    const sceneLights = useSceneLights()

    sceneLights.addToScene(scene)
    sceneLights.setLightSettings({
      ambientColor: '#111111',
      ambientIntensity: 0.3,
      directionalColor: '#222222',
      directionalIntensity: 0.7,
      pointColor: '#ff0000',
      pointIntensity: 1.5,
      pointPosition: { x: 1, y: 2, z: 3 },
    })

    expect(sceneLights.getAmbientLight()?.intensity).toBe(0.3)
    expect(sceneLights.getDirectionalLight()?.intensity).toBe(0.7)
    expect(sceneLights.getPointLight()?.intensity).toBe(1.5)
    expect(sceneLights.getPointLight()?.position.toArray()).toEqual([1, 2, 3])
    expect(sceneLights.getPointLightHandle()?.position.toArray()).toEqual([1, 2, 3])
  })

  it('disposes point light handle and helper resources', () => {
    const scene = new THREE.Scene()
    const sceneLights = useSceneLights()

    sceneLights.addToScene(scene)

    const handle = sceneLights.getPointLightHandle()
    const helper = sceneLights.getPointLightHelper()
    const disposeGeometry = vi.spyOn(handle!.geometry, 'dispose')
    const disposeMaterial = vi.spyOn(handle!.material, 'dispose')
    const disposeHelper = vi.spyOn(helper!, 'dispose')

    sceneLights.dispose()

    expect(disposeGeometry).toHaveBeenCalledOnce()
    expect(disposeMaterial).toHaveBeenCalledOnce()
    expect(disposeHelper).toHaveBeenCalledOnce()
    expect(sceneLights.getPointLight()).toBeUndefined()
    expect(sceneLights.getPointLightHandle()).toBeUndefined()
  })
})
