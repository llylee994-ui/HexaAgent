"""HexaAgent FastAPI 后端入口"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.models import ChatRequest, ChatResponse, HexagramData
from app.agent import create_agent
from app.core.paipan import paipan

agent = create_agent()

app = FastAPI(title="HexaAgent API", description="六爻解卦智能体后端")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/sizhu")
def api_sizhu():
    """返回当前时间的四柱，供前端自动填充"""
    from datetime import datetime
    from app.core.sizhu import calc_sizhu
    return calc_sizhu(datetime.now())


@app.post("/api/paipan")
def api_paipan(request: ChatRequest):
    """排盘接口：返回卦象数据，不经过 Agent"""
    result = paipan(question=request.message)
    return result


def _format_hexagram_text(hd: HexagramData) -> str:
    """将 HexagramData 格式化为六爻师能读懂的中文文本"""
    lines = []
    lines.append("=== 卦象数据 ===")

    # 四柱
    if hd.sizhu:
        lines.append(f"四柱：{hd.sizhu.year}年 {hd.sizhu.month}月 {hd.sizhu.day}日 {hd.sizhu.hour}时")
    if hd.yue_jian:
        lines.append(f"月建：{hd.yue_jian}")
    if hd.ri_chen:
        lines.append(f"日辰：{hd.ri_chen}")
    if hd.xun_kong:
        lines.append(f"空亡：{'、'.join(hd.xun_kong)}")

    # 本卦
    POS_LABEL = {1: "初爻", 2: "二爻", 3: "三爻", 4: "四爻", 5: "五爻", 6: "上爻"}

    lines.append(f"\n—— 本卦（{hd.hexagram_name or '未命名'}）——")
    yao_display = sorted(hd.yao_lines, key=lambda l: l.position, reverse=True)
    for yao in yao_display:
        parts = [POS_LABEL.get(yao.position, f"爻{yao.position}")]
        # 六神
        if yao.liushen:
            parts.append(f"[{yao.liushen}]")
        # 阴阳 + 动爻
        yin_yang = "⚊阳" if yao.type == "yang" else "⚋阴"
        if yao.changing:
            yin_yang += " ○动"
        parts.append(yin_yang)
        # 干支五行
        if yao.gan and yao.zhi:
            parts.append(f"{yao.gan}{yao.zhi}（{yao.wuxing}）")
        elif yao.zhi:
            parts.append(f"{yao.zhi}（{yao.wuxing}）")
        # 六亲
        if yao.liuqin:
            parts.append(yao.liuqin)
        # 世应
        if yao.shi_ying == "shi":
            parts.append("【世爻】")
        elif yao.shi_ying == "ying":
            parts.append("【应爻】")
        # 空亡
        if yao.xun_kong:
            parts.append("（旬空）")
        # 伏神
        if yao.fush_liuqin or yao.fush_zhi:
            fush = "伏神："
            if yao.fush_liuqin:
                fush += yao.fush_liuqin
            if yao.fush_zhi:
                fush += f" {yao.fush_zhi}"
            parts.append(f"【{fush}】")

        lines.append("  " + " ".join(parts))

    # 变卦
    if hd.changed_lines:
        lines.append(f"\n—— 变卦（{hd.changed_to or '未命名'}）——")
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


@app.post("/api/chat")
async def api_chat(request: ChatRequest):
    """聊天接口：Agent 排盘 + 断卦一体化"""
    import traceback

    if request.mode in ("manual", "text") and request.hexagram_data:
        # 手动/文本模式：将卦象转为可读文本喂给 AI
        hex_text = _format_hexagram_text(request.hexagram_data)
        user_message = (
            "用户通过手动排盘提供了以下卦象数据。"
            "请直接分析这些数据并给出六爻断卦解读，无需调用排盘工具。\n\n"
            f"{hex_text}\n\n"
            f"用户问题：{request.message}\n\n"
            "请根据以上卦象数据进行完整解读。注意：如果数据中标注了伏神，请在分析时考虑伏神的含义。"
        )
    else:
        now_str = f"当前时间是 {__import__('datetime').datetime.now().strftime('%Y年%m月%d日 %H:%M')}"
        user_message = f"{now_str}。用户问题：{request.message}"

    try:
        result = await agent.ainvoke(
            {"messages": [("user", user_message)]},
            config={"configurable": {"thread_id": request.session_id}},
        )
    except Exception as e:
        traceback.print_exc()
        return ChatResponse(
            answer=f"Agent 调用失败: {str(e)}",
            thinking_chain=[],
        )

    # 提取最终回复、思维链和卦象数据
    import json as _json
    messages = result.get("messages", [])
    answer = ""
    thinking_chain = []
    hexagram = None

    for msg in messages:
        t = getattr(msg, "type", "")
        if t == "tool":
            name = getattr(msg, "name", "unknown")
            thinking_chain.append(f"调用工具: {name}")
            tool_content = getattr(msg, "content", "")
            try:
                if isinstance(tool_content, str) and "hexagram_name" in tool_content:
                    hexagram = HexagramData.model_validate(_json.loads(tool_content))
            except Exception:
                pass
        elif t == "ai":
            if hasattr(msg, "tool_calls") and msg.tool_calls:
                tool_names = [tc.get("name", "") for tc in msg.tool_calls]
                thinking_chain.append(f"Agent 决定调用: {', '.join(tool_names)}")
                continue
            content = getattr(msg, "content", "")
            if isinstance(content, str) and content.strip():
                answer = content
            elif isinstance(content, list):
                parts = []
                for block in content:
                    if isinstance(block, dict) and block.get("type") == "text":
                        parts.append(block.get("text", ""))
                answer = "".join(parts)

    return ChatResponse(
        answer=answer or "抱歉，处理出错，请重试。",
        hexagram=hexagram,
        thinking_chain=thinking_chain,
    )
