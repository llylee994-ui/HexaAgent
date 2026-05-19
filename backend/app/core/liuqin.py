"""六亲：根据世爻五行确定各爻的六亲关系"""

# 五行生克
# 生: 木→火→土→金→水→木
# 克: 木→土→水→火→金→木
WUXING_SHENG = {"木": "火", "火": "土", "土": "金", "金": "水", "水": "木"}
WUXING_KE =    {"木": "土", "土": "水", "水": "火", "火": "金", "金": "木"}


def get_liuqin(wo_wuxing: str, yao_wuxing: str) -> str:
    """世爻五行(我) vs 爻五行 → 六亲名

    生我者父母，我生者子孙，克我者官鬼，我克者妻财，同我者兄弟
    """
    if yao_wuxing == wo_wuxing:
        return "兄弟"
    if WUXING_SHENG[yao_wuxing] == wo_wuxing:
        return "父母"  # 爻生我
    if WUXING_SHENG[wo_wuxing] == yao_wuxing:
        return "子孙"  # 我生爻
    if WUXING_KE[yao_wuxing] == wo_wuxing:
        return "官鬼"  # 爻克我
    if WUXING_KE[wo_wuxing] == yao_wuxing:
        return "妻财"  # 我克爻
    return "兄弟"


def apply_liuqin(yao_lines: list[dict], shi_position: int) -> list[dict]:
    """给六爻列表添加六亲属性

    yao_lines: 已含 position, zhi, wuxing 的爻列表
    shi_position: 世爻位置(1-6)
    """
    # 获取世爻的五行作为"我"
    shi_line = next(l for l in yao_lines if l["position"] == shi_position)
    wo_wuxing = shi_line["wuxing"]

    for line in yao_lines:
        line["liuqin"] = get_liuqin(wo_wuxing, line["wuxing"])
    return yao_lines
