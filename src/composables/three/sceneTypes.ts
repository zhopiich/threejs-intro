export interface LightSettings {
  ambientColor: string
  ambientIntensity: number
  directionalColor: string
  directionalIntensity: number
  pointColor: string
  pointIntensity: number
  pointPosition: {
    x: number
    y: number
    z: number
  }
}

export interface ViewerDisplaySettings {
  autoRotate: boolean
  showAxesHelper: boolean
  showGridHelper: boolean
  showGround: boolean
  showPointLightHelper: boolean
  toneMappingExposure: number
}

export type PrimitiveModelType = 'box' | 'torus-knot'

export interface ThreeSceneOptions {
  onModelResourceStatsChanged?: (stats: ModelResourceStats) => void
  onModelSelected?: (info: SelectedObjectInfo | undefined) => void
  onModelLoadingStateChanged?: (state: ModelLoadingState) => void
  onPrimitiveVisibleChanged?: (visible: boolean) => void
  onPlaceholderVisibleChanged?: (visible: boolean) => void
  onPointLightPositionChanged?: (position: LightSettings['pointPosition']) => void
}

export interface ModelLoadingState {
  status: 'idle' | 'loading' | 'loaded' | 'error'
  progress: number
  url?: string
  errorMessage?: string
}

export interface ModelResourceStats {
  meshCount: number
  materialCount: number
  textureCount: number
}

export interface SelectedObjectInfo {
  objectName: string
  materialName: string
  geometryType: string
}
