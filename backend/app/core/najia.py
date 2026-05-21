"""纳甲规则：按三画卦为六爻分配天干地支"""

from .ganzhi import get_zhi_wuxing

# 三画卦纳支表：inner=下卦(初/二/三爻), outer=上卦(四/五/上爻)
TRIGRAM_NAZHI = {
    "乾": {"inner": [("甲","子"), ("甲","寅"), ("甲","辰")],
            "outer": [("壬","午"), ("壬","申"), ("壬","戌")]},
    "坎": {"inner": [("戊","寅"), ("戊","辰"), ("戊","午")],
            "outer": [("戊","申"), ("戊","戌"), ("戊","子")]},
    "艮": {"inner": [("丙","辰"), ("丙","午"), ("丙","申")],
            "outer": [("丙","戌"), ("丙","子"), ("丙","寅")]},
    "震": {"inner": [("庚","子"), ("庚","寅"), ("庚","辰")],
            "outer": [("庚","午"), ("庚","申"), ("庚","戌")]},
    "巽": {"inner": [("辛","丑"), ("辛","亥"), ("辛","酉")],
            "outer": [("辛","未"), ("辛","巳"), ("辛","卯")]},
    "离": {"inner": [("己","卯"), ("己","丑"), ("己","亥")],
            "outer": [("己","酉"), ("己","未"), ("己","巳")]},
    "坤": {"inner": [("乙","未"), ("乙","巳"), ("乙","卯")],
            "outer": [("癸","丑"), ("癸","亥"), ("癸","酉")]},
    "兑": {"inner": [("丁","巳"), ("丁","卯"), ("丁","丑")],
            "outer": [("丁","亥"), ("丁","酉"), ("丁","未")]},
}


def apply_najia(yao_lines: list[dict], upper_trigram: str, lower_trigram: str) -> list[dict]:
    """给六爻列表添加纳甲信息

    下卦(初-三爻) 用 lower_trigram 的 inner 纳支
    上卦(四-上爻) 用 upper_trigram 的 outer 纳支

    yao_lines: list of {position, type, changing, ...}
    返回原地修改后的列表
    """
    lower_data = TRIGRAM_NAZHI[lower_trigram]
    upper_data = TRIGRAM_NAZHI[upper_trigram]
    all_nazhi = lower_data["inner"] + upper_data["outer"]  # 6 elements, index 0=初爻

    for i, line in enumerate(yao_lines):
        gan, zhi = all_nazhi[i]
        line["gan"] = gan
        line["zhi"] = zhi
        line["wuxing"] = get_zhi_wuxing(zhi)
    return yao_lines
