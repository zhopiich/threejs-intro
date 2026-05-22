import { describe, expect, it } from 'vitest'

import { getModelLoadErrorMessage, getModelLoadProgress } from '../three/modelLoading'

describe('modelLoading', () => {
  it('calculates model loading progress when total bytes are known', () => {
    const progressEvent = {
      loaded: 25,
      total: 100,
    } as ProgressEvent

    expect(getModelLoadProgress(progressEvent)).toBe(0.25)
  })

  it('returns zero progress when total bytes are unknown', () => {
    const progressEvent = {
      loaded: 25,
      total: 0,
    } as ProgressEvent

    expect(getModelLoadProgress(progressEvent)).toBe(0)
  })

  it('normalizes model load error messages', () => {
    expect(getModelLoadErrorMessage(new Error('Network failed'))).toBe('Network failed')
    expect(getModelLoadErrorMessage('unknown')).toBe('Failed to load model')
  })
})
