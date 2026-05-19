"""纳甲规则：为卦象六爻分配天干地支"""

# 各宫六爻地支（自初爻至上爻）
PALACE_DIZHI = {
    "乾": ["子", "寅", "辰", "午", "申", "戌"],
    "坎": ["寅", "辰", "午", "申", "戌", "子"],
    "艮": ["辰", "午", "申", "戌", "子", "寅"],
    "震": ["子", "寅", "辰", "午", "申", "戌"],
    "巽": ["丑", "亥", "酉", "未", "巳", "卯"],
    "离": ["卯", "丑", "亥", "酉", "未", "巳"],
    "坤": ["未", "巳", "卯", "丑", "亥", "酉"],
    "兑": ["巳", "卯", "丑", "亥", "酉", "未"],
}

# 各宫各爻天干
# 乾宫: 内卦(初-三)纳甲, 外卦(四-上)纳壬
# 坤宫: 内卦(初-三)纳乙, 外卦(四-上)纳癸
# 其余六宫: 内外同干
PALACE_TIANGAN = {
    "乾": ["甲", "甲", "甲", "壬", "壬", "壬"],
    "坎": ["戊", "戊", "戊", "戊", "戊", "戊"],
    "艮": ["丙", "丙", "丙", "丙", "丙", "丙"],
    "震": ["庚", "庚", "庚", "庚", "庚", "庚"],
    "巽": ["辛", "辛", "辛", "辛", "辛", "辛"],
    "离": ["己", "己", "己", "己", "己", "己"],
    "坤": ["乙", "乙", "乙", "癸", "癸", "癸"],
    "兑": ["丁", "丁", "丁", "丁", "丁", "丁"],
}

from .ganzhi import get_zhi_wuxing


def najia_for_yao(palace: str, position: int) -> tuple[str, str, str]:
    """给定八宫和爻位(1-6)，返回 (天干, 地支, 五行)"""
    idx = position - 1
    gan = PALACE_TIANGAN[palace][idx]
    zhi = PALACE_DIZHI[palace][idx]
    wx = get_zhi_wuxing(zhi)
    return gan, zhi, wx


def apply_najia(yao_lines: list[dict], palace: str) -> list[dict]:
    """给六爻列表添加纳甲信息（天干、地支、五行）

    yao_lines: list of {position, type, changing, ...}
    palace: 八宫名
    返回原地修改后的列表（同时也会修改原列表）
    """
    for line in yao_lines:
        pos = line["position"]
        gan, zhi, wx = najia_for_yao(palace, pos)
        line["gan"] = gan
        line["zhi"] = zhi
        line["wuxing"] = wx
    return yao_lines
