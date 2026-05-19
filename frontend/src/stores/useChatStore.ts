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
})

const initialLines: YaoLine[] = [1, 2, 3, 4, 5, 6].map(emptyYaoLine)

interface ChatState {
  messages: ChatMessage[]
  mode: 'auto' | 'manual' | 'text'
  lines: YaoLine[]
  yueJian: string
  riChen: string
  xunKong: string
  textInput: string
  isLoading: boolean
  thinkingChain: string[]

  setMode: (mode: 'auto' | 'manual' | 'text') => void
  updateYaoLine: (pos: number, field: Partial<YaoLine>) => void
  setYueJian: (v: string) => void
  setRiChen: (v: string) => void
  setXunKong: (v: string) => void
  setTextInput: (v: string) => void
  resetLines: () => void
  addMessage: (msg: ChatMessage) => void
  setLoading: (v: boolean) => void
  setThinkingChain: (steps: string[]) => void
  buildHexagramData: (question: string) => HexagramData
}

let msgId = 0

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  mode: 'auto',
  lines: initialLines,
  yueJian: '',
  riChen: '',
  xunKong: '',
  textInput: '',
  isLoading: false,
  thinkingChain: [],

  setMode: (mode) => set({ mode }),

  updateYaoLine: (pos, field) =>
    set((s) => ({
      lines: s.lines.map((l) => (l.position === pos ? { ...l, ...field } : l)),
    })),

  setYueJian: (v) => set({ yueJian: v }),
  setRiChen: (v) => set({ riChen: v }),
  setXunKong: (v) => set({ xunKong: v }),
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
    }))
    return {
      mode: 'manual' as const,
      hexagram_name: '',
      changed_to: null,
      yao_lines: yaoLines,
      changed_lines: [],
      yue_jian: s.yueJian,
      ri_chen: s.riChen,
      xun_kong: s.xunKong ? s.xunKong.split(/[,，]/).map((x) => x.trim()) : [],
      sizhu: null,
      question,
    }
  },
}))
