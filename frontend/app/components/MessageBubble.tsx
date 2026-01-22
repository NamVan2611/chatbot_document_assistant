'use client'

import { useState } from 'react'
import { User, Bot, Copy, Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Message } from '@/app/types/chat'

interface MessageBubbleProps {
  message: Message
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div
      className={`flex gap-3 md:gap-4 group ${
        isUser ? 'justify-end' : 'justify-start'
      } animate-fade-in`}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center shadow-sm">
          <Bot className="w-4 h-4 md:w-5 md:h-5 text-primary-700" />
        </div>
      )}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[80%]`}>
        <div
          className={`rounded-2xl p-3 md:p-4 shadow-sm relative ${
            isUser
              ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-tr-sm'
              : 'bg-white border border-gray-200 text-gray-900 rounded-tl-sm'
          }`}
        >
          {!isUser && (
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900"
              title="Copy message"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          )}
          <div className="prose prose-sm md:prose-base max-w-none break-words leading-relaxed">
            {isUser ? (
              <div className="whitespace-pre-wrap text-white">{message.content}</div>
            ) : (
              <div className="text-gray-900 [&>*]:mb-2 [&>*:last-child]:mb-0">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="text-sm md:text-base">{children}</li>,
                    code: ({ className, children, ...props }: any) => {
                      const match = /language-(\w+)/.exec(className || '')
                      return match ? (
                        <code className="bg-gray-100 rounded px-1.5 py-0.5 text-xs font-mono" {...props}>
                          {children}
                        </code>
                      ) : (
                        <code className="bg-gray-100 rounded px-1.5 py-0.5 text-xs font-mono" {...props}>
                          {children}
                        </code>
                      )
                    },
                    pre: ({ children }) => (
                      <pre className="bg-gray-900 text-gray-100 rounded-lg p-3 overflow-x-auto text-xs md:text-sm mb-2">
                        {children}
                      </pre>
                    ),
                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center shadow-sm">
          <User className="w-4 h-4 md:w-5 md:h-5 text-white" />
        </div>
      )}
    </div>
  )
}


