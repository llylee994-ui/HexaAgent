import { useState, useEffect } from 'react'
import { useChatStore } from '../stores/useChatStore'
import { chatRequest } from '../hooks/useApi'
import ModeSwitch from './ModeSwitch'
import HexagramEditor from './HexagramEditor'
import TextInput from './TextInput'
import ChatWindow from './ChatWindow'
import ThinkingChain from './ThinkingChain'
import HistoryPanel from './HistoryPanel'
import SetupPage from './SetupPage'

export default function Layout() {
  const mode = useChatStore((s) => s.mode)
  const isLoading = useChatStore((s) => s.isLoading)
  const addMessage = useChatStore((s) => s.addMessage)
  const clearMessages = useChatStore((s) => s.clearMessages)
  const setLoading = useChatStore((s) => s.setLoading)
  const setThinkingChain = useChatStore((s) => s.setThinkingChain)
  const buildHexagramData = useChatStore((s) => s.buildHexagramData)
  const textInput = useChatStore((s) => s.textInput)

  const [sessionId, setSessionId] = useState(() => localStorage.getItem('hexa_session') || 'default')
  const [showHistory, setShowHistory] = useState(true)
  const [showThinking, setShowThinking] = useState(false)
  const [inputText, setInputText] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [configured, setConfigured] = useState<boolean | null>(null)
  const [showInput, setShowInput] = useState(false)

  useEffect(() => { localStorage.setItem('hexa_session', sessionId) }, [sessionId])
  useEffect(() => { fetch('/api/config/status').then(r => r.json()).then(d => setConfigured(d.configured)).catch(() => {}) }, [])

  const handleSubmit = async () => {
    const question = inputText.trim()
    if (!question || isLoading) return
    setInputText('')

    addMessage({ id: Date.now().toString(), role: 'user', content: question, timestamp: Date.now() })
    setLoading(true)
    setThinkingChain([])

    try {
      let hexagramData: ReturnType<typeof buildHexagramData> | undefined
      let effectiveMessage = question
      if (mode === 'manual') { hexagramData = buildHexagramData(question); effectiveMessage = `【手动排盘模式】用户已提供卦象数据，请跳过排盘直接解读。问题：${question}` }
      else if (mode === 'text') { effectiveMessage = `【文本输入模式】用户已提供完整卦象文本，请跳过排盘直接解读：\n\n${textInput}\n\n问题：${question}` }

      const response = await chatRequest(effectiveMessage, mode, hexagramData, sessionId)
      addMessage({ id: (Date.now() + 1).toString(), role: 'assistant', content: response.answer, hexagram: response.hexagram || hexagramData || null, thinkingChain: response.thinking_chain, timestamp: Date.now() })
      setThinkingChain(response.thinking_chain)
      setRefreshKey((k) => k + 1)
    } catch (err) {
      addMessage({ id: (Date.now() + 1).toString(), role: 'assistant', content: `请求失败: ${err instanceof Error ? err.message : '未知错误'}`, timestamp: Date.now() })
    } finally { setLoading(false) }
  }

  const handleNewSession = (backendId?: string) => {
    setSessionId(backendId || Math.random().toString(36).slice(2, 14))
    clearMessages()
    setShowHistory(false)
  }

  const handleSelectSession = async (id: string) => {
    setSessionId(id); setShowHistory(false); clearMessages(); setLoading(true)
    try {
      const res = await fetch(`/api/sessions/${id}`); const s = await res.json()
      if (s.messages) for (const m of s.messages as Array<{role: string; content: string}>) addMessage({ id: Math.random().toString(36).slice(2), role: m.role as 'user' | 'assistant', content: m.content, timestamp: Date.now() })
    } catch {}
    setLoading(false)
  }

  if (configured === false) return <SetupPage onDone={() => setConfigured(true)} />

  return (
    <div className="h-screen flex flex-col bg-cream">
      <header className="flex items-center justify-between px-3 py-2.5 border-b border-line flex-shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={() => setShowHistory(!showHistory)} className="text-soft hover:text-matcha transition-colors p-1">&#9776;</button>
          <h1 className="text-base md:text-lg font-bold text-matcha tracking-wider">HexaAgent</h1>
          <span className="hidden sm:inline text-[11px] text-soft tracking-wide">六爻解卦</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowThinking(!showThinking)} className="md:hidden text-xs text-soft hover:text-matcha transition-colors">思维链</button>
          <button onClick={() => setShowInput(!showInput)} className="md:hidden text-xs text-soft hover:text-matcha transition-colors">排盘</button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {showHistory && (
          <>
            <div className="fixed inset-0 z-20 md:hidden bg-cream/80" onClick={() => setShowHistory(false)} />
            <aside className="fixed md:relative left-0 top-0 bottom-0 z-30 w-64 md:w-56 border-r border-line bg-cream flex-shrink-0 flex flex-col">
              <HistoryPanel currentId={sessionId} onSelect={handleSelectSession} onNew={handleNewSession} onDelete={(id) => { if (id === sessionId) handleNewSession() }} onClose={() => setShowHistory(false)} refreshKey={refreshKey} />
            </aside>
          </>
        )}

        <aside className={`${showInput ? 'flex' : 'hidden'} md:flex w-full md:w-[25rem] border-r border-line flex-shrink-0 flex-col`}>
          <div className="p-3 border-b border-line flex items-center justify-between">
            <ModeSwitch />
            <button onClick={() => setShowInput(false)} className="md:hidden text-xs text-matcha-dim hover:text-matcha">返回</button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {mode === 'manual' && <HexagramEditor />}
            {mode === 'text' && <TextInput />}
            {mode === 'auto' && <p className="text-soft text-xs text-center mt-8 px-4">输入你的问题与时间，自动排盘解卦</p>}
          </div>
          <div className="p-3 border-t border-line">
            <div className="flex gap-1">
              <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() } }} placeholder="输入问题..." disabled={isLoading}
                className="flex-1 bg-cream border border-line rounded px-3 py-2 text-sm text-ink placeholder-soft focus:outline-none focus:border-matcha-dim disabled:opacity-50" />
              <button onClick={handleSubmit} disabled={isLoading} className="bg-matcha hover:bg-matcha-dim disabled:bg-line text-ink rounded px-4 py-2 text-sm font-medium transition-colors">发送</button>
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          <ChatWindow />
          <div className="md:hidden p-2 border-t border-line">
            <div className="flex gap-1">
              <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() } }} placeholder="输入问题..." disabled={isLoading}
                className="flex-1 bg-cream border border-line rounded px-3 py-2 text-sm text-ink placeholder-soft focus:outline-none focus:border-matcha-dim disabled:opacity-50" />
              <button onClick={handleSubmit} disabled={isLoading} className="bg-matcha hover:bg-matcha-dim disabled:bg-line text-ink rounded px-4 py-2 text-sm font-medium transition-colors">发送</button>
            </div>
          </div>
        </main>

        <aside className={`${showThinking ? 'flex' : 'hidden'} md:flex w-64 border-l border-line flex-shrink-0 bg-cream flex-col`}>
          <ThinkingChain />
        </aside>
      </div>
    </div>
  )
}
