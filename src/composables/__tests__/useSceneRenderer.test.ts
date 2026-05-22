import * as THREE from 'three'
import { describe, expect, it, vi } from 'vitest'

import { configureRenderer } from '../three/useSceneRenderer'

describe('useSceneRenderer', () => {
  it('applies viewer renderer defaults with a capped pixel ratio', () => {
    const renderer = {
      outputColorSpace: undefined,
      setPixelRatio: vi.fn(),
      setSize: vi.fn(),
      shadowMap: { enabled: false },
      toneMapping: undefined,
      toneMappingExposure: 0,
    }

    configureRenderer(renderer, 800, 600, 3)

    expect(renderer.setPixelRatio).toHaveBeenCalledWith(2)
    expect(renderer.setSize).toHaveBeenCalledWith(800, 600)
    expect(renderer.shadowMap.enabled).toBe(true)
    expect(renderer.outputColorSpace).toBe(THREE.SRGBColorSpace)
    expect(renderer.toneMapping).toBe(THREE.ACESFilmicToneMapping)
    expect(renderer.toneMappingExposure).toBe(1)
  })
})
