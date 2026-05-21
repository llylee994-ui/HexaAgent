"""六亲：根据卦宫五行确定各爻的六亲关系"""

# 卦宫 → 五行
PALACE_WUXING = {
    "乾": "金", "兑": "金",
    "坎": "水",
    "艮": "土", "坤": "土",
    "震": "木", "巽": "木",
    "离": "火",
}

# 五行生克（环形法）
WX_ORDER = ["木", "火", "土", "金", "水"]


def get_liuqin(wo_wuxing: str, yao_wuxing: str) -> str:
    """卦宫五行(我) vs 爻五行 → 六亲名

    生我者父母，我生者子孙，克我者官鬼，我克者妻财，同我者兄弟
    """
    if yao_wuxing == wo_wuxing:
        return "兄弟"
    idx_me = WX_ORDER.index(wo_wuxing)
    idx_he = WX_ORDER.index(yao_wuxing)
    diff = (idx_he - idx_me + 5) % 5
    if diff == 1:
        return "子孙"   # 我生他
    if diff == 4:
        return "父母"   # 他生我
    if diff == 2:
        return "妻财"   # 我克他
    if diff == 3:
        return "官鬼"   # 他克我
    return "兄弟"


def apply_liuqin(yao_lines: list[dict], palace_wuxing: str) -> list[dict]:
    """给六爻列表添加六亲属性

    yao_lines: 已含 position, zhi, wuxing 的爻列表
    palace_wuxing: 卦宫五行（如 "金" "水" "木" "火" "土"）
    """
    for line in yao_lines:
        line["liuqin"] = get_liuqin(palace_wuxing, line["wuxing"])
    return yao_lines
