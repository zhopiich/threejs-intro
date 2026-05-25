import type { CameraFit } from './cameraFit'

import * as THREE from 'three'

import { calculateCameraFit } from './cameraFit'

export interface CameraControlsLike {
  target: THREE.Vector3
  update: () => void
}

export function useSceneCamera() {
  let camera: THREE.PerspectiveCamera | undefined
  let lastCameraFit: CameraFit | undefined

  function addToScene(scene: THREE.Scene, width: number, height: number) {
    camera = createCamera(width, height)
    scene.add(camera)
  }

  function createCamera(width: number, height: number) {
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100)
    camera.position.set(3, 2.4, 4.5)
    camera.lookAt(0, 0.25, 0)

    return camera
  }

  function updateViewport(width: number, height: number) {
    if (!camera)
      return

    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }

  function fitCameraToObject(object: THREE.Object3D, controls: CameraControlsLike) {
    updateCameraFitForObject(object)
    resetCameraView(controls)
  }

  function updateCameraFitForObject(object: THREE.Object3D) {
    if (!camera)
      return

    const box = new THREE.Box3().setFromObject(object)
    const sphere = new THREE.Sphere()

    box.getBoundingSphere(sphere)
    lastCameraFit = calculateCameraFit(sphere.center, sphere.radius, camera.fov)
  }

  function resetCameraView(controls: CameraControlsLike) {
    if (!camera || !lastCameraFit)
      return

    camera.position.copy(lastCameraFit.position)
    camera.near = lastCameraFit.near
    camera.far = lastCameraFit.far
    camera.updateProjectionMatrix()

    controls.target.copy(lastCameraFit.center)
    controls.update()
  }

  function resetReferences() {
    camera = undefined
    lastCameraFit = undefined
  }

  return {
    addToScene,
    fitCameraToObject,
    getCamera: () => camera,
    resetCameraView,
    resetReferences,
    updateCameraFitForObject,
    updateViewport,
  }
}
