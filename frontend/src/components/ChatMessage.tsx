import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ChatMessage as ChatMessageType } from '../types'
import HexagramDisplay from './HexagramDisplay'

export default function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === 'user'
  const [collected, setCollected] = useState(false)

  const handleCollect = async () => {
    let content = ''
    if (message.hexagram) {
      const h = message.hexagram
      const sizhu = h.sizhu ? `${h.sizhu.year}年${h.sizhu.month}月${h.sizhu.day}日${h.sizhu.hour}时` : ''
      const changing = h.changed_to ? ` 之 ${h.changed_to}` : ''
      content += `【用户案例】${h.hexagram_name}${changing}`
      if (sizhu) content += ` 四柱：${sizhu}`
      content += '\n'
    }
    content += message.content
    await fetch('/api/knowledge', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, source: '用户收录' }),
    })
    setCollected(true)
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[85%] ${isUser ? 'order-1' : ''}`}>
        <div className={`text-[11px] mb-1 tracking-wide ${isUser ? 'text-right text-matcha-dim' : 'text-left text-soft'}`}>
          {isUser ? '问' : '断'}
        </div>
        <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${isUser ? 'bg-matcha/10 border border-matcha/20 text-ink' : 'bg-warm border border-line text-ink'}`}>
          {isUser ? <div className="whitespace-pre-wrap">{message.content}</div> : <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>}
          {message.hexagram && <div className="mt-3"><HexagramDisplay data={message.hexagram} /></div>}
        </div>
        {!isUser && message.content && (
          <button
            onClick={handleCollect}
            disabled={collected}
            className={`mt-1 text-[10px] transition-colors ${collected ? 'text-matcha-dim/50' : 'text-soft hover:text-matcha'}`}
          >
            {collected ? '已收录' : '收录到知识库'}
          </button>
        )}
      </div>
    </div>
  )
}
