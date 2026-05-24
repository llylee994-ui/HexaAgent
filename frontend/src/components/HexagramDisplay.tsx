import type { HexagramData } from '../types'

export default function HexagramDisplay({ data }: { data: HexagramData }) {
  const sizhuStr = data.sizhu ? `${data.sizhu.year}年 ${data.sizhu.month}月 ${data.sizhu.day}日 ${data.sizhu.hour}时` : ''

  const renderTable = (yaoLines: typeof data.yao_lines, showChanged: boolean) => (
    <div className="grid grid-cols-[auto_auto_auto_auto_auto_auto] gap-x-2 gap-y-0.5 text-[10px]">
      <div className="text-warmgray">爻</div><div className="text-warmgray text-center">六神</div><div className="text-warmgray text-center">干支</div><div className="text-warmgray text-center">六亲</div><div className="text-warmgray text-center">世应</div><div className="text-warmgray text-center">伏神</div>
      {[6,5,4,3,2,1].map((pos) => {
        const line = yaoLines.find(l => l.position === pos)
        if (!line) return null
        const posLabel = ['','初','二','三','四','五','上'][pos]
        const isKong = line.xun_kong
        const yaoSymbol = line.type === 'yang' ? '---' : '- -'
        const changingMark = line.changing ? ' O' : ''
        const syMark = line.shi_ying === 'shi' ? '世' : line.shi_ying === 'ying' ? '应' : ''
        const hasFush = line.fush_liuqin || line.fush_zhi
        return (
          <div key={`${showChanged ? 'c' : ''}${pos}`} className="contents">
            <span className="text-warmgray py-0.5">{posLabel}</span>
            <span className={`text-center py-0.5 ${showChanged ? 'text-gold-dim/40' : 'text-gold-dim'}`}>{line.liushen || '-'}</span>
            <span className={`text-center py-0.5 ${isKong ? 'text-warmgray/40 line-through' : 'text-cream'}`}>{yaoSymbol}{changingMark}<br /><span className="text-[9px]">{line.gan}{line.zhi}</span></span>
            <span className={`text-center py-0.5 ${isKong ? 'text-warmgray/40 line-through' : 'text-cream'}`}>{line.liuqin || '-'}</span>
            <span className={`text-center py-0.5 font-bold ${line.shi_ying === 'shi' ? 'text-gold' : line.shi_ying === 'ying' ? 'text-sage' : 'text-warmgray'}`}>{syMark}</span>
            <span className="text-center py-0.5 text-plum/70 text-[9px]">{hasFush ? `${line.fush_liuqin} ${line.fush_zhi}` : ''}</span>
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="bg-ink/60 border border-line/50 rounded p-3 text-xs">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-gold font-bold text-base">{data.hexagram_name}</span>
          {data.changed_to && <><span className="text-warmgray">/</span><span className="text-rust font-bold text-base">{data.changed_to}</span></>}
        </div>
        {sizhuStr && <span className="text-warmgray text-[10px]">{sizhuStr}</span>}
      </div>
      <div className="flex gap-4 mb-2 text-warmgray text-[10px]">
        {sizhuStr && <span>月建: {data.yue_jian}<span className="ml-2">日辰: {data.ri_chen}</span></span>}
        <span>空亡: {data.xun_kong.join(' ')}</span>
      </div>
      {renderTable(data.yao_lines, false)}
      {data.changed_lines && data.changed_lines.length > 0 && (
        <>
          <div className="mt-3 pt-3 border-t border-line"><div className="text-[10px] text-rust/80 mb-1">变卦{data.changed_to ? `：${data.changed_to}` : ''}</div></div>
          {renderTable(data.changed_lines!, true)}
        </>
      )}
    </div>
  )
}
