import type { HexagramData } from '../types'

interface Props {
  data: HexagramData
}

export default function HexagramDisplay({ data }: Props) {
  const sizhuStr = data.sizhu
    ? `${data.sizhu.year}年 ${data.sizhu.month}月 ${data.sizhu.day}日 ${data.sizhu.hour}时`
    : ''

  return (
    <div className="bg-gray-900/80 border border-gray-700 rounded-lg p-3 text-xs">
      {/* 卦名 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-bold text-base">{data.hexagram_name}</span>
          {data.changed_to && (
            <>
              <span className="text-gray-500">→</span>
              <span className="text-red-400 font-bold text-base">{data.changed_to}</span>
            </>
          )}
        </div>
      </div>

      {/* 干支 + 空亡 */}
      <div className="flex gap-4 mb-2 text-gray-400">
        {sizhuStr && <span>干支: <span className="text-gray-200">{sizhuStr}</span></span>}
        <span>空亡: <span className="text-gray-200">{data.xun_kong.join(' ')}</span></span>
      </div>

      {/* 六爻表：从上爻到初爻 */}
      <div className="grid grid-cols-[auto_auto_auto_auto_auto_auto] gap-x-2 gap-y-0.5 text-[10px]">
        {/* 表头 */}
        <div className="text-gray-600">爻</div>
        <div className="text-gray-600 text-center">六神</div>
        <div className="text-gray-600 text-center">干支</div>
        <div className="text-gray-600 text-center">六亲</div>
        <div className="text-gray-600 text-center">世应</div>
        <div className="text-gray-600 text-center">伏神</div>

        {[6, 5, 4, 3, 2, 1].map((pos) => {
          const line = data.yao_lines.find((l) => l.position === pos)
          if (!line) return null
          const posLabel = ['', '初', '二', '三', '四', '五', '上'][pos]
          const isKong = line.xun_kong
          const yaoSymbol = line.type === 'yang' ? '━━━' : '━ ┄'
          const changingMark = line.changing ? ' ○' : ''
          const shiYingMark =
            line.shi_ying === 'shi' ? '世' : line.shi_ying === 'ying' ? '应' : ''
          const hasFush = line.fush_liuqin || line.fush_zhi

          return (
            <div key={pos} className="contents">
              <span className="text-gray-500 py-0.5">{posLabel}</span>
              <span className="text-center text-amber-500/60 py-0.5">{line.liushen || '-'}</span>
              <span className={`text-center py-0.5 ${isKong ? 'text-gray-600 line-through' : 'text-gray-200'}`}>
                {yaoSymbol}{changingMark}<br />
                <span className="text-[9px]">{line.gan}{line.zhi}</span>
              </span>
              <span className={`text-center py-0.5 ${isKong ? 'text-gray-600 line-through' : 'text-gray-300'}`}>
                {line.liuqin || '-'}
              </span>
              <span className={`text-center py-0.5 font-bold ${line.shi_ying === 'shi' ? 'text-amber-400' : line.shi_ying === 'ying' ? 'text-blue-400' : 'text-gray-600'}`}>
                {shiYingMark}
              </span>
              <span className="text-center py-0.5 text-purple-400/70 text-[9px]">
                {hasFush ? `${line.fush_liuqin} ${line.fush_zhi}` : ''}
              </span>
            </div>
          )
        })}
      </div>

      {/* 变卦 */}
      {data.changed_lines && data.changed_lines.length > 0 && (
        <>
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="text-[10px] text-red-400/70 mb-1">
              — 变卦{data.changed_to ? `：${data.changed_to}` : ''} —
            </div>
          </div>
          <div className="grid grid-cols-[auto_auto_auto_auto_auto_auto] gap-x-2 gap-y-0.5 text-[10px]">
            <div className="text-gray-600">爻</div>
            <div className="text-gray-600 text-center">六神</div>
            <div className="text-gray-600 text-center">干支</div>
            <div className="text-gray-600 text-center">六亲</div>
            <div className="text-gray-600 text-center">世应</div>
            <div className="text-gray-600 text-center">伏神</div>
            {[6, 5, 4, 3, 2, 1].map((pos) => {
              const line = data.changed_lines!.find((l) => l.position === pos)
              if (!line) return null
              const posLabel = ['', '初', '二', '三', '四', '五', '上'][pos]
              const yaoSymbol = line.type === 'yang' ? '━━━' : '━ ┄'
              const shiYingMark = line.shi_ying === 'shi' ? '世' : line.shi_ying === 'ying' ? '应' : ''

              return (
                <div key={`c${pos}`} className="contents">
                  <span className="text-gray-500 py-0.5">{posLabel}</span>
                  <span className="text-center text-amber-500/60 py-0.5">{line.liushen || '-'}</span>
                  <span className="text-center py-0.5 text-gray-200">
                    {yaoSymbol}<br />
                    <span className="text-[9px]">{line.gan}{line.zhi}</span>
                  </span>
                  <span className="text-center py-0.5 text-gray-300">{line.liuqin || '-'}</span>
                  <span className={`text-center py-0.5 font-bold ${line.shi_ying === 'shi' ? 'text-amber-400' : line.shi_ying === 'ying' ? 'text-blue-400' : 'text-gray-600'}`}>
                    {shiYingMark}
                  </span>
                  <span className="text-center py-0.5 text-purple-400/70 text-[9px]">
                    {line.fush_liuqin ? `${line.fush_liuqin} ${line.fush_zhi || ''}` : ''}
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
