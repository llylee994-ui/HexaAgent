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
  const readOnly = isAutoMode

  return (
    <div className="border-b border-gray-800">
      <div className="flex items-center gap-1.5 py-1 text-xs">
        {/* 爻位 */}
        <span className="w-7 text-gray-500 text-center">{posLabel}</span>

        {/* 六神：自动模式显示值；变卦显示"继承"；手动可编辑 */}
        {isChanged ? (
          <span className="w-10 text-center text-[10px] text-amber-500/40" title="继承自本卦">
            继承
          </span>
        ) : isAutoMode ? (
          <span className="w-10 text-center text-[10px] text-amber-500/70">
            {line.liushen || '—'}
          </span>
        ) : (
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
        )}

        {/* 阴阳 */}
        {readOnly || isChanged ? (
          <span className={`w-12 text-center text-[10px] ${isChanged ? 'text-gray-400' : 'text-gray-300'}`}>
            {line.type === 'yang' ? '━━━' : '━ ┄'}
          </span>
        ) : (
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
        )}

        {/* 动爻 */}
        <label className="flex items-center gap-0.5 cursor-pointer">
          <input
            type="checkbox"
            checked={line.changing}
            onChange={(e) => onChange({ changing: e.target.checked })}
            className="accent-red-500 w-3 h-3"
            disabled={readOnly || isChanged}
          />
          <span className={line.changing ? 'text-red-400 text-[10px]' : 'text-gray-600 text-[10px]'}>动</span>
        </label>

        {/* 六亲 — 变卦模式下仍可编辑 */}
        <select
          value={line.liuqin}
          onChange={(e) => onChange({ liuqin: e.target.value })}
          disabled={readOnly}
          className="bg-gray-800 border border-gray-700 rounded px-1 py-0.5 text-[10px] text-gray-300 w-14 disabled:opacity-40"
        >
          <option value="">六亲</option>
          {LIUQIN_OPTIONS.map((lq) => (
            <option key={lq} value={lq}>{lq}</option>
          ))}
        </select>

        {/* 地支 — 变卦模式下仍可编辑 */}
        <select
          value={line.zhi}
          onChange={(e) => onChange({ zhi: e.target.value })}
          disabled={readOnly}
          className="bg-gray-800 border border-gray-700 rounded px-1 py-0.5 text-[10px] text-gray-300 w-12 disabled:opacity-40"
        >
          <option value="">地</option>
          {DIZHI_OPTIONS.map((dz) => (
            <option key={dz} value={dz}>{dz}</option>
          ))}
        </select>

        {/* 世应 — 变卦模式下不可编辑 */}
        <select
          value={line.shi_ying || ''}
          onChange={(e) => onChange({ shi_ying: (e.target.value || null) as 'shi' | 'ying' | null })}
          disabled={readOnly || isChanged}
          className="bg-gray-800 border border-gray-700 rounded px-0.5 py-0.5 text-[10px] text-gray-300 w-12 disabled:opacity-40"
        >
          <option value="">-</option>
          <option value="shi">世</option>
          <option value="ying">应</option>
        </select>

        {/* 伏神展开 */}
        {!readOnly && !isChanged && (
          <button
            onClick={() => setShowFush(!showFush)}
            className={`ml-auto text-[10px] px-1 rounded transition-colors ${hasFush ? 'text-purple-400 bg-purple-500/10' : 'text-gray-600 hover:text-gray-400'}`}
            title="伏神"
          >
            {hasFush ? '伏' : '+'}
          </button>
        )}
      </div>

      {/* 伏神编辑区 */}
      {showFush && !readOnly && !isChanged && (
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
