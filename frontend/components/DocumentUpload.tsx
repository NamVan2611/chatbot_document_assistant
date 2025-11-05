'use client'

import { useState } from 'react'
import { Upload, File, Loader2 } from 'lucide-react'
import { documentsAPI } from '@/lib/api'

interface DocumentUploadProps {
  onUploadSuccess: () => void
}

export default function DocumentUpload({ onUploadSuccess }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Kiểm tra định dạng file
    const allowedTypes = ['.pdf', '.docx', '.txt']
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase()
    
    if (!allowedTypes.includes(fileExt)) {
      setMessage({ type: 'error', text: 'Chỉ chấp nhận file PDF, DOCX hoặc TXT' })
      return
    }

    setUploading(true)
    setMessage(null)

    try {
      await documentsAPI.upload(file)
      setMessage({ type: 'success', text: 'Tải lên thành công!' })
      onUploadSuccess()
      // Reset input
      e.target.value = ''
    } catch (error: any) {
      const errorDetail = error.response?.data?.detail
      let errorText = 'Lỗi khi tải lên file'
      
      if (errorDetail) {
        if (typeof errorDetail === 'string') {
          errorText = errorDetail
        } else if (typeof errorDetail === 'object') {
          // Format structured error object
          const errorObj = errorDetail as { error?: string; message?: string; solutions?: string[] }
          errorText = errorObj.message || errorObj.error || 'Lỗi không xác định'
          if (errorObj.solutions && errorObj.solutions.length > 0) {
            errorText += '\n\nGiải pháp:\n' + errorObj.solutions.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')
          }
        }
      }
      
      setMessage({
        type: 'error',
        text: errorText
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {uploading ? (
            <Loader2 className="w-8 h-8 mb-2 text-primary-600 animate-spin" />
          ) : (
            <Upload className="w-8 h-8 mb-2 text-gray-500" />
          )}
          <p className="mb-2 text-sm text-gray-500">
            {uploading ? 'Đang tải lên...' : 'Click để tải lên tài liệu'}
          </p>
          <p className="text-xs text-gray-500">PDF, DOCX, TXT</p>
        </div>
        <input
          type="file"
          className="hidden"
          accept=".pdf,.docx,.txt"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </label>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <div className="whitespace-pre-line">{message.text}</div>
        </div>
      )}
    </div>
  )
}


