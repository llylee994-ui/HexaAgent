import { useEffect, useState } from 'react'

interface Session {
  id: string
  title: string
  message_count: number
  updated_at: string
}

interface Props {
  currentId: string
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
  onClose?: () => void
  refreshKey?: number
}

export default function HistoryPanel({ currentId, onSelect, onNew, onDelete, onClose, refreshKey }: Props) {
  const [sessions, setSessions] = useState<Session[]>([])

  const loadSessions = async () => {
    try {
      const res = await fetch('/api/sessions')
      setSessions(await res.json())
    } catch { /* ignore */ }
  }

  useEffect(() => { loadSessions() }, [currentId, refreshKey])

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await fetch(`/api/sessions/${id}`, { method: 'DELETE' })
    onDelete(id)
    loadSessions()
  }

  const handleNew = async () => {
    try {
      const res = await fetch('/api/sessions', { method: 'POST' })
      const { id } = await res.json()
      onNew()
      loadSessions()
    } catch { /* ignore */ }
  }

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso)
      return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
    } catch { return '' }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-3 border-b border-gray-800">
        <span className="text-xs text-gray-400 font-medium">会话记录</span>
        <div className="flex gap-1">
          <button onClick={handleNew} className="text-xs text-amber-500 hover:text-amber-400 p-1" title="新建会话">
            +
          </button>
          {onClose && (
            <button onClick={onClose} className="text-xs text-gray-600 hover:text-gray-400 p-1 md:hidden">✕</button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {sessions.map((s) => (
          <div
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`flex items-center justify-between px-3 py-2.5 border-b border-gray-800/50 cursor-pointer transition-colors text-xs
              ${s.id === currentId ? 'bg-amber-600/10 border-l-2 border-l-amber-500' : 'hover:bg-gray-800/50 border-l-2 border-l-transparent'}`}
          >
            <div className="flex-1 min-w-0 mr-2">
              <div className="text-gray-300 truncate">{s.title || '新会话'}</div>
              <div className="text-[10px] text-gray-600 mt-0.5">
                {s.message_count} 条消息 · {formatTime(s.updated_at)}
              </div>
            </div>
            <button
              onClick={(e) => handleDelete(s.id, e)}
              className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0 text-sm"
              title="删除"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
