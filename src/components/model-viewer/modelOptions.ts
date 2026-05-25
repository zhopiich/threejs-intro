import type { PrimitiveModelType } from '@/composables/useThreeScene'

interface PrimitiveModelOption {
  id: string
  name: string
  kind: 'primitive'
  primitive: PrimitiveModelType
}

interface GlbModelOption {
  id: string
  name: string
  kind: 'glb'
  fileName: string
  url: string
}

export type ModelOption = PrimitiveModelOption | GlbModelOption

const modelAssetBaseUrl = `${import.meta.env.BASE_URL}models`

export const modelOptions: ModelOption[] = [
  {
    id: 'placeholder-cube',
    name: 'Placeholder Cube',
    kind: 'primitive',
    primitive: 'box',
  },
  {
    id: 'torus-knot',
    name: 'Torus Knot',
    kind: 'primitive',
    primitive: 'torus-knot',
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
