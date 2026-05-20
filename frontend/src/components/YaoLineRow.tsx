import { useState } from 'react'
import type { YaoLine } from '../types'
import { DIZHI_OPTIONS, LIUQIN_OPTIONS, LIUSHEN } from '../utils/hexagrams'

interface Props {
  line: YaoLine
  onChange: (field: Partial<YaoLine>) => void
  isAutoMode?: boolean
  isChanged?: boolean
}

export default function YaoLineRow({ line, onChange, isAutoMode, isChanged }: Props) {
  const [showFush, setShowFush] = useState(false)
  const posLabel = ['', '初', '二', '三', '四', '五', '上'][line.position]
  const hasFush = line.fush_liuqin || line.fush_zhi
  const readOnly = isAutoMode || isChanged

  return (
    <div className="border-b border-gray-800">
      <div className="flex items-center gap-1.5 py-1 text-xs">
        {/* 爻位 */}
        <span className="w-7 text-gray-500 text-center">{posLabel}</span>

        {/* 六神 */}
        {!readOnly ? (
          <select
            value={line.liushen}
            onChange={(e) => onChange({ liushen: e.target.value })}
            className="bg-gray-800 border border-gray-700 rounded px-0.5 py-0.5 text-[10px] text-amber-500/80 w-11"
          >
            <option value="">-</option>
            {LIUSHEN.map((ls) => (
              <option key={ls} value={ls}>{ls}</option>
            ))}
          </select>
        ) : (
          <span className="w-10 text-center text-[10px] text-amber-500/70">
            {line.liushen || '—'}
          </span>
        )}

        {/* 阴阳 */}
        {!readOnly ? (
          <div className="flex rounded overflow-hidden border border-gray-600">
            <button
              className={`px-1.5 py-0.5 text-[10px] ${line.type === 'yang' ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-500'}`}
              onClick={() => onChange({ type: 'yang' })}
            >⚊</button>
            <button
              className={`px-1.5 py-0.5 text-[10px] ${line.type === 'yin' ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-500'}`}
              onClick={() => onChange({ type: 'yin' })}
            >⚋</button>
          </div>
        ) : (
          <span className="w-12 text-center text-gray-300">
            {line.type === 'yang' ? '━━━' : '━ ┄'}
          </span>
        )}

        {/* 动爻 */}
        <label className="flex items-center gap-0.5 cursor-pointer">
          <input
            type="checkbox"
            checked={line.changing}
            onChange={(e) => onChange({ changing: e.target.checked })}
            className="accent-red-500 w-3 h-3"
            disabled={readOnly}
          />
          <span className={line.changing ? 'text-red-400' : 'text-gray-600'}>动</span>
        </label>

        {/* 六亲 */}
        {!readOnly ? (
          <select
            value={line.liuqin}
            onChange={(e) => onChange({ liuqin: e.target.value })}
            className="bg-gray-800 border border-gray-700 rounded px-1 py-0.5 text-[10px] text-gray-300 w-14"
          >
            <option value="">六亲</option>
            {LIUQIN_OPTIONS.map((lq) => (
              <option key={lq} value={lq}>{lq}</option>
            ))}
          </select>
        ) : (
          <span className="w-12 text-center text-gray-300 text-[10px]">{line.liuqin}</span>
        )}

        {/* 地支 */}
        {!readOnly ? (
          <select
            value={line.zhi}
            onChange={(e) => onChange({ zhi: e.target.value })}
            className="bg-gray-800 border border-gray-700 rounded px-1 py-0.5 text-[10px] text-gray-300 w-12"
          >
            <option value="">地</option>
            {DIZHI_OPTIONS.map((dz) => (
              <option key={dz} value={dz}>{dz}</option>
            ))}
          </select>
        ) : (
          <span className="w-10 text-center text-gray-300 text-[10px]">
            {line.gan}{line.zhi}
          </span>
        )}

        {/* 世应 */}
        {!readOnly ? (
          <select
            value={line.shi_ying || ''}
            onChange={(e) => onChange({ shi_ying: (e.target.value || null) as 'shi' | 'ying' | null })}
            className="bg-gray-800 border border-gray-700 rounded px-0.5 py-0.5 text-[10px] w-12"
          >
            <option value="">-</option>
            <option value="shi">世</option>
            <option value="ying">应</option>
          </select>
        ) : (
          <span className={`w-8 text-center text-[10px] font-bold ${line.shi_ying === 'shi' ? 'text-amber-400' : line.shi_ying === 'ying' ? 'text-blue-400' : 'text-gray-600'}`}>
            {line.shi_ying === 'shi' ? '世' : line.shi_ying === 'ying' ? '应' : ''}
          </span>
        )}

        {/* 伏神展开按钮 */}
        {!readOnly && (
          <button
            onClick={() => setShowFush(!showFush)}
            className={`ml-auto text-[10px] px-1 rounded ${hasFush ? 'text-purple-400 bg-purple-500/10' : 'text-gray-600 hover:text-gray-400'}`}
            title="伏神"
          >
            {hasFush ? '伏' : '+'}
          </button>
        )}
      </div>

      {/* 伏神编辑区 */}
      {showFush && !readOnly && (
        <div className="flex items-center gap-1.5 px-16 py-1 bg-purple-500/5 text-[10px]">
          <span className="text-purple-400">伏神</span>
          <select
            value={line.fush_liuqin || ''}
            onChange={(e) => onChange({ fush_liuqin: e.target.value })}
            className="bg-gray-800 border border-gray-700 rounded px-1 py-0.5 text-purple-300 w-14"
          >
            <option value="">六亲</option>
            {LIUQIN_OPTIONS.map((lq) => (
              <option key={lq} value={lq}>{lq}</option>
            ))}
          </select>
          <select
            value={line.fush_zhi || ''}
            onChange={(e) => onChange({ fush_zhi: e.target.value })}
            className="bg-gray-800 border border-gray-700 rounded px-1 py-0.5 text-purple-300 w-12"
          >
            <option value="">地支</option>
            {DIZHI_OPTIONS.map((dz) => (
              <option key={dz} value={dz}>{dz}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
