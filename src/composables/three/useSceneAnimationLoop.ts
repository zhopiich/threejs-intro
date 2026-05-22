import * as THREE from 'three'

interface AnimationTimer {
  connect: (document: Document) => void
  dispose: () => void
  getElapsed: () => number
  update: (timestamp: number) => void
}

interface SceneAnimationLoopOptions {
  cancelAnimationFrame?: (handle: number) => void
  createTimer?: () => AnimationTimer
  document?: Document
  requestAnimationFrame?: (callback: FrameRequestCallback) => number
}

type FrameCallback = (elapsedTime: number) => void | false

export function useSceneAnimationLoop(options: SceneAnimationLoopOptions = {}) {
  let animationId: number | undefined
  let timer: AnimationTimer | undefined

  const requestFrame = options.requestAnimationFrame ?? window.requestAnimationFrame.bind(window)
  const cancelFrame = options.cancelAnimationFrame ?? window.cancelAnimationFrame.bind(window)
  const createTimer = options.createTimer ?? (() => new THREE.Timer())
  const timerDocument = options.document ?? document

  function start(onFrame: FrameCallback) {
    stop()

    timer = createTimer()
    timer.connect(timerDocument)

    function animate(timestamp: number) {
      if (!timer)
        return

      timer.update(timestamp)

      if (onFrame(timer.getElapsed()) === false)
        return

      animationId = requestFrame(animate)
    }

    animationId = requestFrame(animate)
  }

  function stop() {
    if (animationId !== undefined)
      cancelFrame(animationId)

    animationId = undefined
    timer?.dispose()
    timer = undefined
  }

  return {
    start,
    stop,
  }
}
