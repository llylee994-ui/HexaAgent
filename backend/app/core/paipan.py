"""排盘主入口：四柱 + 起卦 + 纳甲 + 六亲 + 世应 + 空亡 + 六神 → 标准卦象 JSON"""

from datetime import datetime
from typing import Optional

from .sizhu import calc_sizhu
from .bagua import generate_hexagram, get_hexagram_info, build_yao_lines, trigram_lines, _apply_changes
from .najia import apply_najia
from .shiying import apply_shiying
from .liuqin import apply_liuqin, PALACE_WUXING
from .xunkong import apply_xunkong
from .liushen import apply_liushen


def paipan(dt: Optional[datetime] = None, question: str = "") -> dict:
    """自动排盘：公历时间 → 完整卦象"""
    if dt is None:
        dt = datetime.now()

    # 1. 四柱
    sizhu = calc_sizhu(dt)

    # 2. 起卦（梅花易数数字起卦）
    hex_data = generate_hexagram(dt)
    yao_lines = hex_data["yao_lines"]

    # 3. 纳甲
    apply_najia(yao_lines, hex_data["upper"], hex_data["lower"])

    # 4. 世应
    apply_shiying(yao_lines, hex_data["shi_position"])

    # 5. 六亲
    apply_liuqin(yao_lines, PALACE_WUXING.get(hex_data["palace"], ""))

    # 6. 空亡
    apply_xunkong(yao_lines, sizhu["day"])

    # 7. 六神
    day_gan = sizhu["day"][0]
    apply_liushen(yao_lines, day_gan)

    # 8. 变卦六爻处理
    changed_lines = _build_changed_lines(hex_data, sizhu, PALACE_WUXING.get(hex_data["palace"], ""))

    return {
        "mode": "auto",
        "hexagram_name": hex_data["hexagram_name"],
        "changed_to": hex_data["changed_to"],
        "yao_lines": yao_lines,
        "changed_lines": changed_lines,
        "yue_jian": sizhu["yue_jian"],
        "ri_chen": sizhu["ri_chen"],
        "xun_kong": sizhu["xun_kong"],
        "sizhu": {
            "year": sizhu["year"],
            "month": sizhu["month"],
            "day": sizhu["day"],
            "hour": sizhu["hour"],
        },
        "question": question,
    }


def _build_changed_lines(hex_data: dict, sizhu: dict, ben_palace_wuxing: str) -> list[dict]:
    """构建变卦的六爻信息（含纳甲、六亲、世应、空亡、六神）

    变卦六亲始终用本卦卦宫五行，不用变卦卦宫
    """
    changing = hex_data["changing_positions"]
    if not changing:
        return []

    new_upper, new_lower = _apply_changes(hex_data["upper"], hex_data["lower"], changing)
    _, changed_palace, changed_shi = get_hexagram_info(new_upper, new_lower)

    changed_yao = build_yao_lines(new_upper, new_lower, [])
    apply_najia(changed_yao, new_upper, new_lower)
    apply_shiying(changed_yao, changed_shi)
    apply_liuqin(changed_yao, ben_palace_wuxing)  # 变卦用本卦卦宫
    apply_xunkong(changed_yao, sizhu["day"])
    apply_liushen(changed_yao, sizhu["day"][0])

    return changed_yao
