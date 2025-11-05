'use client'

import { MessageSquare, BookOpen, FileText, HelpCircle, Radio } from 'lucide-react'

interface FeatureTabsProps {
  activeTab: 'chat' | 'summarize' | 'notes' | 'quiz' | 'podcast'
  onTabChange: (tab: 'chat' | 'summarize' | 'notes' | 'quiz' | 'podcast') => void
}

const tabs = [
  { id: 'chat' as const, label: 'Chat', icon: MessageSquare },
  { id: 'summarize' as const, label: 'Tóm tắt', icon: BookOpen },
  { id: 'notes' as const, label: 'Ghi chú', icon: FileText },
  { id: 'quiz' as const, label: 'Quiz', icon: HelpCircle },
  { id: 'podcast' as const, label: 'Podcast', icon: Radio },
]

export default function FeatureTabs({ activeTab, onTabChange }: FeatureTabsProps) {
  return (
    <div className="flex gap-2 border-b border-gray-200">
      {tabs.map((tab) => {
        const Icon = tab.icon
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}


