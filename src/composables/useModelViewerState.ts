import type { ModelLoadingState } from './useThreeScene'

import { computed, ref, watch } from 'vue'

export interface ViewerModelOption {
  id: string
  name: string
  url: string
}

export function useModelViewerState<TModel extends ViewerModelOption>(
  models: readonly TModel[],
  defaultModel: TModel,
) {
  const isModelSelected = ref(false)
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
  }

  function updateModelSelected(selected: boolean) {
    isModelSelected.value = selected
  }

  watch(selectedModelId, () => {
    updateModelSelected(false)
  })

  return {
    displayedModel,
    isModelSelected,
    loadingModel,
    modelLoadingState,
    requestedModelName,
    selectedModel,
    selectedModelId,
    updateModelLoadingState,
    updateModelSelected,
  }
}
