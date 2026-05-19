"""八卦与六十四卦：定义、起卦、六十四卦属性表"""

from datetime import datetime

# ── 八卦（三爻）─────────────────────────────
# 先天数: 1乾 2兑 3离 4震 5巽 6坎 7艮 8坤
# 每卦爻位自下而上 [初爻, 二爻, 三爻]

TRIGRAMS = {
    1: {"name": "乾", "yao": ["yang", "yang", "yang"], "wuxing": "金", "symbol": "☰"},
    2: {"name": "兑", "yao": ["yang", "yang", "yin"],  "wuxing": "金", "symbol": "☱"},
    3: {"name": "离", "yao": ["yang", "yin",  "yang"], "wuxing": "火", "symbol": "☲"},
    4: {"name": "震", "yao": ["yang", "yin",  "yin"],  "wuxing": "木", "symbol": "☳"},
    5: {"name": "巽", "yao": ["yin",  "yang", "yang"], "wuxing": "木", "symbol": "☴"},
    6: {"name": "坎", "yao": ["yin",  "yang", "yin"],  "wuxing": "水", "symbol": "☵"},
    7: {"name": "艮", "yao": ["yin",  "yin",  "yang"], "wuxing": "土", "symbol": "☶"},
    8: {"name": "坤", "yao": ["yin",  "yin",  "yin"],  "wuxing": "土", "symbol": "☷"},
}

NUM_TO_TRIGRAM = {num: t["name"] for num, t in TRIGRAMS.items()}
NAME_TO_TRIGRAM = {t["name"]: num for num, t in TRIGRAMS.items()}


def trigram_from_number(n: int) -> str:
    """数字 1-8 → 卦名，0 → 8(坤)"""
    return NUM_TO_TRIGRAM[(n - 1) % 8 + 1]


def trigram_lines(name: str) -> list[str]:
    """卦名 → 三爻"""
    num = NAME_TO_TRIGRAM[name]
    return TRIGRAMS[num]["yao"]


# ── 六十四卦表 ─────────────────────────────
# key: (上卦名, 下卦名)
# value: (卦名, 所属八宫, 世爻位)
# 世爻位: 八纯=6, 一世=1, 二世=2, 三世=3, 四世=4, 五世=5, 游魂=4, 归魂=3

HEXAGRAM_TABLE = {}

def _reg(palace, upper, lower, name, shi):
    HEXAGRAM_TABLE[(upper, lower)] = (name, palace, shi)

# ─ 乾宫
_reg("乾", "乾", "乾", "乾为天", 6)
_reg("乾", "乾", "巽", "天风姤", 1)
_reg("乾", "乾", "艮", "天山遁", 2)
_reg("乾", "乾", "坤", "天地否", 3)
_reg("乾", "巽", "坤", "风地观", 4)
_reg("乾", "艮", "坤", "山地剥", 5)
_reg("乾", "离", "坤", "火地晋", 4)  # 游魂
_reg("乾", "离", "乾", "火天大有", 3) # 归魂

# ─ 坎宫
_reg("坎", "坎", "坎", "坎为水", 6)
_reg("坎", "坎", "兑", "水泽节", 1)
_reg("坎", "坎", "震", "水雷屯", 2)
_reg("坎", "坎", "离", "水火既济", 3)
_reg("坎", "兑", "离", "泽火革", 4)
_reg("坎", "震", "离", "雷火丰", 5)
_reg("坎", "坤", "离", "地火明夷", 4)  # 游魂
_reg("坎", "坤", "坎", "地水师", 3)    # 归魂

# ─ 艮宫
_reg("艮", "艮", "艮", "艮为山", 6)
_reg("艮", "艮", "离", "山火贲", 1)
_reg("艮", "艮", "乾", "山天大畜", 2)
_reg("艮", "艮", "兑", "山泽损", 3)
_reg("艮", "离", "兑", "火泽睽", 4)
_reg("艮", "乾", "兑", "天泽履", 5)
_reg("艮", "巽", "兑", "风泽中孚", 4)  # 游魂
_reg("艮", "巽", "艮", "风山渐", 3)    # 归魂

# ─ 震宫
_reg("震", "震", "震", "震为雷", 6)
_reg("震", "震", "坤", "雷地豫", 1)
_reg("震", "震", "坎", "雷水解", 2)
_reg("震", "震", "巽", "雷风恒", 3)
_reg("震", "坤", "巽", "地风升", 4)
_reg("震", "坎", "巽", "水风井", 5)
_reg("震", "兑", "巽", "泽风大过", 4)  # 游魂
_reg("震", "兑", "震", "泽雷随", 3)    # 归魂

# ─ 巽宫
_reg("巽", "巽", "巽", "巽为风", 6)
_reg("巽", "巽", "乾", "风天小畜", 1)
_reg("巽", "巽", "离", "风火家人", 2)
_reg("巽", "巽", "震", "风雷益", 3)
_reg("巽", "乾", "震", "天雷无妄", 4)
_reg("巽", "离", "震", "火雷噬嗑", 5)
_reg("巽", "艮", "震", "山雷颐", 4)    # 游魂
_reg("巽", "艮", "巽", "山风蛊", 3)    # 归魂

# ─ 离宫
_reg("离", "离", "离", "离为火", 6)
_reg("离", "离", "艮", "火山旅", 1)
_reg("离", "离", "巽", "火风鼎", 2)
_reg("离", "离", "坎", "火水未济", 3)
_reg("离", "艮", "坎", "山水蒙", 4)
_reg("离", "巽", "坎", "风水涣", 5)
_reg("离", "乾", "坎", "天水讼", 4)    # 游魂
_reg("离", "乾", "离", "天火同人", 3)  # 归魂

# ─ 坤宫
_reg("坤", "坤", "坤", "坤为地", 6)
_reg("坤", "坤", "震", "地雷复", 1)
_reg("坤", "坤", "兑", "地泽临", 2)
_reg("坤", "坤", "乾", "地天泰", 3)
_reg("坤", "震", "乾", "雷天大壮", 4)
_reg("坤", "兑", "乾", "泽天夬", 5)
_reg("坤", "坎", "乾", "水天需", 4)    # 游魂
_reg("坤", "坎", "坤", "水地比", 3)    # 归魂

# ─ 兑宫
_reg("兑", "兑", "兑", "兑为泽", 6)
_reg("兑", "兑", "坎", "泽水困", 1)
_reg("兑", "兑", "坤", "泽地萃", 2)
_reg("兑", "兑", "艮", "泽山咸", 3)
_reg("兑", "坎", "艮", "水山蹇", 4)
_reg("兑", "坤", "艮", "地山谦", 5)
_reg("兑", "震", "艮", "雷山小过", 4)  # 游魂
_reg("兑", "震", "兑", "雷泽归妹", 3)  # 归魂


def get_hexagram_info(upper: str, lower: str) -> tuple[str, str, int]:
    """(上卦名, 下卦名) → (卦名, 八宫, 世爻位 1-6)"""
    return HEXAGRAM_TABLE[(upper, lower)]


def build_yao_lines(upper: str, lower: str, changing_positions: list[int]):
    """根据上下卦名和动爻位置列表，构建六爻列表

    返回 list[dict]: 每个 dict 含 position(1-6), type(yang/yin), changing(bool)
    """
    upper_yao = trigram_lines(upper)   # [初,二,三] = 卦的4,5,6爻
    lower_yao = trigram_lines(lower)   # [初,二,三] = 卦的1,2,3爻
    all_yao = lower_yao + upper_yao    # index 0-5 → position 1-6

    lines = []
    for i, yao_type in enumerate(all_yao):
        pos = i + 1
        lines.append({
            "position": pos,
            "type": yao_type,
            "changing": pos in changing_positions,
        })
    return lines


def generate_hexagram(dt: datetime) -> dict:
    """根据公历时间数字起卦（梅花易数法）

    年月日之和 ÷ 8 → 下卦
    年月日时之和 ÷ 8 → 上卦
    年月日时之和 ÷ 6 → 动爻（余 0 → 第 6 爻动）

    Returns:
        {
            "hexagram_name": "天风姤",
            "changed_to": "天水讼",
            "upper": "乾",
            "lower": "巽",
            "palace": "乾",
            "shi_position": 1,
            "changing_positions": [1, 4],
            "yao_lines": [...]
        }
    """
    y = dt.year
    m = dt.month
    d = dt.day
    h = dt.hour

    sum_lower = y + m + d
    sum_all = y + m + d + h

    lower_num = (sum_lower % 8) or 8
    upper_num = (sum_all % 8) or 8
    dong_num = (sum_all % 6) or 6      # 动爻 1-6

    upper = NUM_TO_TRIGRAM[upper_num]
    lower = NUM_TO_TRIGRAM[lower_num]

    hex_name, palace, shi_pos = get_hexagram_info(upper, lower)

    # 变动爻 → 变卦的上/下卦
    changing_positions = [dong_num]

    # 变卦：动爻翻转
    changed_upper, changed_lower = _apply_changes(upper, lower, changing_positions)
    changed_name, _, _ = get_hexagram_info(changed_upper, changed_lower)

    yao_lines = build_yao_lines(upper, lower, changing_positions)

    return {
        "hexagram_name": hex_name,
        "changed_to": changed_name,
        "upper": upper,
        "lower": lower,
        "palace": palace,
        "shi_position": shi_pos,
        "changing_positions": changing_positions,
        "yao_lines": yao_lines,
    }


def _apply_changes(upper: str, lower: str, changing_pos: list[int]):
    """根据动爻位置翻转阴阳，返回 (new_upper, new_lower)"""
    upper_yao = list(trigram_lines(upper))
    lower_yao = list(trigram_lines(lower))
    all_yao = lower_yao + upper_yao  # index 0-5 → pos 1-6

    for pos in changing_pos:
        idx = pos - 1
        old = all_yao[idx]
        all_yao[idx] = "yin" if old == "yang" else "yang"

    new_lower_yao = all_yao[0:3]
    new_upper_yao = all_yao[3:6]

    new_lower = _find_trigram_by_lines(new_lower_yao)
    new_upper = _find_trigram_by_lines(new_upper_yao)
    return new_upper, new_lower


def _find_trigram_by_lines(lines: list[str]) -> str:
    """根据三爻查找卦名"""
    for num, info in TRIGRAMS.items():
        if info["yao"] == lines:
            return info["name"]
    raise ValueError(f"Unknown trigram lines: {lines}")
