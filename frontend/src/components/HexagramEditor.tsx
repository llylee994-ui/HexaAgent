import { useChatStore } from '../stores/useChatStore'
import { HEXAGRAM_NAMES, getHexagramYao } from '../utils/hexagrams'
import YaoLineRow from './YaoLineRow'

export default function HexagramEditor() {
  const lines = useChatStore((s) => s.lines)
  const updateYaoLine = useChatStore((s) => s.updateYaoLine)
  const resetLines = useChatStore((s) => s.resetLines)
  const yueJian = useChatStore((s) => s.yueJian)
  const riChen = useChatStore((s) => s.riChen)
  const xunKong = useChatStore((s) => s.xunKong)
  const setYueJian = useChatStore((s) => s.setYueJian)
  const setRiChen = useChatStore((s) => s.setRiChen)
  const setXunKong = useChatStore((s) => s.setXunKong)

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

  return (
    <div className="space-y-3">
      {/* 卦名快捷选择 */}
      <div className="flex gap-2">
        <select
          onChange={(e) => handlePreset(e.target.value)}
          className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-gray-300"
          defaultValue=""
        >
          <option value="" disabled>选择卦名快捷填充...</option>
          {HEXAGRAM_NAMES.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <button
          onClick={handleRandom}
          className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
        >
          随机
        </button>
        <button
          onClick={resetLines}
          className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-400 rounded transition-colors"
        >
          重置
        </button>
      </div>

      {/* 六爻编辑器 */}
      <div className="bg-gray-900/50 rounded-lg p-3">
        {lines.map((line) => (
          <YaoLineRow
            key={line.position}
            line={line}
            onChange={(field) => updateYaoLine(line.position, field)}
          />
        ))}
      </div>

      {/* 时间参数 */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <label className="text-gray-500 block mb-1">月建</label>
          <input
            value={yueJian}
            onChange={(e) => setYueJian(e.target.value)}
            placeholder="如 巳"
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-300"
          />
        </div>
        <div>
          <label className="text-gray-500 block mb-1">日辰</label>
          <input
            value={riChen}
            onChange={(e) => setRiChen(e.target.value)}
            placeholder="如 卯"
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-300"
          />
        </div>
        <div>
          <label className="text-gray-500 block mb-1">旬空</label>
          <input
            value={xunKong}
            onChange={(e) => setXunKong(e.target.value)}
            placeholder="如 辰,巳"
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-300"
          />
        </div>
      </div>
    </div>
  )
}
