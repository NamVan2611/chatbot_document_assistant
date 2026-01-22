'use client'

import { useState } from 'react'
import { Lightbulb, Sparkles } from 'lucide-react'

interface SuggestedQuestionsProps {
  questions: string[]
  onSelectQuestion: (question: string) => void
  language: 'en' | 'vi'
}

export default function SuggestedQuestions({ questions, onSelectQuestion, language }: SuggestedQuestionsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center gap-2 text-gray-600 mb-3">
        <Sparkles className="w-4 h-4 text-primary-600" />
        <span className="text-sm font-medium">
          {language === 'vi' ? 'Câu hỏi gợi ý:' : 'Suggested questions:'}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => onSelectQuestion(question)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="text-left p-3 rounded-lg border border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 text-sm text-gray-700 hover:text-primary-700 group"
          >
            <div className="flex items-start gap-2">
              <Lightbulb className={`w-4 h-4 mt-0.5 flex-shrink-0 transition-colors ${
                hoveredIndex === index ? 'text-primary-600' : 'text-gray-400'
              }`} />
              <span className="flex-1">{question}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
