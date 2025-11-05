'use client'

import { useState, useEffect } from 'react'
import ChatInterface from '@/components/ChatInterface'
import DocumentUpload from '@/components/DocumentUpload'
import DocumentList from '@/components/DocumentList'
import FeatureTabs from '@/components/FeatureTabs'
import SummarizeView from '@/components/SummarizeView'
import NotesView from '@/components/NotesView'
import QuizView from '@/components/QuizView'
import PodcastView from '@/components/PodcastView'
import { BookOpen, MessageSquare, FileText, Brain } from 'lucide-react'

export default function Home() {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null)
  const [documents, setDocuments] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'chat' | 'summarize' | 'notes' | 'quiz' | 'podcast'>('chat')

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/documents/list`)
      const data = await response.json()
      setDocuments(data.documents || [])
    } catch (error) {
      console.error('Error fetching documents:', error)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-10 h-10 text-primary-600" />
            <h1 className="text-4xl font-bold text-gray-800">
              Chatbot Hỗ trợ Học tập
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            AI Teaching Assistant - Trợ giảng ảo thông minh cho sinh viên
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Document Management */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-semibold text-gray-800">Tài liệu</h2>
              </div>
              
              <DocumentUpload onUploadSuccess={fetchDocuments} />
              
              <div className="mt-4">
                <DocumentList
                  documents={documents}
                  selectedDocument={selectedDocument}
                  onSelectDocument={setSelectedDocument}
                  onDeleteDocument={fetchDocuments}
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <FeatureTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
              
              {selectedDocument ? (
                <div className="mt-6">
                  {activeTab === 'chat' && (
                    <ChatInterface documentId={selectedDocument} />
                  )}
                  {activeTab === 'summarize' && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        Tóm tắt Tài liệu
                      </h3>
                      <SummarizeView documentId={selectedDocument} />
                    </div>
                  )}
                  {activeTab === 'notes' && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Ghi chú Học tập
                      </h3>
                      <NotesView documentId={selectedDocument} />
                    </div>
                  )}
                  {activeTab === 'quiz' && (
                    <QuizView documentId={selectedDocument} />
                  )}
                  {activeTab === 'podcast' && (
                    <PodcastView documentId={selectedDocument} />
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Vui lòng tải lên một tài liệu để bắt đầu</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

