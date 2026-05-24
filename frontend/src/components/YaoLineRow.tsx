import { useState } from 'react'
import type { YaoLine } from '../types'
import { DIZHI_OPTIONS, LIUQIN_OPTIONS, LIUSHEN } from '../utils/hexagrams'

interface Props { line: YaoLine; onChange: (f: Partial<YaoLine>) => void; isAutoMode?: boolean; isChanged?: boolean }

export default function YaoLineRow({ line, onChange, isAutoMode, isChanged }: Props) {
  const [showFush, setShowFush] = useState(false)
  const posLabel = ['', '初', '二', '三', '四', '五', '上'][line.position]
  const hasFush = line.fush_liuqin || line.fush_zhi
  const readOnly = isAutoMode

  const sel = "bg-cream border border-line rounded px-1 py-0.5 text-[10px] text-ink disabled:opacity-40"

  return (
    <div className="border-b border-line/50">
      <div className="flex items-center gap-1.5 py-1 text-xs">
        <span className="w-7 text-soft text-center">{posLabel}</span>

        {isChanged ? (<span className="w-10 text-center text-[10px] text-matcha-dim/30">承</span>) :
         isAutoMode ? (<span className="w-10 text-center text-[10px] text-matcha-dim">{line.liushen || '-'}</span>) :
         (<select value={line.liushen} onChange={(e) => onChange({ liushen: e.target.value })} className={`${sel} w-11 text-matcha-dim`}><option value="">-</option>{LIUSHEN.map(ls => <option key={ls} value={ls}>{ls}</option>)}</select>)}

        {readOnly || isChanged ? (
          <span className="w-12 text-center text-[10px] text-ink">{line.type === 'yang' ? '---' : '- -'}</span>
        ) : (
          <div className="flex rounded overflow-hidden border border-line">
            <button className={`px-1.5 py-0.5 text-[10px] ${line.type === 'yang' ? 'bg-matcha text-ink' : 'bg-cream text-soft'}`} onClick={() => onChange({ type: 'yang' })}>---</button>
            <button className={`px-1.5 py-0.5 text-[10px] ${line.type === 'yin' ? 'bg-matcha text-ink' : 'bg-cream text-soft'}`} onClick={() => onChange({ type: 'yin' })}>- -</button>
          </div>
        )}

        <label className="flex items-center gap-0.5 cursor-pointer">
          <input type="checkbox" checked={line.changing} onChange={(e) => onChange({ changing: e.target.checked })} className="accent-rust w-3 h-3" disabled={readOnly || isChanged} />
          <span className={line.changing ? 'text-rust text-[10px]' : 'text-soft text-[10px]'}>动</span>
        </label>

        <select value={line.liuqin} onChange={(e) => onChange({ liuqin: e.target.value })} disabled={readOnly} className={`${sel} w-14`}><option value="">六亲</option>{LIUQIN_OPTIONS.map(lq => <option key={lq} value={lq}>{lq}</option>)}</select>

        <select value={line.zhi} onChange={(e) => onChange({ zhi: e.target.value })} disabled={readOnly} className={`${sel} w-12`}><option value="">地</option>{DIZHI_OPTIONS.map(dz => <option key={dz} value={dz}>{dz}</option>)}</select>

        <select value={line.shi_ying || ''} onChange={(e) => onChange({ shi_ying: (e.target.value || null) as 'shi'|'ying'|null })} disabled={readOnly || isChanged} className={`${sel} w-12`}><option value="">-</option><option value="shi">世</option><option value="ying">应</option></select>

        {!readOnly && !isChanged && (
          <button onClick={() => setShowFush(!showFush)} className={`ml-auto text-[10px] px-1 rounded transition-colors ${hasFush ? 'text-plum bg-plum/5' : 'text-soft hover:text-plum'}`}>{hasFush ? '伏' : '+'}</button>
        )}
      </div>

      {showFush && !readOnly && !isChanged && (
        <div className="flex items-center gap-1.5 px-16 py-1 bg-plum/5 text-[10px]">
          <span className="text-plum">伏神</span>
          <select value={line.fush_liuqin || ''} onChange={(e) => onChange({ fush_liuqin: e.target.value })} className={`${sel} w-14 text-plum`}><option value="">六亲</option>{LIUQIN_OPTIONS.map(lq => <option key={lq} value={lq}>{lq}</option>)}</select>
          <select value={line.fush_zhi || ''} onChange={(e) => onChange({ fush_zhi: e.target.value })} className={`${sel} w-12 text-plum`}><option value="">地支</option>{DIZHI_OPTIONS.map(dz => <option key={dz} value={dz}>{dz}</option>)}</select>
        </div>
      )}
    </div>
  )
}
