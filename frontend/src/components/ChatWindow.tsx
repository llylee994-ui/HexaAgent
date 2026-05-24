import { useEffect, useRef } from 'react'
import { useChatStore } from '../stores/useChatStore'
import ChatMessage from './ChatMessage'

export default function ChatWindow() {
  const messages = useChatStore((s) => s.messages)
  const isLoading = useChatStore((s) => s.isLoading)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.length === 0 && !isLoading && (
        <div className="flex items-center justify-center h-full text-gray-600 text-sm">
          <div className="text-center">
            <div className="text-4xl mb-3">🔮</div>
            <p>输入你的问题，开始解卦</p>
            <p className="text-xs mt-1">使用下方输入框发送问题</p>
          </div>
        </div>
      )}

      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}

      {isLoading && (
        <div className="flex justify-start mb-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <span className="animate-pulse">排盘中</span>
              <span className="animate-bounce">...</span>
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
