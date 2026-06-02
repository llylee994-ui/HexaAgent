import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ChatMessage as ChatMessageType } from '../types'
import HexagramDisplay from './HexagramDisplay'

export default function ChatMessage({ message }: { message: ChatMessageType; userQuestion?: string }) {
  const isUser = message.role === 'user'

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
      </div>
    </div>
  )
}
