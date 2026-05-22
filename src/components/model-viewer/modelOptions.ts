interface PlaceholderModelOption {
  id: string
  name: string
  kind: 'placeholder'
}

interface GlbModelOption {
  id: string
  name: string
  kind: 'glb'
  fileName: string
  url: string
}

export type ModelOption = PlaceholderModelOption | GlbModelOption

const modelAssetBaseUrl = `${import.meta.env.BASE_URL}models`

export const modelOptions: ModelOption[] = [
  {
    id: 'placeholder-cube',
    name: 'Placeholder Cube',
    kind: 'placeholder',
  },
  {
    id: 'damaged-helmet',
    name: 'Damaged Helmet',
    kind: 'glb',
    fileName: 'DamagedHelmet.glb',
    url: `${modelAssetBaseUrl}/DamagedHelmet.glb`,
  },
  {
    id: 'avocado',
    name: 'Avocado',
    kind: 'glb',
    fileName: 'Avocado.glb',
    url: `${modelAssetBaseUrl}/Avocado.glb`,
  },
]
