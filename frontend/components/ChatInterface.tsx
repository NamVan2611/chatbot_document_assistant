'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, User, Bot, Loader2 } from 'lucide-react'
import { chatAPI } from '@/lib/api'
import ReactMarkdown from 'react-markdown'

interface Message {
  role: 'user' | 'assistant'
  content: string
  sources?: Array<{ text: string; score: number; chunk_index: number }>
}

interface ChatInterfaceProps {
  documentId: string
}

export default function ChatInterface({ documentId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      role: 'user',
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await chatAPI.sendMessage(
        input,
        documentId,
        conversationId || undefined
      )

      if (!conversationId) {
        setConversationId(response.conversation_id)
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.response,
        sources: response.sources,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error: any) {
      const errorDetail = error.response?.data?.detail
      let errorText = 'Không thể kết nối đến server'
      
      if (errorDetail) {
        if (typeof errorDetail === 'string') {
          errorText = errorDetail
        } else if (typeof errorDetail === 'object') {
          const errorObj = errorDetail as { error?: string; message?: string; solutions?: string[] }
          errorText = errorObj.message || errorObj.error || 'Lỗi không xác định'
          if (errorObj.solutions && errorObj.solutions.length > 0) {
            errorText += '\n\nGiải pháp:\n' + errorObj.solutions.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')
          }
        }
      }
      
      const errorMessage: Message = {
        role: 'assistant',
        content: `Lỗi: ${errorText}`,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-[600px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-lg">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Hãy đặt câu hỏi về nội dung tài liệu...</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary-600" />
                </div>
              )}
              
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border border-gray-200'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
                
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-600 mb-2">
                      Nguồn tham khảo:
                    </p>
                    <div className="space-y-1">
                      {msg.sources.map((source, i) => (
                        <div
                          key={i}
                          className="text-xs text-gray-500 bg-gray-50 p-2 rounded"
                        >
                          <p className="line-clamp-2">{source.text}</p>
                          <p className="text-xs mt-1">
                            Độ tương đồng: {(1 - source.score).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
              )}
            </div>
          ))
        )}
        
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-600" />
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="mt-4 flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Nhập câu hỏi của bạn..."
          className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
          rows={2}
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}


