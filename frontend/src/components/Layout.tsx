import { useState, useEffect, useRef } from 'react'
import { useChatStore } from '../stores/useChatStore'
import { chatRequest } from '../hooks/useApi'
import ModeSwitch from './ModeSwitch'
import HexagramEditor from './HexagramEditor'
import TextInput from './TextInput'
import ChatWindow from './ChatWindow'
import ThinkingChain from './ThinkingChain'
import HistoryPanel from './HistoryPanel'

export default function Layout() {
  const mode = useChatStore((s) => s.mode)
  const isLoading = useChatStore((s) => s.isLoading)
  const messages = useChatStore((s) => s.messages)
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

  useEffect(() => {
    localStorage.setItem('hexa_session', sessionId)
  }, [sessionId])

  const handleSubmit = async () => {
    const question = inputText.trim()
    if (!question || isLoading) return
    setInputText('')

    addMessage({
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: Date.now(),
    })
    setLoading(true)
    setThinkingChain([])

    try {
      let hexagramData: ReturnType<typeof buildHexagramData> | undefined
      let effectiveMessage = question

      if (mode === 'manual') {
        hexagramData = buildHexagramData(question)
        effectiveMessage = `【手动排盘模式】用户已提供卦象数据，请跳过排盘直接解读。问题：${question}`
      } else if (mode === 'text') {
        effectiveMessage = `【文本输入模式】用户已提供完整卦象文本，请跳过排盘直接解读：\n\n${textInput}\n\n问题：${question}`
      }

      const response = await chatRequest(effectiveMessage, mode, hexagramData, sessionId)
      const displayHexagram = response.hexagram || hexagramData || null

      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer,
        hexagram: displayHexagram,
        thinkingChain: response.thinking_chain,
        timestamp: Date.now(),
      })
      setThinkingChain(response.thinking_chain)
      setRefreshKey((k) => k + 1)
    } catch (err) {
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `请求失败: ${err instanceof Error ? err.message : '未知错误'}`,
        timestamp: Date.now(),
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleNewSession = () => {
    const newId = Math.random().toString(36).slice(2, 14)
    setSessionId(newId)
    clearMessages()
    setShowHistory(false)
  }

  const handleSelectSession = async (id: string) => {
    setSessionId(id)
    setShowHistory(false)
    clearMessages()
    setLoading(true)
    try {
      const res = await fetch(`/api/sessions/${id}`)
      const s = await res.json()
      if (s.messages) {
        for (const m of s.messages as Array<{role: string; content: string}>) {
          addMessage({
            id: Math.random().toString(36).slice(2),
            role: m.role as 'user' | 'assistant',
            content: m.content,
            timestamp: Date.now(),
          })
        }
      }
    } catch { /* ignore */ }
    setLoading(false)
  }

  const handleDeleteSession = (id: string) => {
    if (id === sessionId) handleNewSession()
  }

  // ── Mobile: input panel toggle ──
  const [showInput, setShowInput] = useState(false)

  return (
    <div className="h-screen flex flex-col bg-[#0f0f1a]">
      {/* 顶部标题栏 */}
      <header className="flex items-center justify-between px-3 py-2.5 md:py-3 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-gray-400 hover:text-amber-400 transition-colors p-1"
            title="会话记录"
          >
            ☰
          </button>
          <h1 className="text-base md:text-lg font-bold text-amber-400">🔮 HexaAgent</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowThinking(!showThinking)}
            className="text-xs text-gray-500 hover:text-amber-400 transition-colors md:hidden"
          >
            🧠
          </button>
          <button
            onClick={() => setShowInput(!showInput)}
            className="text-xs text-gray-500 hover:text-amber-400 transition-colors md:hidden"
          >
            ✎
          </button>
          <span className="text-[10px] md:text-xs text-gray-600 hidden sm:block">六爻解卦智能体</span>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* 历史面板：桌面侧栏 / 移动浮层，统一由 ☰ 控制 */}
        {showHistory && (
          <>
            <div className="fixed inset-0 z-20 md:hidden bg-black/50" onClick={() => setShowHistory(false)} />
            <aside className="fixed md:relative left-0 top-0 bottom-0 z-30 w-64 md:w-56 border-r border-gray-800 bg-[#0f0f1a] flex-shrink-0 flex flex-col">
              <HistoryPanel
                currentId={sessionId}
                onSelect={handleSelectSession}
                onNew={handleNewSession}
                onDelete={handleDeleteSession}
                onClose={() => setShowHistory(false)}
                refreshKey={refreshKey}
              />
            </aside>
          </>
        )}

        {/* 左侧输入面板 (hidden on mobile unless toggled) */}
        <aside className={`${showInput ? 'flex' : 'hidden'} md:flex w-full md:w-[25rem] border-r border-gray-800 flex-shrink-0 flex-col`}>
          <div className="p-3 border-b border-gray-800">
            <ModeSwitch />
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {mode === 'manual' && <HexagramEditor />}
            {mode === 'text' && <TextInput />}
            {mode === 'auto' && (
              <p className="text-gray-500 text-xs text-center mt-8 px-4">
                输入你的问题和时间，Agent 将自动排盘并解卦。
              </p>
            )}
          </div>
          {/* 桌面端底部输入 */}
          <div className="hidden md:block p-3 border-t border-gray-800">
            <div className="flex gap-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入你的问题..."
                disabled={isLoading}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-600 disabled:opacity-50"
              />
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-amber-600 hover:bg-amber-500 disabled:bg-gray-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              >
                发送
              </button>
            </div>
          </div>
        </aside>

        {/* 中间聊天区 */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          <ChatWindow />
          {/* 移动端底部输入 */}
          <div className="md:hidden p-2 border-t border-gray-800">
            <div className="flex gap-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
                placeholder="输入问题..."
                disabled={isLoading}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-600 disabled:opacity-50"
              />
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-amber-600 hover:bg-amber-500 disabled:bg-gray-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              >
                发送
              </button>
            </div>
          </div>
        </main>

        {/* 思维链侧栏 (drawer on mobile) */}
        <aside className={`${showThinking ? 'flex' : 'hidden'} md:flex w-64 border-l border-gray-800 flex-shrink-0 bg-[#0f0f1a] flex-col`}>
          <ThinkingChain />
        </aside>
      </div>
    </div>
  )
}
