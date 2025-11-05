'use client'

import { useState } from 'react'
import { Loader2, Download, HelpCircle } from 'lucide-react'
import { quizAPI } from '@/lib/api'
import { saveAs } from 'file-saver'

interface Question {
  question: string
  type: string
  options?: string[]
  correct_answer: string
  explanation?: string
}

interface QuizViewProps {
  documentId: string
}

export default function QuizView({ documentId }: QuizViewProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [numQuestions, setNumQuestions] = useState(5)
  const [questionType, setQuestionType] = useState('mixed')
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({})
  const [showAnswers, setShowAnswers] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    setShowAnswers(false)
    setSelectedAnswers({})
    try {
      const response = await quizAPI.generate(documentId, numQuestions, questionType)
      setQuestions(response.questions || [])
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Lỗi khi tạo quiz')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (questions.length === 0) return
    
    let content = 'QUIZ - Câu hỏi ôn tập\n\n'
    questions.forEach((q, idx) => {
      content += `${idx + 1}. ${q.question}\n`
      if (q.options) {
        q.options.forEach(opt => content += `   ${opt}\n`)
      }
      content += `\nĐáp án: ${q.correct_answer}\n`
      if (q.explanation) {
        content += `Giải thích: ${q.explanation}\n`
      }
      content += '\n'
    })
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    saveAs(blob, 'quiz.txt')
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center flex-wrap">
        <input
          type="number"
          min="1"
          max="20"
          value={numQuestions}
          onChange={(e) => setNumQuestions(parseInt(e.target.value))}
          className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <span className="text-gray-600">câu hỏi</span>
        
        <select
          value={questionType}
          onChange={(e) => setQuestionType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="mixed">Hỗn hợp</option>
          <option value="multiple_choice">Trắc nghiệm</option>
          <option value="essay">Tự luận</option>
          <option value="flashcard">Flashcard</option>
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
            'Tạo quiz'
          )}
        </button>

        {questions.length > 0 && (
          <>
            <button
              onClick={() => setShowAnswers(!showAnswers)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              {showAnswers ? 'Ẩn đáp án' : 'Hiện đáp án'}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Tải xuống
            </button>
          </>
        )}
      </div>

      {questions.length > 0 && (
        <div className="space-y-6">
          {questions.map((q, idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-start gap-3 mb-4">
                <HelpCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Câu {idx + 1}: {q.question}
                  </h4>
                  
                  {q.type === 'multiple_choice' && q.options && (
                    <div className="space-y-2 mb-4">
                      {q.options.map((option, optIdx) => (
                        <label
                          key={optIdx}
                          className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedAnswers[idx] === option
                              ? 'bg-primary-100 border-2 border-primary-500'
                              : 'bg-white border-2 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${idx}`}
                            value={option}
                            checked={selectedAnswers[idx] === option}
                            onChange={(e) =>
                              setSelectedAnswers({ ...selectedAnswers, [idx]: e.target.value })
                            }
                            className="text-primary-600"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  
                  {showAnswers && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="font-semibold text-green-800 mb-2">Đáp án đúng:</p>
                      <p className="text-green-700">{q.correct_answer}</p>
                      {q.explanation && (
                        <p className="text-sm text-green-600 mt-2">
                          <span className="font-semibold">Giải thích:</span> {q.explanation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


