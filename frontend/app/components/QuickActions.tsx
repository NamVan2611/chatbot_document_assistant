'use client'

import { Sparkles, FileText, HelpCircle, Search, BookOpen } from 'lucide-react'

interface QuickActionsProps {
  onActionClick: (action: string) => void
  language: 'en' | 'vi'
}

const quickActions = {
  en: [
    { icon: FileText, label: 'Summarize this document', query: 'Can you provide a summary of this document?' },
    { icon: HelpCircle, label: 'Explain key concepts', query: 'What are the key concepts explained in this document?' },
    { icon: Search, label: 'Find specific information', query: 'Help me find information about...' },
    { icon: BookOpen, label: 'Main points', query: 'What are the main points covered in this document?' },
  ],
  vi: [
    { icon: FileText, label: 'Tóm tắt tài liệu này', query: 'Bạn có thể tóm tắt tài liệu này không?' },
    { icon: HelpCircle, label: 'Giải thích khái niệm chính', query: 'Những khái niệm chính được giải thích trong tài liệu này là gì?' },
    { icon: Search, label: 'Tìm thông tin cụ thể', query: 'Giúp tôi tìm thông tin về...' },
    { icon: BookOpen, label: 'Các điểm chính', query: 'Những điểm chính được đề cập trong tài liệu này là gì?' },
  ],
}

export default function QuickActions({ onActionClick, language }: QuickActionsProps) {
  const actions = quickActions[language]

  return (
    <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center gap-2 text-xs font-medium text-gray-600 mb-2">
        <Sparkles className="w-3.5 h-3.5 text-primary-600" />
        <span>{language === 'vi' ? 'Hành động nhanh:' : 'Quick actions:'}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {actions.map((action, index) => {
          const Icon = action.icon
          return (
            <button
              key={index}
              onClick={() => onActionClick(action.query)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700 transition-all duration-200 text-gray-700"
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">{action.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
