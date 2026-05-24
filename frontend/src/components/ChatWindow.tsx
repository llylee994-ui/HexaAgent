import { useEffect, useRef } from 'react'
import { useChatStore } from '../stores/useChatStore'
import ChatMessage from './ChatMessage'

export default function ChatWindow() {
  const messages = useChatStore((s) => s.messages)
  const isLoading = useChatStore((s) => s.isLoading)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isLoading])

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.length === 0 && !isLoading && (
        <div className="flex items-center justify-center h-full text-warmgray text-sm">
          <div className="text-center space-y-2">
            <p className="text-lg tracking-widest text-gold-dim">六爻</p>
            <p className="text-xs">输入问题，开始解卦</p>
          </div>
        </div>
      )}

      {messages.map((msg) => (<ChatMessage key={msg.id} message={msg} />))}

      {isLoading && (
        <div className="flex justify-start mb-4">
          <div className="bg-paper border border-line rounded px-4 py-3 text-sm text-warmgray">推演中&hellip;</div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}
