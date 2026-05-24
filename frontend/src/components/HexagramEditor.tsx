import { useChatStore } from '../stores/useChatStore'
import { HEXAGRAM_NAMES, getHexagramYao, getHexagramNazhi, findTrigramByLines, getHexagramName } from '../utils/hexagrams'
import SearchableSelect from './SearchableSelect'
import YaoLineRow from './YaoLineRow'

export default function HexagramEditor() {
  const lines = useChatStore((s) => s.lines)
  const changedLines = useChatStore((s) => s.changedLines)
  const benGuaName = useChatStore((s) => s.benGuaName)
  const updateYaoLine = useChatStore((s) => s.updateYaoLine)
  const updateChangedLine = useChatStore((s) => s.updateChangedLine)
  const setBenGua = useChatStore((s) => s.setBenGua)
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
  const changedLower = findTrigramByLines(changedLines.slice(0, 3).map((l) => l.type))
  const changedUpper = findTrigramByLines(changedLines.slice(3, 6).map((l) => l.type))
  const changedGuaName = changedLower && changedUpper ? getHexagramName(changedUpper, changedLower) : null

  const handlePreset = (name: string) => {
    if (!name) return
    const yao = getHexagramYao(name); if (yao.length === 0) return
    const nazhi = getHexagramNazhi(name)
    yao.forEach((type, i) => { const [gan, zhi] = nazhi[i] || ['', '']; updateYaoLine(i + 1, { type, changing: false, gan, zhi, shi_ying: null }) })
    setBenGua(name)
  }

  const handleRandom = () => { for (let pos = 1; pos <= 6; pos++) updateYaoLine(pos, { type: Math.random() < 0.5 ? 'yang' : 'yin', changing: Math.random() < 0.25, liuqin: '', zhi: '', shi_ying: null }) }

  const handleAutoFillSizhu = async () => {
    try { const r = await fetch('/api/sizhu'); const d = await r.json(); setSizhu('year', d.year); setSizhu('month', d.month); setSizhu('day', d.day); setSizhu('hour', d.hour) } catch {}
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5">
        <SearchableSelect options={HEXAGRAM_NAMES} placeholder="搜索卦名快捷填充..." onSelect={handlePreset} />
        <button onClick={handleRandom} className="px-2.5 py-1.5 text-xs bg-paper hover:bg-line text-cream rounded transition-colors">随机</button>
        <button onClick={resetLines} className="px-2.5 py-1.5 text-xs bg-paper hover:bg-line text-warmgray rounded transition-colors">重置</button>
      </div>

      <div className="space-y-1.5 text-xs">
        <div>
          <div className="flex items-center justify-between mb-1"><label className="text-warmgray">干支（四柱）</label>
            <button onClick={handleAutoFillSizhu} className="text-[11px] text-gold-dim hover:text-gold transition-colors">自动填充</button>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            <input value={sizhuYear} onChange={(e) => setSizhu('year', e.target.value)} placeholder="年" className="bg-ink border border-line rounded px-2 py-1.5 text-cream text-xs" />
            <input value={sizhuMonth} onChange={(e) => setSizhu('month', e.target.value)} placeholder="月" className="bg-ink border border-line rounded px-2 py-1.5 text-cream text-xs" />
            <input value={sizhuDay} onChange={(e) => setSizhu('day', e.target.value)} placeholder="日" className="bg-ink border border-line rounded px-2 py-1.5 text-cream text-xs" />
            <input value={sizhuHour} onChange={(e) => setSizhu('hour', e.target.value)} placeholder="时" className="bg-ink border border-line rounded px-2 py-1.5 text-cream text-xs" />
          </div>
        </div>
        <div><label className="text-warmgray block mb-1">空亡（日柱）</label>
          <input value={kongWang} onChange={(e) => setKongWang(e.target.value)} placeholder="如 辰巳" className="w-full bg-ink border border-line rounded px-2 py-1.5 text-cream text-xs" /></div>
      </div>

      <div className="flex items-center gap-1.5 px-1 text-[10px] text-warmgray">
        <span className="w-7 text-center">爻</span><span className="w-10 text-center">六神</span><span className="w-12 text-center">阴阳</span><span className="w-8 text-center">动</span><span className="w-14 text-center">六亲</span><span className="w-12 text-center">地支</span><span className="w-12 text-center">世应</span>
      </div>

      <div className="bg-ink rounded px-2 py-1 border border-line/50">
        <div className="text-[10px] text-gold-dim mb-1 px-7">本卦{benGuaName ? `：${benGuaName}` : ''}</div>
        {orderedLines.map((line) => (<YaoLineRow key={line.position} line={line} onChange={(field) => updateYaoLine(line.position, field)} />))}
      </div>

      {hasChanging && (
        <div className="bg-ink rounded px-2 py-1 border border-rust/20">
          <div className="text-[10px] text-rust/80 mb-1 px-7">变卦{changedGuaName ? `：${changedGuaName}` : ''}</div>
          {orderedChanged.map((line) => (<YaoLineRow key={line.position} line={line} onChange={(field) => updateChangedLine(line.position, field)} isChanged={true} />))}
        </div>
      )}

      <div className="text-xs"><label className="text-warmgray block mb-1">备注</label>
        <textarea value={beizhu} onChange={(e) => setBeizhu(e.target.value)} placeholder="补充信息，如伏神说明、特殊状态等" className="w-full h-16 bg-ink border border-line rounded px-2 py-1.5 text-cream text-xs resize-none" /></div>
    </div>
  )
}
