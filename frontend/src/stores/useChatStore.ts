import { create } from 'zustand'
import type { ChatMessage, YaoLine, HexagramData } from '../types'

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

/** 根据本卦 lines 生成本卦 changedLines：动爻翻转阴阳，六神继承 */
function syncChangedLines(lines: YaoLine[], prev: YaoLine[]): YaoLine[] {
  return lines.map((l, i) => {
    const prevLine = prev[i]
    const newType = l.changing ? (l.type === 'yang' ? 'yin' as const : 'yang' as const) : l.type
    const typeChanged = prevLine && prevLine.type !== newType
    return {
      ...prevLine,
      position: l.position,
      type: newType,
      changing: false,
      liushen: l.liushen, // 继承本卦六神
      // 如果阴阳变了，保留用户之前编辑的六亲和地支，不清空
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
}

interface ChatState {
  messages: ChatMessage[]
  mode: 'auto' | 'manual' | 'text'
  lines: YaoLine[]
  changedLines: YaoLine[]
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
      const newLines = s.lines.map((l) => (l.position === pos ? { ...l, ...field } : l))
      return {
        lines: newLines,
        changedLines: syncChangedLines(newLines, s.changedLines),
      }
    }),

  updateChangedLine: (pos, field) =>
    set((s) => ({
      changedLines: s.changedLines.map((l) => (l.position === pos ? { ...l, ...field } : l)),
    })),

  setSizhu: (field, value) =>
    set((s) => ({
      sizhuYear: field === 'year' ? value : s.sizhuYear,
      sizhuMonth: field === 'month' ? value : s.sizhuMonth,
      sizhuDay: field === 'day' ? value : s.sizhuDay,
      sizhuHour: field === 'hour' ? value : s.sizhuHour,
    })),

  setKongWang: (v) => set({ kongWang: v }),
  setBeizhu: (v) => set({ beizhu: v }),
  setTextInput: (v) => set({ textInput: v }),

  resetLines: () =>
    set({
      lines: [1, 2, 3, 4, 5, 6].map(emptyYaoLine),
      changedLines: [1, 2, 3, 4, 5, 6].map(() => emptyYaoLine(0)),
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
      hexagram_name: '',
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
