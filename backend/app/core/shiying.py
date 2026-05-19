"""世应：标记六爻中的世爻和应爻位置

世爻规则：由卦在八宫中的代数决定
  一世卦 → 世在初爻(1)，二世卦 → 世在二爻(2)，...
  五世卦 → 世在五爻(5)
  八纯卦 → 世在上爻(6)
  游魂卦 → 世在四爻(4)
  归魂卦 → 世在三爻(3)
  应爻：与世爻隔三位 → (世爻位置 + 2) % 6 + 1
"""


def shiying_positions(shi_position: int) -> dict[int, str | None]:
    """给定世爻位置，返回各爻的世应标记

    Returns: {position: "shi" | "ying" | None}
    """
    ying_position = (shi_position + 2) % 6 + 1
    result = {}
    for pos in range(1, 7):
        if pos == shi_position:
            result[pos] = "shi"
        elif pos == ying_position:
            result[pos] = "ying"
        else:
            result[pos] = None
    return result


def apply_shiying(yao_lines: list[dict], shi_position: int) -> list[dict]:
    """给六爻列表标记世应"""
    positions = shiying_positions(shi_position)
    for line in yao_lines:
        line["shi_ying"] = positions[line["position"]]
    return yao_lines
