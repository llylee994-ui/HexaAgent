import { useChatStore } from '../stores/useChatStore'

const MODES = [
  { key: 'auto' as const, label: '🎯 自动排盘', desc: '输入时间+问题，自动起卦' },
  { key: 'manual' as const, label: '🖱️ 手动编辑', desc: '逐爻填写卦象' },
  { key: 'text' as const, label: '📝 文本输入', desc: '粘贴结构化卦象文本' },
]

export default function ModeSwitch() {
  const mode = useChatStore((s) => s.mode)
  const setMode = useChatStore((s) => s.setMode)

  return (
    <div className="flex gap-1 bg-gray-900 rounded-lg p-1">
      {MODES.map((m) => (
        <button
          key={m.key}
          onClick={() => setMode(m.key)}
          className={`flex-1 px-3 py-2 rounded-md text-xs transition-colors text-center ${
            mode === m.key
              ? 'bg-amber-600 text-white'
              : 'text-gray-400 hover:text-gray-200'
          }`}
          title={m.desc}
        >
          {m.label}
        </button>
      ))}
    </div>
  )
}
