import { useEffect, useRef } from 'react'
import { useChatStore } from '../stores/useChatStore'
import ChatMessage from './ChatMessage'

export default function ChatWindow() {
  const messages = useChatStore((s) => s.messages)
  const isLoading = useChatStore((s) => s.isLoading)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isLoading])

  // 给每条 assistant 消息找到配对的 user 消息
  const paired = messages.map((msg, i) => {
    if (msg.role !== 'assistant') return msg
    // 往前找最近的 user 消息
    for (let j = i - 1; j >= 0; j--) {
      if (messages[j].role === 'user') return { ...msg, _userQuestion: messages[j].content }
    }
    return msg
  })

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.length === 0 && !isLoading && (
        <div className="flex items-center justify-center h-full text-soft text-sm">
          <div className="text-center space-y-2">
            <p className="text-lg tracking-widest text-matcha-dim">六爻</p>
            <p className="text-xs">输入问题，开始解卦</p>
          </div>
        </div>
      )}
      {paired.map((msg: any) => (<ChatMessage key={msg.id} message={msg} userQuestion={msg._userQuestion} />))}
      {isLoading && (
        <div className="flex justify-start mb-4">
          <div className="bg-warm border border-line rounded px-4 py-3 text-sm text-soft">推演中&hellip;</div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}
