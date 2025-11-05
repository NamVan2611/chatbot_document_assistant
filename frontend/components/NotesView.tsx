'use client'

import { useState } from 'react'
import { Loader2, Download } from 'lucide-react'
import { notesAPI } from '@/lib/api'
import ReactMarkdown from 'react-markdown'
import { saveAs } from 'file-saver'

interface NotesViewProps {
  documentId: string
}

export default function NotesView({ documentId }: NotesViewProps) {
  const [notes, setNotes] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [format, setFormat] = useState<'bullet' | 'mindmap' | 'outline'>('bullet')

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const response = await notesAPI.generate(documentId, format)
      setNotes(response.notes)
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Lỗi khi tạo ghi chú')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!notes) return
    const blob = new Blob([notes], { type: 'text/plain;charset=utf-8' })
    saveAs(blob, 'study-notes.txt')
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value as 'bullet' | 'mindmap' | 'outline')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="bullet">Bullet Points</option>
          <option value="mindmap">Mindmap</option>
          <option value="outline">Outline</option>
        </select>
        
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang tạo...
            </span>
          ) : (
            'Tạo ghi chú'
          )}
        </button>
      </div>

      {notes && (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-gray-800">Ghi chú học tập:</h4>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Tải xuống
            </button>
          </div>
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{notes}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}


