import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ChatMessage as ChatMessageType } from '../types'
import HexagramDisplay from './HexagramDisplay'

interface Props {
  message: ChatMessageType
}

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[85%] ${isUser ? 'order-1' : ''}`}>
        <div className={`text-xs mb-1 ${isUser ? 'text-right text-amber-500' : 'text-left text-gray-500'}`}>
          {isUser ? '你' : '🔮 卦师'}
        </div>

        <div
          className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'bg-amber-600/20 border border-amber-600/30 text-gray-200'
              : 'bg-gray-800 border border-gray-700 text-gray-300 markdown-body'
          }`}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          )}

          {message.hexagram && (
            <div className="mt-3">
              <HexagramDisplay data={message.hexagram} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
