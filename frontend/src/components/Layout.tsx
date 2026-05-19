import { useChatStore } from '../stores/useChatStore'
import { chatRequest } from '../hooks/useApi'
import ModeSwitch from './ModeSwitch'
import HexagramEditor from './HexagramEditor'
import TextInput from './TextInput'
import ChatWindow from './ChatWindow'
import ThinkingChain from './ThinkingChain'

export default function Layout() {
  const mode = useChatStore((s) => s.mode)
  const isLoading = useChatStore((s) => s.isLoading)
  const addMessage = useChatStore((s) => s.addMessage)
  const setLoading = useChatStore((s) => s.setLoading)
  const setThinkingChain = useChatStore((s) => s.setThinkingChain)
  const buildHexagramData = useChatStore((s) => s.buildHexagramData)
  const textInput = useChatStore((s) => s.textInput)

  const handleSubmit = async (question: string) => {
    if (!question.trim() || isLoading) return

    const userMsg = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: question,
      timestamp: Date.now(),
    }
    addMessage(userMsg)
    setLoading(true)
    setThinkingChain([])

    try {
      let hexagramData = undefined
      let effectiveMessage = question

      if (mode === 'manual') {
        hexagramData = buildHexagramData(question)
        effectiveMessage = `【手动排盘模式】用户已提供卦象数据，请跳过排盘直接解读。问题：${question}`
      } else if (mode === 'text') {
        effectiveMessage = `【文本输入模式】用户已提供完整卦象文本，请跳过排盘直接解读：\n\n${textInput}\n\n问题：${question}`
      }

      const response = await chatRequest(effectiveMessage, mode, hexagramData)

      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: response.answer,
        hexagram: response.hexagram,
        thinkingChain: response.thinking_chain,
        timestamp: Date.now(),
      }
      addMessage(assistantMsg)
      setThinkingChain(response.thinking_chain)
    } catch (err) {
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: `请求失败: ${err instanceof Error ? err.message : '未知错误'}`,
        timestamp: Date.now(),
      }
      addMessage(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-[#0f0f1a]">
      {/* 顶部标题栏 */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <h1 className="text-lg font-bold text-amber-400">🔮 HexaAgent</h1>
        <span className="text-xs text-gray-600">六爻解卦智能体</span>
      </header>

      {/* 主内容区：三栏 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧面板 - 输入区 */}
        <aside className="w-80 border-r border-gray-800 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-800">
            <ModeSwitch />
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {mode === 'manual' && <HexagramEditor />}
            {mode === 'text' && <TextInput />}
            {mode === 'auto' && (
              <p className="text-gray-500 text-xs text-center mt-8 px-4">
                输入你的问题和时间，Agent 将自动排盘并解卦。
                <br /><br />
                可以直接说："我最近想换工作，能成吗？"
              </p>
            )}
          </div>
          {/* 底部输入框 */}
          <QuestionInput onSubmit={handleSubmit} isLoading={isLoading} />
        </aside>

        {/* 中间面板 - 聊天区 */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <ChatWindow />
        </main>

        {/* 右侧面板 - 思维链 */}
        <aside className="w-64 border-l border-gray-800 overflow-hidden">
          <ThinkingChain />
        </aside>
      </div>
    </div>
  )
}

function QuestionInput({ onSubmit, isLoading }: { onSubmit: (q: string) => void; isLoading: boolean }) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit((e.target as HTMLInputElement).value)
      ;(e.target as HTMLInputElement).value = ''
    }
  }

  return (
    <div className="p-3 border-t border-gray-800">
      <div className="flex gap-1">
        <input
          type="text"
          placeholder="输入你的问题..."
          disabled={isLoading}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-amber-600 disabled:opacity-50"
        />
        <button
          onClick={(e) => {
            const input = (e.target as HTMLButtonElement).previousElementSibling as HTMLInputElement
            onSubmit(input.value)
            input.value = ''
          }}
          disabled={isLoading}
          className="bg-amber-600 hover:bg-amber-500 disabled:bg-gray-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          发送
        </button>
      </div>
    </div>
  )
}
