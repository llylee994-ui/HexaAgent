import type { HexagramData } from '../types'

interface Props {
  data: HexagramData
}

export default function HexagramDisplay({ data }: Props) {
  return (
    <div className="bg-gray-900/80 border border-gray-700 rounded-lg p-3 text-xs">
      {/* 卦名 + 四柱 */}
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
        {data.sizhu && (
          <span className="text-gray-500">
            {data.sizhu.year} {data.sizhu.month} {data.sizhu.day} {data.sizhu.hour}
          </span>
        )}
      </div>

      {/* 月建/日辰/旬空 */}
      <div className="flex gap-3 mb-2 text-gray-400">
        <span>月建: <span className="text-gray-200">{data.yue_jian}</span></span>
        <span>日辰: <span className="text-gray-200">{data.ri_chen}</span></span>
        <span>旬空: <span className="text-gray-200">{data.xun_kong.join(' ')}</span></span>
      </div>

      {/* 六爻表头 */}
      <div className="grid grid-cols-[2rem_repeat(6,1fr)] gap-1 mb-1">
        <div className="text-gray-500"></div>
        {[6, 5, 4, 3, 2, 1].map((pos) => (
          <div key={pos} className="text-center text-gray-500">{['', '初', '二', '三', '四', '五', '上'][pos]}爻</div>
        ))}
      </div>

      {/* 阴阳行 */}
      <div className="grid grid-cols-[2rem_repeat(6,1fr)] gap-1 mb-1">
        <div className="text-gray-500 text-[10px] self-center">阴阳</div>
        {[6, 5, 4, 3, 2, 1].map((pos) => {
          const line = data.yao_lines.find((l) => l.position === pos)
          const isYang = line?.type === 'yang'
          return (
            <div key={pos} className="text-center text-lg">
              {isYang ? (
                <span className="text-gray-200">━━━</span>
              ) : (
                <span className="text-gray-200">━ ┄</span>
              )}
              {line?.changing && <span className="text-red-500 ml-0.5">○</span>}
            </div>
          )
        })}
      </div>

      {/* 地支 + 六亲行 */}
      <div className="grid grid-cols-[2rem_repeat(6,1fr)] gap-1 mb-1">
        <div className="text-gray-500 text-[10px] self-center">干支</div>
        {[6, 5, 4, 3, 2, 1].map((pos) => {
          const line = data.yao_lines.find((l) => l.position === pos)
          const label = [line?.shi_ying === 'shi' ? '世' : '', line?.shi_ying === 'ying' ? '应' : ''].filter(Boolean).join('')
          return (
            <div key={pos} className="text-center">
              <span className="text-gray-300">{line?.gan}{line?.zhi}</span>
              {label && <span className="ml-1 text-amber-400">{label}</span>}
            </div>
          )
        })}
      </div>

      {/* 六亲行 */}
      <div className="grid grid-cols-[2rem_repeat(6,1fr)] gap-1">
        <div className="text-gray-500 text-[10px] self-center">六亲</div>
        {[6, 5, 4, 3, 2, 1].map((pos) => {
          const line = data.yao_lines.find((l) => l.position === pos)
          const isKong = line?.xun_kong
          return (
            <div key={pos} className="text-center">
              <span className={`${isKong ? 'text-gray-600 line-through' : 'text-gray-300'}`}>
                {line?.liuqin || '-'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
