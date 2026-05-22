import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import { useModelViewerState } from '../useModelViewerState'

const models = [
  {
    id: 'helmet',
    name: 'Damaged Helmet',
    url: '/models/DamagedHelmet.glb',
  },
  {
    id: 'avocado',
    name: 'Avocado',
    url: '/models/Avocado.glb',
  },
]

describe('useModelViewerState', () => {
  it('tracks the selected model without marking it as displayed before load success', () => {
    const state = useModelViewerState(models, models[0]!)

    state.selectedModelId.value = 'avocado'
    state.updateModelLoadingState({
      status: 'loading',
      progress: 0.25,
      url: '/models/Avocado.glb',
    })

    expect(state.selectedModel.value.name).toBe('Avocado')
    expect(state.loadingModel.value?.name).toBe('Avocado')
    expect(state.requestedModelName.value).toBe('Avocado')
    expect(state.displayedModel.value).toBeUndefined()
  })

  it('updates the displayed model only after a matching loaded state', () => {
    const state = useModelViewerState(models, models[0]!)

    state.updateModelLoadingState({
      status: 'loaded',
      progress: 1,
      url: '/models/DamagedHelmet.glb',
    })

    expect(state.displayedModel.value?.name).toBe('Damaged Helmet')

    state.updateModelLoadingState({
      status: 'error',
      progress: 0,
      url: '/models/Avocado.glb',
      errorMessage: 'Network error',
    })

    expect(state.loadingModel.value?.name).toBe('Avocado')
    expect(state.requestedModelName.value).toBe('Avocado')
    expect(state.displayedModel.value?.name).toBe('Damaged Helmet')
  })

  it('resets selection when the requested model changes', async () => {
    const state = useModelViewerState(models, models[0]!)

    state.updateSelectedObject({
      objectName: 'Helmet shell',
      materialName: 'Paint',
      geometryType: 'BufferGeometry',
    })
    state.selectedModelId.value = 'avocado'
    await nextTick()

    expect(state.isModelSelected.value).toBe(false)
    expect(state.selectedObjectInfo.value).toBeUndefined()
  })

  it('derives selection state from selected object info', () => {
    const state = useModelViewerState(models, models[0]!)

    state.updateSelectedObject({
      objectName: 'Helmet shell',
      materialName: 'Paint',
      geometryType: 'BufferGeometry',
    })

    expect(state.isModelSelected.value).toBe(true)
    expect(state.selectedObjectInfo.value?.objectName).toBe('Helmet shell')
  })
})
