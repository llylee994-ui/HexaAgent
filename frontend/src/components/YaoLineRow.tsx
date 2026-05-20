import { useState } from 'react'
import type { YaoLine } from '../types'
import { DIZHI_OPTIONS, LIUQIN_OPTIONS, LIUSHEN } from '../utils/hexagrams'
import MiniSelect from './MiniSelect'

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
  const readOnly = isAutoMode  // 仅自动模式完全不可编辑

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
          <MiniSelect
            value={line.liushen}
            options={LIUSHEN}
            onChange={(v) => onChange({ liushen: v })}
            placeholder="六神"
            className="w-11"
          />
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

        {/* 六亲 — 变卦模式下仍然可编辑 */}
        <MiniSelect
          value={line.liuqin}
          options={LIUQIN_OPTIONS}
          onChange={(v) => onChange({ liuqin: v })}
          placeholder="六亲"
          className="w-14"
          disabled={readOnly}
        />

        {/* 地支 — 变卦模式下仍然可编辑 */}
        <MiniSelect
          value={line.zhi}
          options={DIZHI_OPTIONS}
          onChange={(v) => onChange({ zhi: v })}
          placeholder="地支"
          className="w-12"
          disabled={readOnly}
        />

        {/* 世应 — 变卦模式下不可编辑（不重要） */}
        <MiniSelect
          value={line.shi_ying || ''}
          options={['世', '应']}
          onChange={(v) => onChange({ shi_ying: (v || null) as 'shi' | 'ying' | null })}
          placeholder="-"
          className="w-12"
          disabled={readOnly || isChanged}
        />

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
          <MiniSelect
            value={line.fush_liuqin || ''}
            options={LIUQIN_OPTIONS}
            onChange={(v) => onChange({ fush_liuqin: v })}
            placeholder="六亲"
            className="w-14"
          />
          <MiniSelect
            value={line.fush_zhi || ''}
            options={DIZHI_OPTIONS}
            onChange={(v) => onChange({ fush_zhi: v })}
            placeholder="地支"
            className="w-12"
          />
        </div>
      )}
    </div>
  )
}
