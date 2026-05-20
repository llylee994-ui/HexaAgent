// ── 八卦爻象（自下而上）────────────────────
const TRIGRAM_YAO: Record<string, ('yang' | 'yin')[]> = {
  '乾': ['yang', 'yang', 'yang'],
  '兑': ['yang', 'yang', 'yin'],
  '离': ['yang', 'yin', 'yang'],
  '震': ['yang', 'yin', 'yin'],
  '巽': ['yin', 'yang', 'yang'],
  '坎': ['yin', 'yang', 'yin'],
  '艮': ['yin', 'yin', 'yang'],
  '坤': ['yin', 'yin', 'yin'],
}

// ── 三画卦纳支表 ──────────────────────────
// inner: 下卦三爻（初爻→三爻），outer: 上卦三爻（四爻→上爻）
export const TRIGRAM_NAZHI: Record<string, { inner: [string, string][]; outer: [string, string][] }> = {
  '乾': { inner: [['甲','子'],['甲','寅'],['甲','辰']], outer: [['壬','午'],['壬','申'],['壬','戌']] },
  '坎': { inner: [['戊','寅'],['戊','辰'],['戊','午']], outer: [['戊','申'],['戊','戌'],['戊','子']] },
  '艮': { inner: [['丙','辰'],['丙','午'],['丙','申']], outer: [['丙','戌'],['丙','子'],['丙','寅']] },
  '震': { inner: [['庚','子'],['庚','寅'],['庚','辰']], outer: [['庚','午'],['庚','申'],['庚','戌']] },
  '巽': { inner: [['辛','丑'],['辛','亥'],['辛','酉']], outer: [['辛','未'],['辛','巳'],['辛','卯']] },
  '离': { inner: [['己','卯'],['己','丑'],['己','亥']], outer: [['己','酉'],['己','未'],['己','巳']] },
  '坤': { inner: [['乙','未'],['乙','巳'],['乙','卯']], outer: [['癸','丑'],['癸','亥'],['癸','酉']] },
  '兑': { inner: [['丁','巳'],['丁','卯'],['丁','丑']], outer: [['丁','亥'],['丁','酉'],['丁','未']] },
}

// ── 六十四卦：卦名 → [上卦, 下卦] ──────────
const HEXAGRAM_TRIGRAMS: Record<string, [string, string]> = {
  // 乾宫
  '乾为天': ['乾','乾'], '天风姤': ['乾','巽'], '天山遁': ['乾','艮'],
  '天地否': ['乾','坤'], '风地观': ['巽','坤'], '山地剥': ['艮','坤'],
  '火地晋': ['离','坤'], '火天大有': ['离','乾'],
  // 坎宫
  '坎为水': ['坎','坎'], '水泽节': ['坎','兑'], '水雷屯': ['坎','震'],
  '水火既济': ['坎','离'], '泽火革': ['兑','离'], '雷火丰': ['震','离'],
  '地火明夷': ['坤','离'], '地水师': ['坤','坎'],
  // 艮宫
  '艮为山': ['艮','艮'], '山火贲': ['艮','离'], '山天大畜': ['艮','乾'],
  '山泽损': ['艮','兑'], '火泽睽': ['离','兑'], '天泽履': ['乾','兑'],
  '风泽中孚': ['巽','兑'], '风山渐': ['巽','艮'],
  // 震宫
  '震为雷': ['震','震'], '雷地豫': ['震','坤'], '雷水解': ['震','坎'],
  '雷风恒': ['震','巽'], '地风升': ['坤','巽'], '水风井': ['坎','巽'],
  '泽风大过': ['兑','巽'], '泽雷随': ['兑','震'],
  // 巽宫
  '巽为风': ['巽','巽'], '风天小畜': ['巽','乾'], '风火家人': ['巽','离'],
  '风雷益': ['巽','震'], '天雷无妄': ['乾','震'], '火雷噬嗑': ['离','震'],
  '山雷颐': ['艮','震'], '山风蛊': ['艮','巽'],
  // 离宫
  '离为火': ['离','离'], '火山旅': ['离','艮'], '火风鼎': ['离','巽'],
  '火水未济': ['离','坎'], '山水蒙': ['艮','坎'], '风水涣': ['巽','坎'],
  '天水讼': ['乾','坎'], '天火同人': ['乾','离'],
  // 坤宫
  '坤为地': ['坤','坤'], '地雷复': ['坤','震'], '地泽临': ['坤','兑'],
  '地天泰': ['坤','乾'], '雷天大壮': ['震','乾'], '泽天夬': ['兑','乾'],
  '水天需': ['坎','乾'], '水地比': ['坎','坤'],
  // 兑宫
  '兑为泽': ['兑','兑'], '泽水困': ['兑','坎'], '泽地萃': ['兑','坤'],
  '泽山咸': ['兑','艮'], '水山蹇': ['坎','艮'], '地山谦': ['坤','艮'],
  '雷山小过': ['震','艮'], '雷泽归妹': ['震','兑'],
}

// ── [上卦,下卦] → 卦名 反查表 ──────────────
const TRIGRAM_PAIR_TO_NAME: Record<string, string> = {}
for (const [name, [upper, lower]] of Object.entries(HEXAGRAM_TRIGRAMS)) {
  TRIGRAM_PAIR_TO_NAME[`${upper},${lower}`] = name
}

// ── 导出 ───────────────────────────────────
export function getHexagramYao(name: string): ('yang' | 'yin')[] {
  const pair = HEXAGRAM_TRIGRAMS[name]
  if (!pair) return []
  const [upper, lower] = pair
  return [...TRIGRAM_YAO[lower], ...TRIGRAM_YAO[upper]]
}

/** 卦名 → 上下卦 */
export function getTrigramPair(name: string): [string, string] | null {
  return HEXAGRAM_TRIGRAMS[name] || null
}

/** 上下卦 → 卦名 */
export function getHexagramName(upper: string, lower: string): string | null {
  return TRIGRAM_PAIR_TO_NAME[`${upper},${lower}`] || null
}

/** 三爻 → 三画卦名 */
export function findTrigramByLines(lines: ('yang' | 'yin')[]): string | null {
  for (const [name, yao] of Object.entries(TRIGRAM_YAO)) {
    if (yao[0] === lines[0] && yao[1] === lines[1] && yao[2] === lines[2]) return name
  }
  return null
}

/** 卦名 → 六爻纳支（[gan, zhi] × 6，index 0=初爻） */
export function getHexagramNazhi(name: string): [string, string][] {
  const pair = HEXAGRAM_TRIGRAMS[name]
  if (!pair) return []
  const [upper, lower] = pair
  const lowerData = TRIGRAM_NAZHI[lower]
  const upperData = TRIGRAM_NAZHI[upper]
  if (!lowerData || !upperData) return []
  return [...lowerData.inner, ...upperData.outer]
}

export const HEXAGRAM_NAMES = Object.keys(HEXAGRAM_TRIGRAMS)

export const DIZHI_OPTIONS = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']
export const LIUQIN_OPTIONS = ['父母','兄弟','妻财','官鬼','子孙']
export const LIUSHEN = ['青龙','朱雀','勾陈','腾蛇','白虎','玄武']

// ── 卦宫五行（hexagram → palace wuxing）─────
const HEXAGRAM_PALACE_WUXING: Record<string, string> = {}
const palaceGroups: Record<string, string[]> = {
  '金': ['乾为天','天风姤','天山遁','天地否','风地观','山地剥','火地晋','火天大有',
         '兑为泽','泽水困','泽地萃','泽山咸','水山蹇','地山谦','雷山小过','雷泽归妹'],
  '水': ['坎为水','水泽节','水雷屯','水火既济','泽火革','雷火丰','地火明夷','地水师'],
  '木': ['震为雷','雷地豫','雷水解','雷风恒','地风升','水风井','泽风大过','泽雷随',
         '巽为风','风天小畜','风火家人','风雷益','天雷无妄','火雷噬嗑','山雷颐','山风蛊'],
  '火': ['离为火','火山旅','火风鼎','火水未济','山水蒙','风水涣','天水讼','天火同人'],
  '土': ['艮为山','山火贲','山天大畜','山泽损','火泽睽','天泽履','风泽中孚','风山渐',
         '坤为地','地雷复','地泽临','地天泰','雷天大壮','泽天夬','水天需','水地比'],
}
for (const [wx, names] of Object.entries(palaceGroups)) {
  for (const name of names) HEXAGRAM_PALACE_WUXING[name] = wx
}

export function getHexagramPalaceWuxing(name: string): string {
  return HEXAGRAM_PALACE_WUXING[name] || ''
}

// ── 地支→五行 ────────────────────────────────
const ZHI_WUXING_MAP: Record<string, string> = {
  '子':'水','丑':'土','寅':'木','卯':'木','辰':'土',
  '巳':'火','午':'火','未':'土','申':'金','酉':'金','戌':'土','亥':'水',
}

export function getZhiWuxing(zhi: string): string {
  return ZHI_WUXING_MAP[zhi] || ''
}

// ── 六亲计算（环形五行生克法）────────────────
const WX_ORDER = ['木','火','土','金','水']

export function getLiuqin(palaceWuxing: string, zhi: string): string {
  const zw = ZHI_WUXING_MAP[zhi]
  if (!zw || !palaceWuxing) return ''
  if (palaceWuxing === zw) return '兄弟'
  const idxMe = WX_ORDER.indexOf(palaceWuxing)
  const idxHe = WX_ORDER.indexOf(zw)
  const diff = (idxHe - idxMe + 5) % 5
  if (diff === 1) return '子孙'
  if (diff === 4) return '父母'
  if (diff === 2) return '妻财'
  if (diff === 3) return '官鬼'
  return '兄弟'
}

// ── 日干→六神起始索引 ──────────────────────
const LIUSHEN_START: Record<string, number> = {
  '甲':0,'乙':0, '丙':1,'丁':1, '戊':2, '己':3, '庚':4,'辛':4, '壬':5,'癸':5,
}

export function getLiushenByDayGan(dayGan: string): string[] {
  const start = LIUSHEN_START[dayGan] ?? 0
  return Array.from({ length: 6 }, (_, i) => LIUSHEN[(start + i) % 6])
}

// ── 空亡计算 ───────────────────────────────
const GAN_INDEX: Record<string, number> = { '甲':0,'乙':1,'丙':2,'丁':3,'戊':4,'己':5,'庚':6,'辛':7,'壬':8,'癸':9 }
const ZHI_INDEX: Record<string, number> = { '子':0,'丑':1,'寅':2,'卯':3,'辰':4,'巳':5,'午':6,'未':7,'申':8,'酉':9,'戌':10,'亥':11 }

export function getKongWang(dayGan: string, dayZhi: string): string[] {
  const gi = GAN_INDEX[dayGan] ?? 0
  const zi = ZHI_INDEX[dayZhi] ?? 0
  const xunShou = (zi - gi + 12) % 12
  return [
    DIZHI_OPTIONS[(xunShou - 2 + 12) % 12],
    DIZHI_OPTIONS[(xunShou - 1 + 12) % 12],
  ]
}
