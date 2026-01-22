'use client'

import { useState, useEffect } from 'react'
import ChatBox from '@/app/components/ChatBox'
import PdfUpload from '@/app/components/PdfUpload'
import ChatHistoryPanel from '@/app/components/ChatHistoryPanel'
import { BookOpen, Upload, MessageSquare, FileText, History, X } from 'lucide-react'
import { chatSessionApi, documentApi } from '@/app/services/api'
import type { Document, ChatSession } from '@/app/types/chat'

export default function Home() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [showUpload, setShowUpload] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [loading, setLoading] = useState(true)

  // Create or load session on mount
  useEffect(() => {
    const initializeSession = async () => {
      try {
        setLoading(true)
        // Create new session
        const response = await chatSessionApi.createSession()
        if (response.success) {
          setSessionId(response.session_id)
          
          // Try to load session documents if exists
          const sessionResponse = await chatSessionApi.getSession(response.session_id)
          if (sessionResponse.success && sessionResponse.session?.documents) {
            setDocuments(sessionResponse.session.documents)
          }
        }
      } catch (error) {
        console.error('Error initializing session:', error)
      } finally {
        setLoading(false)
      }
    }
    
    initializeSession()
  }, [])

  const handleDocumentUploaded = async (id: string, name: string) => {
    if (!sessionId) return

    try {
      // Add document to session
      await chatSessionApi.addDocument(sessionId, id, name)
      
      // Update documents list
      const newDocument: Document = {
        document_id: id,
        document_name: name,
        added_at: new Date().toISOString(),
      }
      setDocuments((prev) => [...prev, newDocument])
      setShowUpload(false)
    } catch (error) {
      console.error('Error adding document to session:', error)
    }
  }

  const handleRemoveDocument = async (documentId: string) => {
    // Remove from local state (backend doesn't have remove endpoint yet)
    setDocuments((prev) => prev.filter((doc) => doc.document_id !== documentId))
  }

  const handleSelectHistory = (selectedSessionId: string) => {
    // Load the selected session
    const loadSession = async () => {
      try {
        const response = await chatSessionApi.getSession(selectedSessionId)
        if (response.success && response.session) {
          setSessionId(response.session.session_id)
          setDocuments(response.session.documents || [])
          setShowHistory(false)
        }
      } catch (error) {
        console.error('Error loading session:', error)
      }
    }
    loadSession()
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-6 md:mb-8 text-center animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="p-2 bg-primary-100 rounded-xl">
              <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-primary-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Smart Learning Support
            </h1>
          </div>
          <p className="text-gray-600 text-base md:text-lg">
            Your AI-powered teaching assistant for academic documents
          </p>
        </header>

        {/* Main Layout - Combined */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Left Column - Document Upload & Info */}
            <div className="lg:col-span-1 space-y-4 animate-slide-up">
              {/* Chat History Button */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <button
                  onClick={() => setShowHistory(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium text-gray-700"
                >
                  <History className="w-4 h-4" />
                  View Chat History
                </button>
              </div>

              {/* Document Upload Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6 transition-shadow hover:shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2 text-sm md:text-base">
                    <Upload className="w-5 h-5 text-primary-600" />
                    Documents ({documents.length})
                  </h2>
                </div>

                {showUpload ? (
                  <PdfUpload onUploaded={handleDocumentUploaded} />
                ) : (
                  <div className="space-y-3">
                    {documents.length === 0 ? (
                      <div className="text-center py-6">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500 mb-4">No documents uploaded</p>
                        <button
                          onClick={() => setShowUpload(true)}
                          className="w-full px-4 py-2.5 text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-all duration-200 hover:shadow-sm active:scale-[0.98] border border-primary-200"
                        >
                          Upload Document
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                          {documents.map((doc) => (
                            <div
                              key={doc.document_id}
                              className="p-3 bg-gradient-to-br from-primary-50 to-gray-50 rounded-lg border border-primary-200 transition-all hover:shadow-sm group"
                            >
                              <div className="flex items-start gap-2">
                                <div className="p-1.5 bg-primary-100 rounded-lg flex-shrink-0">
                                  <FileText className="w-4 h-4 text-primary-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-gray-900 truncate">
                                    {doc.document_name}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                    Loaded
                                  </p>
                                </div>
                                {documents.length > 1 && (
                                  <button
                                    onClick={() => handleRemoveDocument(doc.document_id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all text-red-600"
                                    title="Remove document"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => setShowUpload(true)}
                          className="w-full px-4 py-2.5 text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-all duration-200 hover:shadow-sm active:scale-[0.98] border border-primary-200"
                        >
                          + Upload Another Document
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Chat */}
            <div className="lg:col-span-3 animate-slide-up">
              {loading ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-[500px] md:min-h-[600px]">
                  <div className="p-4 bg-gray-100 rounded-full mb-4 animate-pulse">
                    <MessageSquare className="w-12 h-12 md:w-16 md:h-16 text-gray-400" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                    Initializing...
                  </h3>
                </div>
              ) : sessionId && !showUpload ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-shadow hover:shadow-md h-full flex flex-col">
                  <ChatBox 
                    sessionId={sessionId}
                    documents={documents}
                    onDocumentsChange={setDocuments}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-[500px] md:min-h-[600px]">
                  <div className="p-4 bg-gray-100 rounded-full mb-4 animate-pulse">
                    <MessageSquare className="w-12 h-12 md:w-16 md:h-16 text-gray-400" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                    Upload a document to start chatting
                  </h3>
                  <p className="text-gray-500 text-sm md:text-base max-w-md mb-4">
                    Upload PDF documents to begin asking questions. You can upload multiple documents and chat with all of them!
                  </p>
                  <button
                    onClick={() => setShowUpload(true)}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    Upload Document
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat History Panel */}
      <ChatHistoryPanel
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onSelectHistory={handleSelectHistory}
      />
    </main>
  )
}
