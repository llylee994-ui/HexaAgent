import { create } from 'zustand'
import type { ChatMessage, YaoLine, HexagramData } from '../types'
import { getLiushenByDayGan, getKongWang, findTrigramByLines, getHexagramName, getHexagramNazhi, getHexagramPalaceWuxing, getLiuqin, getZhiWuxing } from '../utils/hexagrams'

const emptyYaoLine = (pos: number): YaoLine => ({
  position: pos,
  type: 'yang',
  changing: false,
  gan: '',
  zhi: '',
  wuxing: '',
  liuqin: '',
  shi_ying: null,
  xun_kong: false,
  liushen: '',
  fush_liuqin: '',
  fush_zhi: '',
})

const initialLines: YaoLine[] = [1, 2, 3, 4, 5, 6].map(emptyYaoLine)

/** 根据本卦 lines 生成变卦 changedLines：动爻翻转阴阳，自动识别卦名并填充纳支 */
function syncChangedLines(lines: YaoLine[], prev: YaoLine[], existingDayGan?: string): YaoLine[] {
  // Step 1: 翻转阴阳
  const flipped = lines.map((l, i) => {
    const prevLine = prev[i]
    const newType = l.changing ? (l.type === 'yang' ? 'yin' as const : 'yang' as const) : l.type
    const typeChanged = prevLine && prevLine.type !== newType
    return {
      ...prevLine,
      position: l.position,
      type: newType,
      changing: false,
      liushen: l.liushen,
      liuqin: typeChanged ? (prevLine.liuqin || '') : (prevLine.liuqin || ''),
      zhi: typeChanged ? (prevLine.zhi || '') : (prevLine.zhi || ''),
      gan: '',
      wuxing: '',
      xun_kong: false,
      shi_ying: prevLine.shi_ying || null,
      fush_liuqin: '',
      fush_zhi: '',
    }
  })

  // Step 2: 识别变卦的上下卦 → 卦名 → 纳支自动填充
  const lowerLines = flipped.slice(0, 3).map(l => l.type)
  const upperLines = flipped.slice(3, 6).map(l => l.type)
  const lowerTrigram = findTrigramByLines(lowerLines)
  const upperTrigram = findTrigramByLines(upperLines)
  if (lowerTrigram && upperTrigram) {
    const hexName = getHexagramName(upperTrigram, lowerTrigram)
    if (hexName) {
      const nazhi = getHexagramNazhi(hexName)
      if (nazhi.length === 6) {
        return flipped.map((l, i) => ({
          ...l,
          gan: nazhi[i][0],
          zhi: nazhi[i][1],
        }))
      }
    }
  }

  return flipped
}

interface ChatState {
  messages: ChatMessage[]
  mode: 'auto' | 'manual' | 'text'
  lines: YaoLine[]
  changedLines: YaoLine[]
  benGuaName: string
  benGuaPalaceWuxing: string
  sizhuYear: string
  sizhuMonth: string
  sizhuDay: string
  sizhuHour: string
  kongWang: string
  beizhu: string
  textInput: string
  isLoading: boolean
  thinkingChain: string[]

  setMode: (mode: 'auto' | 'manual' | 'text') => void
  updateYaoLine: (pos: number, field: Partial<YaoLine>) => void
  updateChangedLine: (pos: number, field: Partial<YaoLine>) => void
  setBenGua: (name: string) => void
  setSizhu: (field: 'year' | 'month' | 'day' | 'hour', value: string) => void
  setKongWang: (v: string) => void
  setBeizhu: (v: string) => void
  setTextInput: (v: string) => void
  resetLines: () => void
  addMessage: (msg: ChatMessage) => void
  setLoading: (v: boolean) => void
  setThinkingChain: (steps: string[]) => void
  buildHexagramData: (question: string) => HexagramData
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  mode: 'auto',
  lines: initialLines,
  changedLines: initialLines.map(() => emptyYaoLine(0)),
  benGuaName: '',
  benGuaPalaceWuxing: '',
  sizhuYear: '',
  sizhuMonth: '',
  sizhuDay: '',
  sizhuHour: '',
  kongWang: '',
  beizhu: '',
  textInput: '',
  isLoading: false,
  thinkingChain: [],

  setMode: (mode) => set({ mode }),

  updateYaoLine: (pos, field) =>
    set((s) => {
      // 1. 更新目标爻
      let nLines = s.lines.map((l) => {
        if (l.position !== pos) return l
        const updated = { ...l, ...field }
        if (updated.zhi && s.benGuaPalaceWuxing) updated.liuqin = getLiuqin(s.benGuaPalaceWuxing, updated.zhi)
        if (updated.zhi) updated.wuxing = getZhiWuxing(updated.zhi)
        return updated
      })
      // 2. 尝试从六爻阴阳检测卦名 → 自动填充纳支和六亲
      let newName = s.benGuaName
      let newPw = s.benGuaPalaceWuxing
      const lowerTypes = nLines.slice(0, 3).map(l => l.type)
      const upperTypes = nLines.slice(3, 6).map(l => l.type)
      const lt = findTrigramByLines(lowerTypes)
      const ut = findTrigramByLines(upperTypes)
      if (lt && ut) {
        const detected = getHexagramName(ut, lt)
        if (detected && detected !== s.benGuaName) {
          newName = detected
          newPw = getHexagramPalaceWuxing(detected)
          // 自动填充纳支和六亲
          const nazhi = getHexagramNazhi(detected)
          if (nazhi.length === 6) {
            nLines = nLines.map((l, i) => ({
              ...l,
              gan: nazhi[i][0],
              zhi: nazhi[i][1],
              wuxing: getZhiWuxing(nazhi[i][1]),
              liuqin: newPw ? getLiuqin(newPw, nazhi[i][1]) : l.liuqin,
            }))
          }
        }
      } else {
        newName = ''
        newPw = ''
      }
      // 3. 同步变卦
      const newChanged = syncChangedLines(nLines, s.changedLines)
      if (newPw) {
        for (const cl of newChanged) {
          if (cl.zhi) { cl.liuqin = getLiuqin(newPw, cl.zhi); cl.wuxing = getZhiWuxing(cl.zhi) }
        }
      }
      return { lines: nLines, changedLines: newChanged, benGuaName: newName, benGuaPalaceWuxing: newPw }
    }),

  updateChangedLine: (pos, field) =>
    set((s) => {
      const pw = s.benGuaPalaceWuxing
      return {
        changedLines: s.changedLines.map((l) => {
          if (l.position !== pos) return l
          const updated = { ...l, ...field }
          if (updated.zhi && pw) updated.liuqin = getLiuqin(pw, updated.zhi)
          if (updated.zhi) updated.wuxing = getZhiWuxing(updated.zhi)
          return updated
        }),
      }
    }),

  setBenGua: (name) =>
    set((s) => {
      const pw = getHexagramPalaceWuxing(name)
      if (!pw) return {}
      // 重算本卦所有爻的六亲
      const newLines = s.lines.map((l) => ({
        ...l,
        liuqin: l.zhi ? getLiuqin(pw, l.zhi) : l.liuqin,
        wuxing: l.zhi ? getZhiWuxing(l.zhi) : l.wuxing,
      }))
      // 重算变卦所有爻的六亲（用本卦卦宫）
      const newChanged = s.changedLines.map((l) => ({
        ...l,
        liuqin: l.zhi ? getLiuqin(pw, l.zhi) : l.liuqin,
        wuxing: l.zhi ? getZhiWuxing(l.zhi) : l.wuxing,
      }))
      return { benGuaName: name, benGuaPalaceWuxing: pw, lines: newLines, changedLines: newChanged }
    }),

  setSizhu: (field, value) =>
    set((s) => {
      const newSizhu = {
        year: field === 'year' ? value : s.sizhuYear,
        month: field === 'month' ? value : s.sizhuMonth,
        day: field === 'day' ? value : s.sizhuDay,
        hour: field === 'hour' ? value : s.sizhuHour,
      }
      // 更新日柱时自动分配六神 + 计算空亡 + 标记旬空爻
      let newLines = s.lines
      let newChanged = s.changedLines
      let newKongWang = s.kongWang
      if (field === 'day' && value.length >= 2) {
        const dayGan = value[0]
        const dayZhi = value[1]
        // 六神分配
        const spirits = getLiushenByDayGan(dayGan)
        newLines = s.lines.map((l) => ({ ...l, liushen: spirits[l.position - 1] }))
        newChanged = s.changedLines.map((l) => ({ ...l, liushen: spirits[l.position - 1] }))
        // 空亡计算
        const kong = getKongWang(dayGan, dayZhi)
        newKongWang = kong.join('、')
        // 标记旬空爻（本卦+变卦中地支等于空亡地支的爻）
        newLines = newLines.map((l) => ({ ...l, xun_kong: kong.includes(l.zhi) }))
        newChanged = newChanged.map((l) => ({ ...l, xun_kong: kong.includes(l.zhi) }))
      }
      return { lines: newLines, changedLines: newChanged, kongWang: newKongWang, sizhuYear: newSizhu.year, sizhuMonth: newSizhu.month, sizhuDay: newSizhu.day, sizhuHour: newSizhu.hour }
    }),

  setKongWang: (v) => set({ kongWang: v }),
  setBeizhu: (v) => set({ beizhu: v }),
  setTextInput: (v) => set({ textInput: v }),

  resetLines: () =>
    set({
      lines: [1, 2, 3, 4, 5, 6].map(emptyYaoLine),
      changedLines: [1, 2, 3, 4, 5, 6].map(() => emptyYaoLine(0)),
      benGuaName: '',
      benGuaPalaceWuxing: '',
      sizhuYear: '',
      sizhuMonth: '',
      sizhuDay: '',
      sizhuHour: '',
      kongWang: '',
    }),

  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, msg] })),

  setLoading: (v) => set({ isLoading: v }),
  setThinkingChain: (steps) => set({ thinkingChain: steps }),

  buildHexagramData: (question) => {
    const s = get()
    const hasChanging = s.lines.some((l) => l.changing)

    // 五行推导（根据地支）
    const ZHI_WUXING: Record<string, string> = {
      '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
      '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水',
    }

    // 保留用户填写的所有字段
    const yaoLines = s.lines.map((l) => ({
      ...l,
      wuxing: ZHI_WUXING[l.zhi] || '',  // 从地支推导五行
      liuqin: l.liuqin || '',
      shi_ying: l.shi_ying || null,
      liushen: l.liushen || '',
      fush_liuqin: l.fush_liuqin || '',
      fush_zhi: l.fush_zhi || '',
    }))

    const changedLines = hasChanging
      ? s.changedLines.map((l) => ({
          ...l,
          wuxing: ZHI_WUXING[l.zhi] || '',
          liuqin: l.liuqin || '',
          shi_ying: l.shi_ying || null,
          liushen: l.liushen || '',
        }))
      : []

    return {
      mode: 'manual' as const,
      hexagram_name: s.benGuaName || '',
      changed_to: null,
      yao_lines: yaoLines,
      changed_lines: changedLines,
      yue_jian: s.sizhuMonth ? s.sizhuMonth.slice(1) : '',
      ri_chen: s.sizhuDay ? s.sizhuDay.slice(1) : '',
      xun_kong: s.kongWang ? s.kongWang.split(/[,，]/).map((x) => x.trim()) : [],
      sizhu: s.sizhuYear
        ? { year: s.sizhuYear, month: s.sizhuMonth, day: s.sizhuDay, hour: s.sizhuHour }
        : null,
      question: `${question}${s.beizhu ? `\n\n【备注】${s.beizhu}` : ''}`,
    }
  },
}))
