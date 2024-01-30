export interface ChatMessage {
  content: string
  role: ChatRole
  feedback?: string
}

export interface Persona {
  id?: string
  role: ChatRole
  avatar?: string
  name?: string
  prompt?: string
  key?: string
  isDefault?: boolean
}

export interface Chat {
  id: string
  persona?: Persona
  messages?: ChatMessage[]
  title?: string
}

export interface Feedback {
  id?: string
  message?: string
  feedback?: string
  conversation?: any[]
}

export type ChatRole = 'assistant' | 'user' | 'system'
