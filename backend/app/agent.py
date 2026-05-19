"""LangChain Agent：集成排盘工具，自主推理断卦"""

import json
from datetime import datetime

from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent

from .config import DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL, MODEL_NAME
from .core.paipan import paipan

SYSTEM_PROMPT = """你是一位精通六爻预测的卦师。你的解卦流程如下：

1. 如果用户提供了公历时间，先调用 get_hexagram 工具排盘获取卦象。
2. 获取卦象后，按以下步骤分析并给出解读：
   - 先看卦名和变卦，判断整体吉凶趋势
   - 找出世爻和应爻，看世应关系
   - 根据用户问题锁定用神（问事业看官鬼、问财运看妻财、问感情看官鬼/妻财、问健康/家庭看父母/子孙）
   - 看用神旺衰：是否得月建日辰生扶？是否旬空？是否动爻？
   - 看动爻变化：动爻之变对用神是生是克？
   - 综合判断吉凶趋势并给出建议

3. 解读要求：
   - 先给一句总判语（如"此卦显示当前时机尚不成熟"）
   - 再用通俗语言逐层分析卦象
   - 最后给出切实可行的建议和应期（大约什么时间会变化）
   - 如果用户看起来是新手，用生活化比喻解释；如果用户用了专业术语，用五行生克分析

4. 注意：你只基于卦象数据进行解读，不要编造没有的信息。"""


@tool
def get_hexagram(date_str: str, time_str: str, question: str = "") -> str:
    """六爻排盘工具：根据公历日期时间起卦排盘。

    Args:
        date_str: 公历日期，格式 YYYY-MM-DD，如 "2026-05-19"
        time_str: 时间，格式 HH:MM，如 "14:00"
        question: 用户的问题（可选）

    Returns:
        完整的卦象 JSON 字符串，包含卦名、六爻纳甲、世应、六亲、空亡、变卦等信息
    """
    try:
        dt = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
    except ValueError:
        return json.dumps({"error": "日期格式错误，请使用 YYYY-MM-DD HH:MM 格式"}, ensure_ascii=False)

    result = paipan(dt, question)
    return json.dumps(result, ensure_ascii=False, indent=2)


def create_agent():
    """创建六爻解卦 Agent"""
    llm = ChatOpenAI(
        model=MODEL_NAME,
        api_key=DEEPSEEK_API_KEY,
        base_url=DEEPSEEK_BASE_URL,
        temperature=0.7,
    )

    agent = create_react_agent(
        model=llm,
        tools=[get_hexagram],
        prompt=SYSTEM_PROMPT,
    )

    return agent
