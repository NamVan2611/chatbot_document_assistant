'use client'

import { useState } from 'react'
import { FileText, Trash2, Check } from 'lucide-react'
import { documentsAPI } from '@/lib/api'

interface Document {
  document_id: string
  filename: string
  uploaded_at?: number
}

interface DocumentListProps {
  documents: Document[]
  selectedDocument: string | null
  onSelectDocument: (documentId: string) => void
  onDeleteDocument: () => void
}

export default function DocumentList({
  documents,
  selectedDocument,
  onSelectDocument,
  onDeleteDocument,
}: DocumentListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (documentId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!confirm('Bạn có chắc muốn xóa tài liệu này?')) return

    setDeletingId(documentId)
    try {
      await documentsAPI.delete(documentId)
      if (selectedDocument === documentId) {
        onSelectDocument('')
      }
      onDeleteDocument()
    } catch (error) {
      alert('Lỗi khi xóa tài liệu')
    } finally {
      setDeletingId(null)
    }
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Chưa có tài liệu nào</p>
      </div>
    )
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {documents.map((doc) => (
        <div
          key={doc.document_id}
          onClick={() => onSelectDocument(doc.document_id)}
          className={`p-3 rounded-lg cursor-pointer transition-all ${
            selectedDocument === doc.document_id
              ? 'bg-primary-50 border-2 border-primary-500'
              : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <FileText className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {doc.filename}
                </p>
                {doc.uploaded_at && (
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(doc.uploaded_at * 1000).toLocaleDateString('vi-VN')}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {selectedDocument === doc.document_id && (
                <Check className="w-4 h-4 text-primary-600" />
              )}
              <button
                onClick={(e) => handleDelete(doc.document_id, e)}
                disabled={deletingId === doc.document_id}
                className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}


