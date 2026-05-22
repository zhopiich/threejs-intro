type GLTFLoaderModule = typeof import('three/examples/jsm/loaders/GLTFLoader.js')

let gltfLoaderModulePromise: Promise<GLTFLoaderModule> | undefined

export function importGLTFLoader() {
  gltfLoaderModulePromise ??= import('three/examples/jsm/loaders/GLTFLoader.js')

  return gltfLoaderModulePromise
}

export function getModelLoadProgress(progressEvent: ProgressEvent) {
  return progressEvent.total > 0
    ? progressEvent.loaded / progressEvent.total
    : 0
}

export function getModelLoadErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Failed to load model'
}
