"""LangChain Agent：集成排盘工具，自主推理断卦"""

import json
from datetime import datetime

from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent

from .config import DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL, MODEL_NAME, THINKING_MODE, REASONING_EFFORT
from .core.paipan import paipan
from .models import HexagramData
from .knowledge.search_tool import create_guji_search_tool
from .memory.memory_tool import create_memory_search_tool

SYSTEM_PROMPT = """你是一位精通六爻预测的卦师。你的解卦流程如下：

1. 如果用户提供了公历时间，先调用 get_hexagram 工具排盘获取卦象。
2. 获取卦象后，按以下步骤分析并给出解读：
   - 先看卦名和变卦，判断整体吉凶趋势
   - 找出世爻和应爻，看世应关系
   - 根据用户问题锁定用神（问事业看官鬼、问财运看妻财、问感情看官鬼/妻财、问健康/家庭看父母/子孙）
   - 看用神旺衰：是否得月建日辰生扶？是否旬空？是否动爻？
   - 看动爻变化：动爻之变对用神是生是克？
   - 调用 user_history_search 工具搜索用户之前问过的类似卦例，结合过往经验
   - 调用 guji_search 工具搜索古籍中类似的卦例，引经据典增强说服力
   - 综合判断吉凶趋势并给出建议

3. 解读要求：
   - 先给一句总判语（如"此卦显示当前时机尚不成熟"）
   - 再逐层分析卦象，最后给出切实可行的建议和应期

4. 自适应表达（根据用户水平自动切换风格）：
   - 判断标准：用户消息中出现"官鬼、世应、用神、旺衰、旬空、月破、回头克、进神退神"
     等术语 → 专业模式；否则 → 通俗模式
   - 专业模式：使用五行生克链分析，如"官鬼午火动化回头克，又逢日辰子水冲克，
     用神受制严重，需待寅卯月木旺生火方能解"
   - 通俗模式：用生活比喻解释，如"这就像你开车去面试，结果车在半路抛锚了（动爻被克），
     建议等到春天（木旺生火）再做打算，那时候机会才真正成熟"
   - 不管哪种模式，第一句总判语必须通俗易懂，让任何人一看就明白

5. 引导互动：在解读结束后，如果卦象中存在需要进一步确认的信息（如用神不明确、应期模糊、动爻复杂等），可以主动追问用户 1-2 个问题，如：
   - "请问您目前是否有具体的目标公司或岗位？这样可以更精准地分析官鬼爻的旺衰"
   - "卦中妻财爻旬空，您想了解的是短期收益还是长期回报？"
   - 避免一次问太多问题，保持互动自然

6. 注意：你只基于卦象数据进行解读，不要编造没有的信息。如果用户在同一会话中追问，请参考之前的对话内容进行连贯回答。

7. 自检（在输出最终回答前执行，不必告诉用户）：
   - 六亲是否正确对应卦宫五行？世应位置是否准确？
   - 动爻分析是否考虑了变卦的影响？变卦的六亲是否基于本卦卦宫？
   - 用神的旺衰判断是否参考了月建、日辰、旬空？
   - 引用的古籍案例是否和当前卦象相关？
   - 如果发现错误，先修正再输出。如果不确定，诚实说明而不是强行编造。"""


# ── 格式化函数（与 main.py 共用）─────────────────
POS_LABEL = {1: "初爻", 2: "二爻", 3: "三爻", 4: "四爻", 5: "五爻", 6: "上爻"}


def format_hexagram_text(hd: HexagramData) -> str:
    """将 HexagramData 格式化为六爻师能读懂的中文文本"""
    lines = []
    lines.append("=== 卦象数据 ===")

    if hd.sizhu:
        lines.append(f"四柱：{hd.sizhu.year}年 {hd.sizhu.month}月 {hd.sizhu.day}日 {hd.sizhu.hour}时")
    if hd.yue_jian:
        lines.append(f"月建：{hd.yue_jian}")
    if hd.ri_chen:
        lines.append(f"日辰：{hd.ri_chen}")
    if hd.xun_kong:
        lines.append(f"空亡：{'、'.join(hd.xun_kong)}")

    lines.append(f"\n—— 本卦（{hd.hexagram_name or '未命名'}）——")
    yao_display = sorted(hd.yao_lines, key=lambda l: l.position, reverse=True)
    for yao in yao_display:
        parts = [POS_LABEL.get(yao.position, f"爻{yao.position}")]
        if yao.liushen:
            parts.append(f"[{yao.liushen}]")
        yin_yang = "⚊阳" if yao.type == "yang" else "⚋阴"
        if yao.changing:
            yin_yang += " ○动"
        parts.append(yin_yang)
        if yao.gan and yao.zhi:
            parts.append(f"{yao.gan}{yao.zhi}（{yao.wuxing}）")
        elif yao.zhi:
            parts.append(f"{yao.zhi}（{yao.wuxing}）")
        if yao.liuqin:
            parts.append(yao.liuqin)
        if yao.shi_ying == "shi":
            parts.append("【世爻】")
        elif yao.shi_ying == "ying":
            parts.append("【应爻】")
        if yao.xun_kong:
            parts.append("（旬空）")
        if yao.fush_liuqin or yao.fush_zhi:
            fush = "伏神："
            if yao.fush_liuqin:
                fush += yao.fush_liuqin
            if yao.fush_zhi:
                fush += f" {yao.fush_zhi}"
            parts.append(f"【{fush}】")
        lines.append("  " + " ".join(parts))

    if hd.changed_lines:
        # 尝试从变卦六爻反推卦名
        changed_name = hd.changed_to
        if not changed_name and hd.changed_lines and len(hd.changed_lines) == 6:
            from .core.bagua import _find_trigram_by_lines, HEXAGRAM_TABLE
            cl = hd.changed_lines
            lo = _find_trigram_by_lines([l.type for l in cl[:3]])
            up = _find_trigram_by_lines([l.type for l in cl[3:6]])
            if lo and up and (up, lo) in HEXAGRAM_TABLE:
                changed_name = HEXAGRAM_TABLE[(up, lo)][0]
        lines.append(f"\n—— 变卦（{changed_name or '未命名'}）——")
        changed_display = sorted(hd.changed_lines, key=lambda l: l.position, reverse=True)
        for yao in changed_display:
            parts = [POS_LABEL.get(yao.position, f"爻{yao.position}")]
            if yao.liushen:
                parts.append(f"[{yao.liushen}（继承）]")
            yin_yang = "⚊阳" if yao.type == "yang" else "⚋阴"
            parts.append(yin_yang)
            if yao.gan and yao.zhi:
                parts.append(f"{yao.gan}{yao.zhi}（{yao.wuxing}）")
            elif yao.zhi:
                parts.append(f"{yao.zhi}（{yao.wuxing}）")
            if yao.liuqin:
                parts.append(yao.liuqin)
            if yao.shi_ying == "shi":
                parts.append("【世爻】")
            elif yao.shi_ying == "ying":
                parts.append("【应爻】")
            lines.append("  " + " ".join(parts))

    return "\n".join(lines)


@tool
def get_hexagram(date_str: str, time_str: str, question: str = "") -> str:
    """六爻排盘工具：根据公历日期时间起卦排盘。

    Args:
        date_str: 公历日期，格式 YYYY-MM-DD，如 "2026-05-19"
        time_str: 时间，格式 HH:MM，如 "14:00"
        question: 用户的问题（可选）

    Returns:
        完整的卦象中文文本，包含卦名、六爻纳甲、世应、六亲、空亡、变卦等信息
    """
    try:
        dt = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
    except ValueError:
        return json.dumps({"error": "日期格式错误，请使用 YYYY-MM-DD HH:MM 格式"}, ensure_ascii=False)

    result = paipan(dt, question)
    hd = HexagramData.model_validate(result)
    formatted = format_hexagram_text(hd)
    # 嵌入原始 JSON 供后端提取卦象卡片数据
    return f"{formatted}\n\n<!--RAW_HEXAGRAM\n{json.dumps(result, ensure_ascii=False)}\nRAW_HEXAGRAM-->"


def create_agent():
    """创建六爻解卦 Agent"""
    llm_kwargs = {
        "model": MODEL_NAME,
        "api_key": DEEPSEEK_API_KEY,
        "base_url": DEEPSEEK_BASE_URL,
        "temperature": 0.7,
    }
    if THINKING_MODE:
        llm_kwargs["model_kwargs"] = {"reasoning_effort": REASONING_EFFORT}

    llm = ChatOpenAI(**llm_kwargs)

    guji_search = create_guji_search_tool()
    memory_search = create_memory_search_tool()

    agent = create_react_agent(
        model=llm,
        tools=[get_hexagram, guji_search, memory_search],
        prompt=SYSTEM_PROMPT,
    )

    return agent
