import { useChatStore } from '../stores/useChatStore'

export default function TextInput() {
  const textInput = useChatStore((s) => s.textInput)
  const setTextInput = useChatStore((s) => s.setTextInput)

  return (
    <div>
      <textarea
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        placeholder={`粘贴结构化卦象文本，例如：

公历2026年5月19日未时。四柱：丙午 癸巳 癸卯 己未。
主卦《天风姤》之《天水讼》。初爻、四爻动。
世爻在二爻，妻财丑土持世。应爻在五爻，官鬼午火临应。
完整六爻：
初爻：父母 丑土 (动) → 妻财 寅木
...`}
        className="w-full h-48 bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-gray-300 resize-none focus:outline-none focus:border-amber-600"
      />
    </div>
  )
}
