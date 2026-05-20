import { useChatStore } from '../stores/useChatStore'
import { HEXAGRAM_NAMES, getHexagramYao } from '../utils/hexagrams'
import SearchableSelect from './SearchableSelect'
import YaoLineRow from './YaoLineRow'

export default function HexagramEditor() {
  const lines = useChatStore((s) => s.lines)
  const changedLines = useChatStore((s) => s.changedLines)
  const updateYaoLine = useChatStore((s) => s.updateYaoLine)
  const updateChangedLine = useChatStore((s) => s.updateChangedLine)
  const resetLines = useChatStore((s) => s.resetLines)
  const sizhuYear = useChatStore((s) => s.sizhuYear)
  const sizhuMonth = useChatStore((s) => s.sizhuMonth)
  const sizhuDay = useChatStore((s) => s.sizhuDay)
  const sizhuHour = useChatStore((s) => s.sizhuHour)
  const kongWang = useChatStore((s) => s.kongWang)
  const beizhu = useChatStore((s) => s.beizhu)
  const setSizhu = useChatStore((s) => s.setSizhu)
  const setKongWang = useChatStore((s) => s.setKongWang)
  const setBeizhu = useChatStore((s) => s.setBeizhu)

  const hasChanging = lines.some((l) => l.changing)
  const orderedLines = [...lines].reverse()
  const orderedChanged = [...changedLines].reverse()

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

  const handleAutoFillSizhu = async () => {
    try {
      const res = await fetch('/api/sizhu')
      const d = await res.json()
      setSizhu('year', d.year)
      setSizhu('month', d.month)
      setSizhu('day', d.day)
      setSizhu('hour', d.hour)
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-3">
      {/* 卦名快捷选择 */}
      <div className="flex gap-1.5">
        <SearchableSelect
          options={HEXAGRAM_NAMES}
          placeholder="搜索卦名快捷填充..."
          onSelect={handlePreset}
        />
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

      {/* 本卦表 */}
      <div className="bg-gray-900/50 rounded-lg px-2 py-1">
        <div className="text-[10px] text-amber-500/60 mb-1 px-7">— 本卦 —</div>
        {orderedLines.map((line) => (
          <YaoLineRow
            key={line.position}
            line={line}
            onChange={(field) => updateYaoLine(line.position, field)}
          />
        ))}
      </div>

      {/* 变卦表（有动爻时显示，可独立编辑六亲/地支，六神继承） */}
      {hasChanging && (
        <div className="bg-gray-900/50 rounded-lg px-2 py-1 border border-red-500/20">
          <div className="text-[10px] text-red-400/70 mb-1 px-7">— 变卦（六神继承本卦，六亲/地支请手动填写） —</div>
          {orderedChanged.map((line) => (
            <YaoLineRow
              key={line.position}
              line={line}
              onChange={(field) => updateChangedLine(line.position, field)}
              isChanged={true}
            />
          ))}
        </div>
      )}

      {/* 干支（四柱）+ 自动填充 */}
      <div className="space-y-2 text-xs">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-gray-500">干支（四柱）</label>
            <button
              onClick={handleAutoFillSizhu}
              className="text-[10px] text-amber-500 hover:text-amber-400 transition-colors"
            >
              ⏱ 自动填充
            </button>
          </div>
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
        <div>
          <label className="text-gray-500 block mb-1">备注</label>
          <textarea
            value={beizhu}
            onChange={(e) => setBeizhu(e.target.value)}
            placeholder="任何需要补充的信息，如伏神说明、特殊状态等"
            className="w-full h-16 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-gray-300 text-xs resize-none"
          />
        </div>
      </div>
    </div>
  )
}
