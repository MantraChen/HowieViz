export type VisualizerCategory = 'linear' | 'tree' | 'graph' | 'sorting' | 'searching' | 'dp'

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

export interface QuizQuestion {
  id: string
  type: 'multiple_choice' | 'true_false' | 'fill_in'
  question: string
  options?: string[]
  correct: string
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
  relatedLine?: number
}
