export interface Child {
  id: string
  name: string
  age: number
  gender: 'boy' | 'girl'
  temperament_traits: string[]
  effective_phrases: string
  ineffective_phrases: string
  notes: string
  user_key: string
  created_at: string
}

export interface SituationInput {
  current_state: string
  previous_activity: string
  parent_state: string
  trigger?: string
  duration?: string
  intensity?: string
  additional_notes?: string
}

export interface Phrase {
  text: string
  reason: string
}

export interface SuggestResult {
  phrases: Phrase[]
  advice: string
  parent_message: string
  unexpected_advice: string | null
  reward: string
}

export interface SessionData {
  child: Child
  situation: SituationInput
  result: SuggestResult
}
