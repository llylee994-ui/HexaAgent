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
})

const initialLines: YaoLine[] = [1, 2, 3, 4, 5, 6].map(emptyYaoLine)

interface ChatState {
  messages: ChatMessage[]
  mode: 'auto' | 'manual' | 'text'
  lines: YaoLine[]
  sizhuYear: string
  sizhuMonth: string
  sizhuDay: string
  sizhuHour: string
  kongWang: string
  textInput: string
  isLoading: boolean
  thinkingChain: string[]

  setMode: (mode: 'auto' | 'manual' | 'text') => void
  updateYaoLine: (pos: number, field: Partial<YaoLine>) => void
  setSizhu: (field: 'year' | 'month' | 'day' | 'hour', value: string) => void
  setKongWang: (v: string) => void
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
  sizhuYear: '',
  sizhuMonth: '',
  sizhuDay: '',
  sizhuHour: '',
  kongWang: '',
  textInput: '',
  isLoading: false,
  thinkingChain: [],

  setMode: (mode) => set({ mode }),

  updateYaoLine: (pos, field) =>
    set((s) => ({
      lines: s.lines.map((l) => (l.position === pos ? { ...l, ...field } : l)),
    })),

  setSizhu: (field, value) =>
    set((s) => ({
      sizhuYear: field === 'year' ? value : s.sizhuYear,
      sizhuMonth: field === 'month' ? value : s.sizhuMonth,
      sizhuDay: field === 'day' ? value : s.sizhuDay,
      sizhuHour: field === 'hour' ? value : s.sizhuHour,
    })),

  setKongWang: (v) => set({ kongWang: v }),
  setTextInput: (v) => set({ textInput: v }),

  resetLines: () => set({ lines: [1, 2, 3, 4, 5, 6].map(emptyYaoLine) }),

  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, msg] })),

  setLoading: (v) => set({ isLoading: v }),
  setThinkingChain: (steps) => set({ thinkingChain: steps }),

  buildHexagramData: (question) => {
    const s = get()
    const yaoLines = s.lines.map((l) => ({
      ...l,
      gan: '',
      zhi: '',
      wuxing: '',
      liuqin: l.liuqin || '',
      shi_ying: l.shi_ying || null,
      xun_kong: false,
      liushen: '',
    }))
    return {
      mode: 'manual' as const,
      hexagram_name: '',
      changed_to: null,
      yao_lines: yaoLines,
      changed_lines: [],
      yue_jian: '',
      ri_chen: '',
      xun_kong: s.kongWang ? s.kongWang.split(/[,，]/).map((x) => x.trim()) : [],
      sizhu: s.sizhuYear
        ? { year: s.sizhuYear, month: s.sizhuMonth, day: s.sizhuDay, hour: s.sizhuHour }
        : null,
      question,
    }
  },
}))
