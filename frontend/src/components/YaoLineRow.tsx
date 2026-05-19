import type { YaoLine } from '../types'
import { DIZHI_OPTIONS, LIUQIN_OPTIONS } from '../utils/hexagrams'

interface Props {
  line: YaoLine
  onChange: (field: Partial<YaoLine>) => void
}

export default function YaoLineRow({ line, onChange }: Props) {
  const posLabel = ['', '初', '二', '三', '四', '五', '上'][line.position]

  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-gray-800 text-sm">
      {/* 爻位 */}
      <span className="w-8 text-gray-500 text-center">{posLabel}爻</span>

      {/* 阴阳切换 */}
      <div className="flex rounded overflow-hidden border border-gray-600">
        <button
          className={`px-2 py-0.5 text-xs ${line.type === 'yang' ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-500'}`}
          onClick={() => onChange({ type: 'yang' })}
        >
          ⚊ 阳
        </button>
        <button
          className={`px-2 py-0.5 text-xs ${line.type === 'yin' ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-500'}`}
          onClick={() => onChange({ type: 'yin' })}
        >
          ⚋ 阴
        </button>
      </div>

      {/* 动爻 */}
      <label className="flex items-center gap-1 text-xs cursor-pointer">
        <input
          type="checkbox"
          checked={line.changing}
          onChange={(e) => onChange({ changing: e.target.checked })}
          className="accent-red-500"
        />
        <span className={line.changing ? 'text-red-400' : 'text-gray-500'}>动</span>
      </label>

      {/* 六亲 */}
      <select
        value={line.liuqin}
        onChange={(e) => onChange({ liuqin: e.target.value })}
        className="bg-gray-800 border border-gray-700 rounded px-1 py-0.5 text-xs text-gray-300 w-16"
      >
        <option value="">六亲</option>
        {LIUQIN_OPTIONS.map((lq) => (
          <option key={lq} value={lq}>{lq}</option>
        ))}
      </select>

      {/* 地支 */}
      <select
        value={line.zhi}
        onChange={(e) => onChange({ zhi: e.target.value })}
        className="bg-gray-800 border border-gray-700 rounded px-1 py-0.5 text-xs text-gray-300 w-14"
      >
        <option value="">地</option>
        {DIZHI_OPTIONS.map((dz) => (
          <option key={dz} value={dz}>{dz}</option>
        ))}
      </select>

      {/* 世应 */}
      <select
        value={line.shi_ying || ''}
        onChange={(e) => onChange({ shi_ying: (e.target.value || null) as 'shi' | 'ying' | null })}
        className="bg-gray-800 border border-gray-700 rounded px-1 py-0.5 text-xs w-14"
      >
        <option value="">-</option>
        <option value="shi">世</option>
        <option value="ying">应</option>
      </select>
    </div>
  )
}
