import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Documents API
export const documentsAPI = {
  upload: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/api/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  list: async () => {
    const response = await api.get('/api/documents/list')
    return response.data
  },

  delete: async (documentId: string) => {
    const response = await api.delete(`/api/documents/${documentId}`)
    return response.data
  },
}

// Chat API
export const chatAPI = {
  sendMessage: async (message: string, documentId: string, conversationId?: string) => {
    const response = await api.post('/api/chat/', {
      message,
      document_id: documentId,
      conversation_id: conversationId,
    })
    return response.data
  },

  getHistory: async (conversationId: string) => {
    const response = await api.get(`/api/chat/history/${conversationId}`)
    return response.data
  },
}

// Summarize API
export const summarizeAPI = {
  summarize: async (documentId: string, summaryType: string = 'full', chapterNumber?: number) => {
    const response = await api.post('/api/summarize/', {
      document_id: documentId,
      summary_type: summaryType,
      chapter_number: chapterNumber,
    })
    return response.data
  },
}

// Notes API
export const notesAPI = {
  generate: async (documentId: string, format: string = 'bullet') => {
    const response = await api.post('/api/notes/', {
      document_id: documentId,
      format,
    })
    return response.data
  },
}

// Quiz API
export const quizAPI = {
  generate: async (documentId: string, numQuestions: number = 5, questionType: string = 'mixed') => {
    const response = await api.post('/api/quiz/', {
      document_id: documentId,
      num_questions: numQuestions,
      question_type: questionType,
    })
    return response.data
  },
}

// Podcast API
export const podcastAPI = {
  generate: async (documentId: string, topic?: string, durationMinutes: number = 5) => {
    const response = await api.post('/api/podcast/', {
      document_id: documentId,
      topic,
      duration_minutes: durationMinutes,
    })
    return response.data
  },

  getAudio: (documentId: string) => {
    return `${API_URL}/api/podcast/audio/${documentId}`
  },
}

export default api


