import { useChatStore } from '../stores/useChatStore'

const MODES = [{ key: 'auto' as const, label: '自动' }, { key: 'manual' as const, label: '手动' }, { key: 'text' as const, label: '文本' }]

export default function ModeSwitch() {
  const mode = useChatStore((s) => s.mode)
  const setMode = useChatStore((s) => s.setMode)

  return (
    <div className="flex gap-0.5 bg-cream rounded border border-line p-0.5">
      {MODES.map((m) => (
        <button key={m.key} onClick={() => setMode(m.key)}
          className={`flex-1 px-3 py-1 rounded text-xs tracking-wide transition-colors ${mode === m.key ? 'bg-matcha text-ink' : 'text-soft hover:text-ink'}`}>
          {m.label}
        </button>
      ))}
    </div>
  )
}
