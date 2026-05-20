export interface YaoLine {
  position: number
  type: 'yang' | 'yin'
  changing: boolean
  gan: string
  zhi: string
  wuxing: string
  liuqin: string
  shi_ying: 'shi' | 'ying' | null
  xun_kong: boolean
  liushen: string
  fush_liuqin?: string
  fush_zhi?: string
}

export interface Sizhu {
  year: string
  month: string
  day: string
  hour: string
}

export interface HexagramData {
  mode: 'auto' | 'manual'
  hexagram_name: string
  changed_to: string | null
  yao_lines: YaoLine[]
  changed_lines: YaoLine[]
  yue_jian: string
  ri_chen: string
  xun_kong: string[]
  sizhu: Sizhu | null
  question: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  hexagram?: HexagramData | null
  thinkingChain?: string[]
  timestamp: number
}

export interface ChatResponse {
  answer: string
  hexagram: HexagramData | null
  thinking_chain: string[]
}
