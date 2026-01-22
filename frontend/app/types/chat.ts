export type MessageRole = 'user' | 'assistant'

export interface Message {
  role: MessageRole
  content: string
}

export type Language = 'en' | 'vi'

export interface QueryRequest {
  query: string
  session_id: string
  document_ids: string[]
  language?: Language
}

export interface Document {
  document_id: string
  document_name: string
  added_at?: string
}

export interface ChatSession {
  session_id: string
  documents: Document[]
  created_at: string
  updated_at: string
}

export interface QueryResponse {
  success: boolean
  response: string
}

export interface DocumentUploadResponse {
  success: boolean
  document_id: string
  message: string
}

export interface TaskRequest {
  document_id: string
  language?: Language
}

export interface TaskResponse {
  success: boolean
  response: string
}


