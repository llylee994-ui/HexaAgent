import { useChatStore } from '../stores/useChatStore'
import { HEXAGRAM_NAMES, getHexagramYao, DIZHI_OPTIONS } from '../utils/hexagrams'
import YaoLineRow from './YaoLineRow'

export default function HexagramEditor() {
  const lines = useChatStore((s) => s.lines)
  const updateYaoLine = useChatStore((s) => s.updateYaoLine)
  const resetLines = useChatStore((s) => s.resetLines)
  const sizhuYear = useChatStore((s) => s.sizhuYear)
  const sizhuMonth = useChatStore((s) => s.sizhuMonth)
  const sizhuDay = useChatStore((s) => s.sizhuDay)
  const sizhuHour = useChatStore((s) => s.sizhuHour)
  const kongWang = useChatStore((s) => s.kongWang)
  const setSizhu = useChatStore((s) => s.setSizhu)
  const setKongWang = useChatStore((s) => s.setKongWang)

  const handlePreset = (name: string) => {
    if (!name) return
    const yao = getHexagramYao(name)
    if (yao.length === 0) return
    yao.forEach((type, i) => {
      updateYaoLine(i + 1, { type, changing: false, liuqin: '', zhi: '', shi_ying: null })
    })
  }

  const handleRandom = () => {
    for (let pos = 1; pos <= 6; pos++) {
      const type = Math.random() < 0.5 ? 'yang' : 'yin'
      const changing = Math.random() < 0.25
      updateYaoLine(pos, { type, changing, liuqin: '', zhi: '', shi_ying: null })
    }
  }

  // 从初爻到上爻: [1,2,3,4,5,6]
  // 显示从上爻到初爻: [6,5,4,3,2,1]
  const orderedLines = [...lines].reverse()
  // 上爻→初爻

  return (
    <div className="space-y-3">
      {/* 卦名快捷选择 */}
      <div className="flex gap-1.5">
        <select
          onChange={(e) => handlePreset(e.target.value)}
          className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-gray-300"
          defaultValue=""
        >
          <option value="" disabled>选择卦名快捷填充...</option>
          {HEXAGRAM_NAMES.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <button
          onClick={handleRandom}
          className="px-2.5 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
        >
          随机
        </button>
        <button
          onClick={resetLines}
          className="px-2.5 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-400 rounded transition-colors"
        >
          重置
        </button>
      </div>

      {/* 表头 */}
      <div className="flex items-center gap-1.5 px-1 text-[10px] text-gray-600">
        <span className="w-7 text-center">爻</span>
        <span className="w-10 text-center">六神</span>
        <span className="w-12 text-center">阴阳</span>
        <span className="w-8 text-center">动</span>
        <span className="w-14 text-center">六亲</span>
        <span className="w-12 text-center">地支</span>
        <span className="w-12 text-center">世应</span>
      </div>

      {/* 六爻编辑器（上→下 = 上爻→初爻） */}
      <div className="bg-gray-900/50 rounded-lg px-2 py-1">
        {orderedLines.map((line) => (
          <YaoLineRow
            key={line.position}
            line={line}
            onChange={(field) => updateYaoLine(line.position, field)}
            isAutoMode={false}
          />
        ))}
      </div>

      {/* 干支（四柱）+ 空亡 */}
      <div className="space-y-2 text-xs">
        <div>
          <label className="text-gray-500 block mb-1">干支（四柱）</label>
          <div className="grid grid-cols-4 gap-1.5">
            <input
              value={sizhuYear}
              onChange={(e) => setSizhu('year', e.target.value)}
              placeholder="年 如丙午"
              className="bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-gray-300 text-xs"
            />
            <input
              value={sizhuMonth}
              onChange={(e) => setSizhu('month', e.target.value)}
              placeholder="月 如癸巳"
              className="bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-gray-300 text-xs"
            />
            <input
              value={sizhuDay}
              onChange={(e) => setSizhu('day', e.target.value)}
              placeholder="日 如癸卯"
              className="bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-gray-300 text-xs"
            />
            <input
              value={sizhuHour}
              onChange={(e) => setSizhu('hour', e.target.value)}
              placeholder="时 如己未"
              className="bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-gray-300 text-xs"
            />
          </div>
        </div>
        <div>
          <label className="text-gray-500 block mb-1">空亡</label>
          <input
            value={kongWang}
            onChange={(e) => setKongWang(e.target.value)}
            placeholder="如 辰,巳（用逗号分隔）"
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-gray-300 text-xs"
          />
        </div>
      </div>
    </div>
  )
}
