'use client'

import { useState, useEffect } from 'react'
import { History, X, Clock, FileText, ChevronRight } from 'lucide-react'
import { chatHistoryApi } from '@/app/services/api'
import type { Message } from '@/app/types/chat'

interface ChatHistoryPanelProps {
  isOpen: boolean
  onClose: () => void
  onSelectHistory: (sessionId: string) => void
}

interface HistoryItem {
  session_id: string
  document_ids: string[]
  message_count: number
  created_at: string
  updated_at: string
}

export default function ChatHistoryPanel({ isOpen, onClose, onSelectHistory }: ChatHistoryPanelProps) {
  const [histories, setHistories] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedHistory, setSelectedHistory] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    if (isOpen) {
      loadHistories()
    }
  }, [isOpen])

  const loadHistories = async () => {
    try {
      setLoading(true)
      const response = await chatHistoryApi.listHistories()
      if (response.success) {
        setHistories(response.histories || [])
      }
    } catch (error) {
      console.error('Error loading histories:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadHistoryMessages = async (sessionId: string) => {
    try {
      const response = await chatHistoryApi.getHistory(sessionId)
      if (response.success) {
        const historyMessages: Message[] = response.messages.map((msg: any) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }))
        setMessages(historyMessages)
        setSelectedHistory(sessionId)
      }
    } catch (error) {
      console.error('Error loading history messages:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Chat History</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* History List */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : histories.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">No chat history</div>
            ) : (
              <div className="p-2">
                {histories.map((history) => (
                  <button
                    key={history.session_id}
                    onClick={() => loadHistoryMessages(history.session_id)}
                    className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                      selectedHistory === history.session_id
                        ? 'bg-primary-50 border border-primary-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-xs font-medium text-gray-600 truncate">
                            {history.document_ids.length} document(s)
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(history.updated_at)}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {history.message_count} messages
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Messages View */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            {selectedHistory ? (
              messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === 'user'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 mt-8">No messages in this history</div>
              )
            ) : (
              <div className="text-center text-gray-500 mt-8">Select a history to view messages</div>
            )}
          </div>
        </div>

        {/* Footer */}
        {selectedHistory && (
          <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
            <button
              onClick={() => {
                onSelectHistory(selectedHistory)
                onClose()
              }}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
            >
              Continue This Chat
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
