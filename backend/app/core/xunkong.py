"""空亡（旬空）：标记处于旬空的地支爻"""

from .ganzhi import get_xun_kong


def apply_xunkong(yao_lines: list[dict], ri_chen_ganzhi: str) -> list[dict]:
    """根据日柱干支，标记处于旬空的爻

    ri_chen_ganzhi: 日柱干支，如 "癸卯"
    """
    xun_kong_zhi = get_xun_kong(ri_chen_ganzhi)  # ["辰", "巳"]
    for line in yao_lines:
        line["xun_kong"] = line["zhi"] in xun_kong_zhi
    return yao_lines
