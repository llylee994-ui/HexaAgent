import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ChatMessage as ChatMessageType } from '../types'
import HexagramDisplay from './HexagramDisplay'

export default function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[85%] ${isUser ? 'order-1' : ''}`}>
        <div className={`text-[11px] mb-1 tracking-wide ${isUser ? 'text-right text-gold-dim' : 'text-left text-warmgray'}`}>
          {isUser ? '问' : '断'}
        </div>
        <div className={`rounded px-4 py-3 text-sm leading-relaxed ${isUser ? 'bg-gold/10 border border-gold/20 text-cream' : 'bg-paper border border-line text-cream'}`}>
          {isUser ? <div className="whitespace-pre-wrap">{message.content}</div> : <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>}
          {message.hexagram && <div className="mt-3"><HexagramDisplay data={message.hexagram} /></div>}
        </div>
      </div>
    </div>
  )
}
