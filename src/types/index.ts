export type VisualizerCategory = 'linear' | 'tree' | 'graph' | 'sorting' | 'searching'

export interface NavItem {
  label: string
  path: string
  category: VisualizerCategory
  description: string
}

export interface ArrayElement {
  id: string
  value: number
  highlight?: 'default' | 'active' | 'inserted' | 'deleted'
}

export type AnimationSpeed = 'slow' | 'normal' | 'fast'

export interface VisualizerControls {
  isPlaying: boolean
  speed: AnimationSpeed
  step: number
}
