"""六神（六兽）：根据日干为六爻分配青龙/朱雀/勾陈/腾蛇/白虎/玄武"""

from .ganzhi import gan_index, TIAN_GAN

LIUSHEN = ["青龙", "朱雀", "勾陈", "腾蛇", "白虎", "玄武"]

# 日干 → 初爻六神起始索引（甲乙→青龙[0], 丙丁→朱雀[1], ...）
LIUSHEN_START = {
    "甲": 0, "乙": 0,
    "丙": 1, "丁": 1,
    "戊": 2,
    "己": 3,
    "庚": 4, "辛": 4,
    "壬": 5, "癸": 5,
}


def apply_liushen(yao_lines: list[dict], day_gan: str):
    """根据日干为六爻分配六神"""
    start = LIUSHEN_START.get(day_gan, 0)
    for pos in range(1, 7):
        idx = (start + pos - 1) % 6
        for line in yao_lines:
            if line["position"] == pos:
                line["liushen"] = LIUSHEN[idx]
    return yao_lines
