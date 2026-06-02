import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ChatMessage as ChatMessageType } from '../types'
import HexagramDisplay from './HexagramDisplay'

// 用内容指纹做持久化（消息 id 在刷新后会变）
function fingerprint(content: string): string {
  let h = 0
  for (let i = 0; i < Math.min(content.length, 200); i++) h = ((h << 5) - h + content.charCodeAt(i)) | 0
  return h.toString(36)
}
function isCollected(content: string): boolean {
  try { return JSON.parse(localStorage.getItem('hexa_collected') || '[]').includes(fingerprint(content)) } catch { return false }
}
function markCollected(content: string) {
  try {
    const list = JSON.parse(localStorage.getItem('hexa_collected') || '[]')
    const fp = fingerprint(content)
    if (!list.includes(fp)) { list.push(fp); localStorage.setItem('hexa_collected', JSON.stringify(list)) }
  } catch {}
}

export default function ChatMessage({ message, userQuestion }: { message: ChatMessageType; userQuestion?: string }) {
  const isUser = message.role === 'user'
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(() => isCollected(message.content))

  const handleCollect = async () => {
    let content = ''
    if (userQuestion) content += `【问题】${userQuestion}\n`
    if (message.hexagram) {
      const h = message.hexagram
      const sizhu = h.sizhu ? `${h.sizhu.year}年${h.sizhu.month}月${h.sizhu.day}日${h.sizhu.hour}时` : ''
      const changing = h.changed_to ? ` 之 ${h.changed_to}` : ''
      content += `【卦象】${h.hexagram_name}${changing}`
      if (sizhu) content += ` 四柱：${sizhu}`
      const yaoInfo = h.yao_lines.map(l => {
        const d = l.changing ? '○' : ''
        const sy = l.shi_ying === 'shi' ? '世' : l.shi_ying === 'ying' ? '应' : ''
        return `${['','初','二','三','四','五','上'][l.position]}${l.gan}${l.zhi}${l.liuqin}${d}${sy}`
      }).join(' ')
      content += `\n【六爻】${yaoInfo}\n`
    }
    content += `\n【断语】${message.content}`

    setSaving(true)
    await fetch('/api/knowledge', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, source: '用户收录' }),
    })
    markCollected(message.content)
    setSaving(false)
    setDone(true)
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
            disabled={saving || done}
            className={`mt-1 text-[11px] transition-colors tracking-wide ${done ? 'text-matcha-dim/40' : saving ? 'text-matcha animate-pulse' : 'text-soft hover:text-matcha'}`}
          >
            {saving ? '· · ·' : done ? '已收录' : '收录到知识库'}
          </button>
        )}
      </div>
    </div>
  )
}
