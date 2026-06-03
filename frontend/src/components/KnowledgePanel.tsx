import { useState, useEffect } from 'react'
import { useChatStore } from '../stores/useChatStore'

interface Chunk { id: number; content: string; source: string; keywords: string }

export default function KnowledgePanel({ onClose }: { onClose: () => void }) {
  const [items, setItems] = useState<Chunk[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editSource, setEditSource] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newContent, setNewContent] = useState('')
  const [newSource, setNewSource] = useState('用户')
  const [page, setPage] = useState(0)
  const [reindexing, setReindexing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [showImport, setShowImport] = useState(false)

  const messages = useChatStore((s) => s.messages)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const load = async () => {
    try {
      const r = await fetch(`/api/knowledge?search=${encodeURIComponent(search)}&offset=${page * 50}&limit=50`)
      const d = await r.json()
      setItems(d.items || [])
      setTotal(d.total || 0)
    } catch {}
  }

  useEffect(() => { load() }, [search, page])

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除此条目？')) return
    await fetch(`/api/knowledge/${id}`, { method: 'DELETE' })
    load()
  }

  const handleSave = async () => {
    if (editId !== null) {
      await fetch(`/api/knowledge/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: editContent, source: editSource }) })
      setEditId(null)
    }
    load()
  }

  const handleAdd = async () => {
    if (!newContent.trim()) return
    await fetch('/api/knowledge', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: newContent, source: newSource }) })
    setNewContent(''); setShowAdd(false)
    load()
  }

  const handleReindex = async () => {
    setReindexing(true)
    await fetch('/api/knowledge/reindex', { method: 'POST' })
    setReindexing(false)
    alert('重建索引完成')
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }

  const handleImport = async () => {
    if (selectedIds.size === 0 || importing) return
    setImporting(true)
    const selected = messages.filter(m => selectedIds.has(m.id))
    const parts: string[] = []
    parts.push('【用户收录 · 对话合并】')
    for (const m of selected) {
      const roleTag = m.role === 'user' ? '【问】' : '【断】'
      parts.push(`${roleTag} ${m.content}`)
      if (m.hexagram) {
        const h = m.hexagram
        const sizhu = h.sizhu ? `${h.sizhu.year}年${h.sizhu.month}月${h.sizhu.day}日${h.sizhu.hour}时` : ''
        const changing = h.changed_to ? ` 之 ${h.changed_to}` : ''
        parts.push(`【卦象：${h.hexagram_name}${changing}${sizhu ? ' ' + sizhu : ''}】`)
      }
    }
    const content = parts.join('\n\n')
    await fetch('/api/knowledge', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content, source: '用户导入' }) })
    setSelectedIds(new Set())
    setShowImport(false)
    setImporting(false)
    load()
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-line">
        <span className="text-xs text-soft tracking-wide">知识库管理 ({total} 条)</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowAdd(!showAdd)} className="text-xs text-matcha hover:text-matcha-dim transition-colors">+ 新增</button>
          <button onClick={() => setShowImport(true)} className="text-xs text-matcha hover:text-matcha-dim transition-colors">从对话导入</button>
          <button onClick={handleReindex} disabled={reindexing} className="text-xs text-soft hover:text-matcha transition-colors">{reindexing ? '索引中...' : '重建索引'}</button>
          <button onClick={onClose} className="text-sm text-soft hover:text-ink transition-colors px-1">&times;</button>
        </div>
      </div>

      <div className="px-3 py-2">
        <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }} placeholder="搜索知识库..." className="w-full bg-cream border border-line rounded px-2 py-1.5 text-xs text-ink placeholder-soft focus:outline-none focus:border-matcha-dim" />
      </div>

      {/* 导入对话弹窗 */}
      {showImport && (
        <div className="mx-3 mb-2 p-3 bg-matcha/5 border border-matcha/20 rounded space-y-3 max-h-[60vh] flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-xs text-soft">勾选要收录的对话</span>
            <button onClick={() => { setShowImport(false); setSelectedIds(new Set()) }} className="text-xs text-soft hover:text-ink">&times;</button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1">
            {messages.length === 0 && <p className="text-xs text-soft text-center py-4">暂无对话记录</p>}
            {messages.map((m) => {
              const isSel = selectedIds.has(m.id)
              return (
                <label key={m.id} className={`flex items-start gap-2 p-2 rounded text-xs cursor-pointer transition-colors ${isSel ? 'bg-matcha/10 border border-matcha/30' : 'bg-cream border border-line/30 hover:bg-warm'}`}>
                  <input type="checkbox" checked={isSel} onChange={() => toggleSelect(m.id)} className="mt-0.5 accent-matcha" />
                  <div className="flex-1 min-w-0">
                    <span className={`text-[10px] mr-1 ${m.role === 'user' ? 'text-matcha-dim' : 'text-soft'}`}>{m.role === 'user' ? '问' : '断'}</span>
                    <span className="text-ink line-clamp-2">{m.content.slice(0, 150)}</span>
                    {m.hexagram && <span className="text-[10px] text-matcha-dim/70 ml-1">[卦象]</span>}
                  </div>
                </label>
              )
            })}
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-line/50">
            <span className="text-[10px] text-soft">已选 {selectedIds.size} 条</span>
            <button onClick={handleImport} disabled={selectedIds.size === 0 || importing} className="bg-matcha disabled:bg-line text-ink rounded px-3 py-1 text-xs font-medium transition-colors">{importing ? '导入中...' : '合并导入'}</button>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="mx-3 mb-2 p-3 bg-matcha/5 border border-matcha/20 rounded space-y-2">
          <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="内容..." rows={3} className="w-full bg-cream border border-line rounded px-2 py-1.5 text-xs text-ink resize-none" />
          <div className="flex gap-2">
            <input value={newSource} onChange={(e) => setNewSource(e.target.value)} placeholder="来源" className="flex-1 bg-cream border border-line rounded px-2 py-1.5 text-xs text-ink" />
            <button onClick={handleAdd} className="bg-matcha text-ink rounded px-3 py-1.5 text-xs font-medium">添加</button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-3 space-y-1.5">
        {items.map((item) => (
          <div key={item.id} className="bg-cream border border-line/50 rounded p-2.5 text-xs">
            {editId === item.id ? (
              <div className="space-y-2">
                <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={12} className="w-full bg-warm border border-line rounded px-2 py-1.5 text-ink resize-none" />
                <input value={editSource} onChange={(e) => setEditSource(e.target.value)} className="w-full bg-warm border border-line rounded px-2 py-1.5 text-ink" />
                <div className="flex gap-2">
                  <button onClick={handleSave} className="text-matcha">保存</button>
                  <button onClick={() => setEditId(null)} className="text-soft">取消</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <span className="text-[10px] text-matcha-dim mr-2">{item.source}</span>
                    <span className="text-ink leading-relaxed line-clamp-3">{item.content}</span>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => { setEditId(item.id); setEditContent(item.content); setEditSource(item.source) }} className="text-soft hover:text-matcha text-[10px]">编辑</button>
                    <button onClick={() => handleDelete(item.id)} className="text-soft hover:text-rust text-[10px]">删除</button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {total > 50 && (
        <div className="flex items-center justify-center gap-3 py-2 border-t border-line text-xs text-soft">
          <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="disabled:opacity-30">上一页</button>
          <span>{page + 1} / {Math.ceil(total / 50)}</span>
          <button onClick={() => setPage(page + 1)} disabled={(page + 1) * 50 >= total} className="disabled:opacity-30">下一页</button>
        </div>
      )}
    </div>
  )
}
