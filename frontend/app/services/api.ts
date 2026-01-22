import axios from 'axios'
import type {
  QueryRequest,
  QueryResponse,
  DocumentUploadResponse,
  TaskRequest,
  TaskResponse,
} from '@/app/types/chat'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const documentApi = {
  upload: async (file: File): Promise<DocumentUploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post<DocumentUploadResponse>(
      '/api/documents/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  },

  list: async () => {
    const response = await api.get('/api/documents/')
    return response.data
  },
}

export const chatApi = {
  query: async (request: QueryRequest): Promise<QueryResponse> => {
    const response = await api.post<QueryResponse>('/api/chat/query', request)
    return response.data
  },
}


export const chatSessionApi = {
  createSession: async () => {
    const response = await api.post('/api/chat/session')
    return response.data
  },

  getSession: async (sessionId: string) => {
    const response = await api.get(`/api/chat/session/${sessionId}`)
    return response.data
  },

  addDocument: async (sessionId: string, documentId: string, documentName: string) => {
    const response = await api.post(`/api/chat/session/${sessionId}/documents`, {
      document_id: documentId,
      document_name: documentName
    })
    return response.data
  },

  listSessions: async () => {
    const response = await api.get('/api/chat/sessions')
    return response.data
  },
}

export const chatHistoryApi = {
  getHistory: async (sessionId: string) => {
    const response = await api.get(`/api/chat/history/${sessionId}`)
    return response.data
  },

  listHistories: async () => {
    const response = await api.get('/api/chat/histories')
    return response.data
  },

  clearHistory: async (sessionId: string) => {
    const response = await api.delete(`/api/chat/history/${sessionId}`)
    return response.data
  },
}

export default api


