'use client'

import { useState } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { documentApi } from '@/app/services/api'

interface PdfUploadProps {
  onUploaded: (documentId: string, filename: string) => void
}

export default function PdfUpload({ onUploaded }: PdfUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file')
      return
    }
    setFile(selectedFile)
    setError(null)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      const response = await documentApi.upload(file)
      if (response.success) {
        onUploaded(response.document_id, file.name)
      } else {
        setError('Upload failed. Please try again.')
      }
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 'Error uploading file. Please try again.'
      )
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600 mb-4">
          Upload a PDF file to start chatting
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div
          className={`border-2 border-dashed rounded-xl p-5 md:p-6 text-center transition-all duration-200 ${
            dragActive
              ? 'border-primary-500 bg-primary-50 scale-[1.02]'
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          } ${error ? 'border-red-400 bg-red-50' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="mb-3">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
              <FileText className={`w-6 h-6 transition-colors ${dragActive ? 'text-primary-600' : 'text-gray-400'}`} />
            </div>
          </div>
          <div className="mb-3">
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose PDF File
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0])
                }
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mb-2">or drag and drop here</p>
          {file && (
            <div className="mt-3 flex items-center justify-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span className="font-medium text-xs text-green-900 truncate max-w-full">
                {file.name}
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-3 flex items-start gap-2 text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg text-sm animate-fade-in">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!file || uploading}
          className="mt-4 w-full px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Upload & Process</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}


