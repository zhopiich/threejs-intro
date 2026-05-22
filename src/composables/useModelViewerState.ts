import type { ModelLoadingState, SelectedObjectInfo } from './useThreeScene'

import { computed, ref, watch } from 'vue'

export interface ViewerModelOption {
  id: string
  name: string
  url?: string
}

export function useModelViewerState<TModel extends ViewerModelOption>(
  models: readonly TModel[],
  defaultModel: TModel,
) {
  const selectedObjectInfo = ref<SelectedObjectInfo>()
  const isModelSelected = computed(() => selectedObjectInfo.value !== undefined)
  const selectedModelId = ref(defaultModel.id)
  const selectedModel = computed(() => {
    return models.find(option => option.id === selectedModelId.value) ?? defaultModel
  })
  const displayedModelUrl = ref<string>()
  const displayedModel = computed(() => {
    return models.find(option => option.url === displayedModelUrl.value)
  })
  const modelLoadingState = ref<ModelLoadingState>({
    status: 'idle',
    progress: 0,
  })
  const loadingModel = computed(() => {
    return models.find(option => option.url === modelLoadingState.value.url)
  })
  const requestedModelName = computed(() => {
    return loadingModel.value?.name ?? selectedModel.value.name
  })

  function updateModelLoadingState(state: ModelLoadingState) {
    modelLoadingState.value = state

    if (state.status === 'loaded' && state.url)
      displayedModelUrl.value = state.url
    else if (state.status === 'idle')
      displayedModelUrl.value = undefined
  }

  function updateSelectedObject(info: SelectedObjectInfo | undefined) {
    selectedObjectInfo.value = info
  }

  watch(selectedModelId, () => {
    updateSelectedObject(undefined)
  })

  return {
    displayedModel,
    isModelSelected,
    loadingModel,
    modelLoadingState,
    requestedModelName,
    selectedObjectInfo,
    selectedModel,
    selectedModelId,
    updateModelLoadingState,
    updateSelectedObject,
  }
}
