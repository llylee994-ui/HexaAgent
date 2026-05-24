import { useEffect, useState } from 'react'

interface Session { id: string; title: string; message_count: number; updated_at: string }
interface Props { currentId: string; onSelect: (id: string) => void; onNew: (bid?: string) => void; onDelete: (id: string) => void; onClose?: () => void; refreshKey?: number }

export default function HistoryPanel({ currentId, onSelect, onNew, onDelete, onClose, refreshKey }: Props) {
  const [sessions, setSessions] = useState<Session[]>([])
  const load = async () => { try { const r = await fetch('/api/sessions'); setSessions(await r.json()) } catch {} }
  useEffect(() => { load() }, [currentId, refreshKey])

  const handleDelete = async (id: string, e: React.MouseEvent) => { e.stopPropagation(); await fetch(`/api/sessions/${id}`, { method: 'DELETE' }); onDelete(id); load() }

  const handleNew = async () => { try { const r = await fetch('/api/sessions', { method: 'POST' }); const { id } = await r.json(); onNew(id); load() } catch {} }

  const fmt = (iso: string) => { try { const d = new Date(iso); return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}` } catch { return '' } }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-3 border-b border-line">
        <span className="text-xs text-warmgray tracking-wide">会话记录</span>
        <div className="flex gap-1">
          <button onClick={handleNew} className="text-sm text-gold-dim hover:text-gold p-1">+</button>
          {onClose && <button onClick={onClose} className="text-xs text-warmgray hover:text-cream p-1 md:hidden">x</button>}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {sessions.map((s) => (
          <div key={s.id} onClick={() => onSelect(s.id)}
            className={`flex items-center justify-between px-3 py-2.5 border-b border-line/50 cursor-pointer transition-colors text-xs ${s.id === currentId ? 'bg-gold/5 border-l-2 border-l-gold-dim' : 'hover:bg-paper border-l-2 border-l-transparent'}`}>
            <div className="flex-1 min-w-0 mr-2">
              <div className="text-cream truncate">{s.title || '新会话'}</div>
              <div className="text-[10px] text-warmgray mt-0.5">{s.message_count} 条消息 · {fmt(s.updated_at)}</div>
            </div>
            <button onClick={(e) => handleDelete(s.id, e)} className="text-warmgray hover:text-rust transition-colors flex-shrink-0 text-sm">x</button>
          </div>
        ))}
      </div>
    </div>
  )
}
