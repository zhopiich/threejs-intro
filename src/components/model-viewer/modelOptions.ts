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
    url: '/models/DamagedHelmet.glb',
  },
  {
    id: 'avocado',
    name: 'Avocado',
    kind: 'glb',
    fileName: 'Avocado.glb',
    url: '/models/Avocado.glb',
  },
]
