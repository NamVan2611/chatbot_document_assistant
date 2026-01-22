'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Trash2, MessageSquare, Download, FileText, X } from 'lucide-react'
import { chatApi, chatHistoryApi } from '@/app/services/api'
import type { Message, Language, Document } from '@/app/types/chat'
import MessageBubble from './MessageBubble'
import SuggestedQuestions from './SuggestedQuestions'
import QuickActions from './QuickActions'

interface ChatBoxProps {
  sessionId: string
  documents: Document[]
  onDocumentsChange: (documents: Document[]) => void
}

export default function ChatBox({ sessionId, documents, onDocumentsChange }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState<Language>('en')
  const [historyLoading, setHistoryLoading] = useState(true)
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>(documents.map(d => d.document_id))
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Load chat history when session changes
  useEffect(() => {
    const loadHistory = async () => {
      if (!sessionId) return
      
      setHistoryLoading(true)
      try {
        const response = await chatHistoryApi.getHistory(sessionId)
        if (response.success && response.messages) {
          // Convert history messages to Message format
          const historyMessages: Message[] = response.messages.map((msg: any) => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          }))
          setMessages(historyMessages)
        }
      } catch (error) {
        console.error('Error loading chat history:', error)
      } finally {
        setHistoryLoading(false)
      }
    }
    
    loadHistory()
  }, [sessionId])

  // Update selected documents when documents list changes
  useEffect(() => {
    if (documents.length > 0) {
      // Auto-select all documents if none selected
      if (selectedDocumentIds.length === 0) {
        setSelectedDocumentIds(documents.map(d => d.document_id))
      }
      // Remove deleted documents from selection
      else {
        setSelectedDocumentIds(prev => 
          prev.filter(id => documents.some(d => d.document_id === id))
        )
      }
    }
  }, [documents])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleClearHistory = async () => {
    if (!sessionId) return
    
    try {
      await chatHistoryApi.clearHistory(sessionId)
      setMessages([])
    } catch (error) {
      console.error('Error clearing chat history:', error)
    }
  }

  const toggleDocumentSelection = (documentId: string) => {
    setSelectedDocumentIds(prev => {
      if (prev.includes(documentId)) {
        // Don't allow deselecting if it's the last one
        if (prev.length === 1) return prev
        return prev.filter(id => id !== documentId)
      } else {
        return [...prev, documentId]
      }
    })
  }

  const handleSubmit = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault()
    const query = customQuery || input.trim()
    if (!query || loading) return

    const userMessage = query.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      if (selectedDocumentIds.length === 0) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: language === 'vi'
              ? 'Vui lòng chọn ít nhất một tài liệu để chat.'
              : 'Please select at least one document to chat.',
          },
        ])
        setLoading(false)
        return
      }

      const response = await chatApi.query({
        query: userMessage,
        session_id: sessionId,
        document_ids: selectedDocumentIds,
        language: language,
      })

      if (response.success) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: response.response },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: language === 'vi' 
              ? 'Xin lỗi, tôi gặp lỗi. Vui lòng thử lại.'
              : 'Sorry, I encountered an error. Please try again.',
          },
        ])
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            error.response?.data?.detail ||
            (language === 'vi'
              ? 'Xin lỗi, tôi gặp lỗi. Vui lòng thử lại.'
              : 'Sorry, I encountered an error. Please try again.'),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleExportHistory = () => {
    if (messages.length === 0) return

    const content = messages
      .map((msg) => {
        const role = msg.role === 'user' ? 'You' : 'Assistant'
        return `${role}:\n${msg.content}\n`
      })
      .join('\n---\n\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat-history-${sessionId.slice(0, 8)}-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const suggestedQuestions = {
    en: [
      'What is this document about?',
      'What are the main topics covered?',
      'Can you explain the key concepts?',
      'What are the important points I should remember?',
    ],
    vi: [
      'Tài liệu này nói về gì?',
      'Những chủ đề chính được đề cập là gì?',
      'Bạn có thể giải thích các khái niệm chính không?',
      'Những điểm quan trọng tôi nên nhớ là gì?',
    ],
  }

  return (
    <div className="flex flex-col h-full min-h-[500px] md:h-[600px]">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 text-sm md:text-base">Chat with Documents</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-1.5 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 text-xs md:text-sm rounded-md font-medium transition-all duration-200 ${
                  language === 'en'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('vi')}
                className={`px-3 py-1.5 text-xs md:text-sm rounded-md font-medium transition-all duration-200 ${
                  language === 'vi'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                VI
              </button>
            </div>
            {messages.length > 0 && (
              <>
                <button
                  onClick={handleExportHistory}
                  className="px-3 py-1.5 text-xs md:text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 flex items-center gap-1.5 hover:scale-105 active:scale-95"
                  title="Export chat history"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <button
                  onClick={handleClearHistory}
                  className="px-3 py-1.5 text-xs md:text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 flex items-center gap-1.5 hover:scale-105 active:scale-95"
                  title="Clear chat history"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Document Selector */}
        {documents.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-gray-600">
                {language === 'vi' ? 'Tài liệu đang sử dụng:' : 'Active documents:'}
              </span>
              {documents.map((doc) => (
                <button
                  key={doc.document_id}
                  onClick={() => toggleDocumentSelection(doc.document_id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedDocumentIds.includes(doc.document_id)
                      ? 'bg-primary-100 text-primary-700 border border-primary-300'
                      : 'bg-gray-100 text-gray-600 border border-gray-300 opacity-50 hover:opacity-75'
                  }`}
                  title={selectedDocumentIds.includes(doc.document_id) 
                    ? (language === 'vi' ? 'Nhấp để bỏ chọn' : 'Click to deselect')
                    : (language === 'vi' ? 'Nhấp để chọn' : 'Click to select')
                  }
                >
                  <FileText className="w-3 h-3" />
                  <span className="max-w-[120px] truncate">{doc.document_name}</span>
                  {selectedDocumentIds.includes(doc.document_id) && selectedDocumentIds.length > 1 && (
                    <X className="w-3 h-3" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
        {historyLoading ? (
          <div className="text-center text-gray-500 mt-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-3">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
            </div>
            <p className="text-sm">Loading chat history...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8 md:mt-12 animate-fade-in max-w-2xl mx-auto px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <p className="font-medium text-gray-900 mb-2">
              {language === 'vi' 
                ? 'Hãy hỏi tôi bất cứ điều gì về tài liệu của bạn!' 
                : 'Ask me anything about your document!'}
            </p>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
              {language === 'vi'
                ? 'Tôi có thể trả lời câu hỏi, giúp bạn tìm thông tin cụ thể và hỗ trợ học tập.'
                : 'I can answer questions, help you find specific information, and support your learning.'}
            </p>
            <SuggestedQuestions
              questions={suggestedQuestions[language]}
              onSelectQuestion={(q) => handleSubmit(undefined, q)}
              language={language}
            />
            <QuickActions
              onActionClick={(action) => {
                if (action.includes('...')) {
                  setInput(action)
                } else {
                  handleSubmit(undefined, action)
                }
              }}
              language={language}
            />
          </div>
        ) : null}

        {messages.map((message, index) => (
          <div key={index} className="animate-slide-up">
            <MessageBubble message={message} />
          </div>
        ))}
        
        {messages.length > 0 && messages.length % 2 === 0 && !loading && (
          <div className="mt-4">
            <QuickActions
              onActionClick={(action) => {
                if (action.includes('...')) {
                  setInput(action)
                } else {
                  handleSubmit(undefined, action)
                }
              }}
              language={language}
            />
          </div>
        )}

        {loading && (
          <div className="flex gap-3 justify-start animate-fade-in">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-3 flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-gradient-to-t from-white to-gray-50/50 p-4 sticky bottom-0 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                language === 'vi'
                  ? 'Nhập câu hỏi của bạn...'
                  : 'Type your question...'
              }
              className="w-full px-4 py-2.5 md:py-3 pr-20 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm md:text-base bg-white shadow-sm hover:shadow-md focus:shadow-md"
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
                  e.preventDefault()
                  if (!loading && input.trim()) {
                    handleSubmit(e as any, undefined)
                  }
                }
              }}
              autoComplete="off"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none hidden md:block">
              Enter to send
            </div>
          </div>
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 md:px-6 py-2.5 md:py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 hover:scale-105 active:scale-95 disabled:hover:scale-100 shadow-sm hover:shadow-md"
            aria-label="Send message"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
            ) : (
              <Send className="w-4 h-4 md:w-5 md:h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  )
}


