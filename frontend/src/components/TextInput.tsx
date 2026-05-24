import { useChatStore } from '../stores/useChatStore'

export default function TextInput() {
  const textInput = useChatStore((s) => s.textInput)
  const setTextInput = useChatStore((s) => s.setTextInput)

  return (
    <textarea value={textInput} onChange={(e) => setTextInput(e.target.value)}
      placeholder="粘贴结构化卦象文本..." className="w-full h-48 bg-ink border border-line rounded p-3 text-sm text-cream resize-none focus:outline-none focus:border-gold-dim" />
  )
}
