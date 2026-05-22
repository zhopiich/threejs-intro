export interface ModelOption {
  id: string
  name: string
  fileName: string
  url: string
}

export const modelOptions: ModelOption[] = [
  {
    id: 'damaged-helmet',
    name: 'Damaged Helmet',
    fileName: 'DamagedHelmet.glb',
    url: '/models/DamagedHelmet.glb',
  },
  {
    id: 'avocado',
    name: 'Avocado',
    fileName: 'Avocado.glb',
    url: '/models/Avocado.glb',
  },
]
