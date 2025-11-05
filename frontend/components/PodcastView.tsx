'use client'

import { useState } from 'react'
import { Loader2, Download, Play, Radio } from 'lucide-react'
import { podcastAPI } from '@/lib/api'
import { saveAs } from 'file-saver'

interface PodcastViewProps {
  documentId: string
}

export default function PodcastView({ documentId }: PodcastViewProps) {
  const [transcript, setTranscript] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [topic, setTopic] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(5)

  const handleGenerate = async () => {
    setLoading(true)
    setTranscript(null)
    setAudioUrl(null)
    try {
      const response = await podcastAPI.generate(
        documentId,
        topic || undefined,
        durationMinutes
      )
      setTranscript(response.transcript)
      if (response.audio_url) {
        setAudioUrl(podcastAPI.getAudio(documentId))
      }
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Lỗi khi tạo podcast')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadTranscript = () => {
    if (!transcript) return
    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' })
    saveAs(blob, 'podcast-transcript.txt')
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Radio className="w-5 h-5 text-blue-600" />
          <h4 className="font-semibold text-blue-800">Tạo Podcast Giáo dục</h4>
        </div>
        <p className="text-sm text-blue-700">
          Tạo đoạn hội thoại giữa giảng viên và sinh viên để giải thích các khái niệm khó một cách dễ hiểu.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chủ đề cụ thể (tùy chọn):
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ví dụ: Machine Learning, Deep Learning..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Độ dài (phút):
          </label>
          <input
            type="number"
            min="1"
            max="15"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
            className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang tạo podcast...
            </span>
          ) : (
            'Tạo podcast'
          )}
        </button>
      </div>

      {transcript && (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-gray-800">Transcript:</h4>
            <div className="flex gap-2">
              {audioUrl && (
                <a
                  href={audioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Nghe podcast
                </a>
              )}
              <button
                onClick={handleDownloadTranscript}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Tải transcript
              </button>
            </div>
          </div>
          <div className="prose prose-sm max-w-none whitespace-pre-wrap">
            {transcript}
          </div>
        </div>
      )}
    </div>
  )
}


