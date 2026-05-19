"""四柱推算：年柱、月柱、日柱、时柱"""

from datetime import date, datetime
from .ganzhi import (
    TIAN_GAN, DI_ZHI, JIAZI_TABLE,
    gan_index, yue_gan, shi_gan, get_xun_kong,
)

# 节气日近似表：每月两个节气中的"节"（月始），用于月柱划分
# (月, 日) — 该节气前后 ±1 天误差可接受
JIE_QI = [
    (2, 4),   # 立春 → 寅月 (正月),  month_idx 0
    (3, 6),   # 惊蛰 → 卯月 (二月),  month_idx 1
    (4, 5),   # 清明 → 辰月 (三月),  month_idx 2
    (5, 6),   # 立夏 → 巳月 (四月),  month_idx 3
    (6, 6),   # 芒种 → 午月 (五月),  month_idx 4
    (7, 7),   # 小暑 → 未月 (六月),  month_idx 5
    (8, 7),   # 立秋 → 申月 (七月),  month_idx 6
    (9, 8),   # 白露 → 酉月 (八月),  month_idx 7
    (10, 8),  # 寒露 → 戌月 (九月),  month_idx 8
    (11, 7),  # 立冬 → 亥月 (十月),  month_idx 9
    (12, 7),  # 大雪 → 子月 (十一月), month_idx 10
    (1, 6),   # 小寒 → 丑月 (十二月), month_idx 11
]


def year_ganzhi(dt: date) -> str:
    """公历日期 → 年柱干支（以立春为界）"""
    year = dt.year
    # 立春前归上一年
    if dt.month == 1 or (dt.month == 2 and dt.day < 4):
        year -= 1
    gan = TIAN_GAN[(year - 4) % 10]
    zhi = DI_ZHI[(year - 4) % 12]
    return f"{gan}{zhi}"


def month_ganzhi(dt: date) -> str:
    """公历日期 → 月柱干支（以节气为界）

    节气年始于立春(~Feb 4)，终于次年小寒(~Jan 6)。
    月柱需用节气年对应的年干做五虎遁。
    """
    # 节气年：立春前属上一年
    spring_year = dt.year if (dt.month > 2 or (dt.month == 2 and dt.day >= 4)) else dt.year - 1

    # 构建该节气年的 12 个节：Feb-Dec 用 spring_year，小寒(Jan) 用 spring_year+1
    jieqi_dates = []
    for mth, d in JIE_QI:
        yr = spring_year + 1 if mth == 1 else spring_year
        jieqi_dates.append(date(yr, mth, d))

    # 二分查找：日期 >= 第 i 个节 → 属于第 i 个节气月
    month_idx = 0
    for i, jq in enumerate(jieqi_dates):
        if dt >= jq:
            month_idx = i
        else:
            break

    # 五虎遁用该节气年的年干
    spring_year_gan = year_ganzhi(date(spring_year, 6, 1))[0]  # 年中任意一天取年干
    month_zhi = DI_ZHI[(month_idx + 2) % 12]
    month_gan_char = yue_gan(spring_year_gan, month_idx)
    return f"{month_gan_char}{month_zhi}"


def day_ganzhi(dt: date) -> str:
    """公历日期 → 日柱干支（60周期循环）"""
    # 基准日：1900-01-01 = 甲戌日 (index 10)
    base = date(1900, 1, 1)
    base_index = 10
    days = (dt - base).days
    return JIAZI_TABLE[(base_index + days) % 60]


def hour_ganzhi(dt: datetime) -> str:
    """datetime → 时柱干支"""
    hour = dt.hour
    # 23-1子时(0), 1-3丑时(1), 3-5寅时(2), ...
    hour_zhi_idx = (hour + 1) // 2 % 12
    day_gan = day_ganzhi(dt.date())[0]
    hour_gan_result = shi_gan(day_gan, hour_zhi_idx)
    hour_zhi = DI_ZHI[hour_zhi_idx]
    return f"{hour_gan_result}{hour_zhi}"


def calc_sizhu(dt: datetime) -> dict:
    """公历日期时间 → 四柱完整数据

    Returns:
        {
            "year": "丙午", "month": "癸巳", "day": "癸卯", "hour": "己未",
            "yue_jian": "巳",       # 月建 = 月柱地支
            "ri_chen": "卯",        # 日辰 = 日柱地支
            "xun_kong": ["辰", "巳"] # 旬空
        }
    """
    d_date = dt.date()
    y = year_ganzhi(d_date)
    m = month_ganzhi(d_date)
    d = day_ganzhi(d_date)
    h = hour_ganzhi(dt)

    return {
        "year": y,
        "month": m,
        "day": d,
        "hour": h,
        "yue_jian": m[1],
        "ri_chen": d[1],
        "xun_kong": get_xun_kong(d),
    }
