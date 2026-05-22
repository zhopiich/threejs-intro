import { describe, expect, it, vi } from 'vitest'

import { useSceneAnimationLoop } from '../three/useSceneAnimationLoop'

describe('useSceneAnimationLoop', () => {
  it('connects the timer, runs frame work, and schedules the next frame', () => {
    const frameCallback = vi.fn()
    const requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
      void callback
      return 7
    })
    const timer = {
      connect: vi.fn(),
      dispose: vi.fn(),
      getElapsed: vi.fn(() => 1.25),
      update: vi.fn(),
    }
    const animationLoop = useSceneAnimationLoop({
      cancelAnimationFrame: vi.fn(),
      createTimer: () => timer,
      document,
      requestAnimationFrame,
    })

    animationLoop.start(frameCallback)
    const animate = requestAnimationFrame.mock.calls[0]?.[0] as FrameRequestCallback
    animate(1000)

    expect(timer.connect).toHaveBeenCalledWith(document)
    expect(timer.update).toHaveBeenCalledWith(1000)
    expect(frameCallback).toHaveBeenCalledWith(1.25)
    expect(requestAnimationFrame).toHaveBeenCalledTimes(2)
  })

  it('cancels the active frame and disposes the timer on stop', () => {
    const cancelAnimationFrame = vi.fn()
    const timer = {
      connect: vi.fn(),
      dispose: vi.fn(),
      getElapsed: vi.fn(),
      update: vi.fn(),
    }
    const animationLoop = useSceneAnimationLoop({
      cancelAnimationFrame,
      createTimer: () => timer,
      document,
      requestAnimationFrame: vi.fn(() => 12),
    })

    animationLoop.start(vi.fn())
    animationLoop.stop()

    expect(cancelAnimationFrame).toHaveBeenCalledWith(12)
    expect(timer.dispose).toHaveBeenCalledOnce()
  })
})
