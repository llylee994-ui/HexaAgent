"""天干地支基础：六十甲子、五行、藏干、合冲刑害"""

# 十天干
TIAN_GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]

# 十二地支
DI_ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]

# 天干五行：甲乙木、丙丁火、戊己土、庚辛金、壬癸水
GAN_WUXING = {
    "甲": "木", "乙": "木",
    "丙": "火", "丁": "火",
    "戊": "土", "己": "土",
    "庚": "金", "辛": "金",
    "壬": "水", "癸": "水",
}

# 地支五行：寅卯木、巳午火、申酉金、亥子水、辰戌丑未土
ZHI_WUXING = {
    "子": "水", "丑": "土",
    "寅": "木", "卯": "木",
    "辰": "土", "巳": "火",
    "午": "火", "未": "土",
    "申": "金", "酉": "金",
    "戌": "土", "亥": "水",
}

# 地支藏干（本气 / 中气 / 余气）
ZHI_CANG_GAN = {
    "子": ["癸"],
    "丑": ["己", "癸", "辛"],
    "寅": ["甲", "丙", "戊"],
    "卯": ["乙"],
    "辰": ["戊", "乙", "癸"],
    "巳": ["丙", "戊", "庚"],
    "午": ["丁", "己"],
    "未": ["己", "丁", "乙"],
    "申": ["庚", "壬", "戊"],
    "酉": ["辛"],
    "戌": ["戊", "辛", "丁"],
    "亥": ["壬", "甲"],
}

# 六十甲子表（干支纪年/纪日）
JIAZI_TABLE = [
    f"{TIAN_GAN[i % 10]}{DI_ZHI[i % 12]}"
    for i in range(60)
]

# 地支六合
ZHI_LIUHE = {
    "子": "丑", "丑": "子",
    "寅": "亥", "亥": "寅",
    "卯": "戌", "戌": "卯",
    "辰": "酉", "酉": "辰",
    "巳": "申", "申": "巳",
    "午": "未", "未": "午",
}

# 地支六冲
ZHI_LIUCHONG = {
    "子": "午", "午": "子",
    "丑": "未", "未": "丑",
    "寅": "申", "申": "寅",
    "卯": "酉", "酉": "卯",
    "辰": "戌", "戌": "辰",
    "巳": "亥", "亥": "巳",
}

# 地支三合局：申子辰合水、亥卯未合木、寅午戌合火、巳酉丑合金
ZHI_SANHE = {
    frozenset(["申", "子", "辰"]): "水",
    frozenset(["亥", "卯", "未"]): "木",
    frozenset(["寅", "午", "戌"]): "火",
    frozenset(["巳", "酉", "丑"]): "金",
}

# 五虎遁（年上起月）：根据年干确定正月（寅月）的月干
WU_HU_DUN = {
    "甲": "丙", "己": "丙",
    "乙": "戊", "庚": "戊",
    "丙": "庚", "辛": "庚",
    "丁": "壬", "壬": "壬",
    "戊": "甲", "癸": "甲",
}

# 五鼠遁（日上起时）：根据日干确定子时的时干
WU_SHU_DUN = {
    "甲": "甲", "己": "甲",
    "乙": "丙", "庚": "丙",
    "丙": "戊", "辛": "戊",
    "丁": "庚", "壬": "庚",
    "戊": "壬", "癸": "壬",
}

# 六甲旬（旬空表）：每旬天干起止→缺失的两个地支即为旬空
XUN_KONG_TABLE = {
    "甲子": ["戌", "亥"],
    "甲戌": ["申", "酉"],
    "甲申": ["午", "未"],
    "甲午": ["辰", "巳"],
    "甲辰": ["寅", "卯"],
    "甲寅": ["子", "丑"],
}


def gan_index(gan: str) -> int:
    """天干→索引 0-9"""
    return TIAN_GAN.index(gan)


def zhi_index(zhi: str) -> int:
    """地支→索引 0-11"""
    return DI_ZHI.index(zhi)


def jiazi_index(ganzhi: str) -> int:
    """干支→六十甲子索引 0-59"""
    return JIAZI_TABLE.index(ganzhi)


def get_zhi_wuxing(zhi: str) -> str:
    """地支→五行"""
    return ZHI_WUXING[zhi]


def get_gan_wuxing(gan: str) -> str:
    """天干→五行"""
    return GAN_WUXING[gan]


def get_xun_kong(ri_ganzhi: str) -> list[str]:
    """根据日柱干支返回旬空的两个地支"""
    gan = ri_ganzhi[0]
    zhi = ri_ganzhi[1]
    # 找到该旬的首位：日干往前找到最近的甲
    gan_idx = gan_index(gan)
    zhi_idx = zhi_index(zhi)
    offset = gan_idx  # 从当前天干回到甲，需要往回走 gan_idx 步
    jia_zhi = DI_ZHI[(zhi_idx - offset) % 12]
    xun_head = f"甲{jia_zhi}"
    return XUN_KONG_TABLE[xun_head]


def yue_gan(year_gan: str, month_zhi_index: int) -> str:
    """五虎遁：年干 + 月支索引 → 月干"""
    # 正月寅月起，每个月递增一位天干
    start_gan = WU_HU_DUN[year_gan]
    gan_idx = gan_index(start_gan)
    return TIAN_GAN[(gan_idx + month_zhi_index) % 10]


def shi_gan(day_gan: str, hour_zhi_index: int) -> str:
    """五鼠遁：日干 + 时支索引 → 时干"""
    start_gan = WU_SHU_DUN[day_gan]
    gan_idx = gan_index(start_gan)
    return TIAN_GAN[(gan_idx + hour_zhi_index) % 10]
