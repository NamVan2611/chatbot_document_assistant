'use client'

import { useState } from 'react'
import { Loader2, Download } from 'lucide-react'
import { summarizeAPI } from '@/lib/api'
import ReactMarkdown from 'react-markdown'
import { saveAs } from 'file-saver'

interface SummarizeViewProps {
  documentId: string
}

export default function SummarizeView({ documentId }: SummarizeViewProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [summaryType, setSummaryType] = useState<'full' | 'chapter'>('full')

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const response = await summarizeAPI.summarize(documentId, summaryType)
      setSummary(response.summary)
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Lỗi khi tạo tóm tắt')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!summary) return
    const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' })
    saveAs(blob, 'summary.txt')
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <select
          value={summaryType}
          onChange={(e) => setSummaryType(e.target.value as 'full' | 'chapter')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="full">Tóm tắt toàn bộ</option>
          <option value="chapter">Tóm tắt theo chương</option>
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
            'Tạo tóm tắt'
          )}
        </button>
      </div>

      {summary && (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-gray-800">Tóm tắt:</h4>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Tải xuống
            </button>
          </div>
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{summary}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}


