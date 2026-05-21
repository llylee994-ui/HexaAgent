"""HexaAgent FastAPI 后端入口"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.models import ChatRequest, ChatResponse, HexagramData
from app.agent import create_agent, format_hexagram_text
from app.core.paipan import paipan
from app.session_manager import (
    get_or_create_session, update_session, list_sessions, get_session, delete_session,
)

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


# ── 会话管理 ──────────────────────────────────

@app.get("/api/sessions")
def api_list_sessions():
    return list_sessions()


@app.get("/api/sessions/{session_id}")
def api_get_session(session_id: str):
    s = get_session(session_id)
    if not s:
        return {"error": "not found"}, 404
    return s


@app.post("/api/sessions")
def api_new_session():
    import uuid
    sid = uuid.uuid4().hex[:12]
    get_or_create_session(sid)
    return {"id": sid}


@app.delete("/api/sessions/{session_id}")
def api_delete_session(session_id: str):
    delete_session(session_id)
    return {"status": "deleted"}


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


@app.post("/api/chat")
async def api_chat(request: ChatRequest):
    """聊天接口：Agent 排盘 + 断卦一体化"""
    import traceback

    if request.mode in ("manual", "text") and request.hexagram_data:
        # 手动/文本模式：将卦象转为可读文本喂给 AI
        hex_text = format_hexagram_text(request.hexagram_data)
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
                # 从嵌入的 RAW_HEXAGRAM 标记中提取 JSON
                if isinstance(tool_content, str) and "RAW_HEXAGRAM" in tool_content:
                    start = tool_content.find("<!--RAW_HEXAGRAM\n") + len("<!--RAW_HEXAGRAM\n")
                    end = tool_content.find("\nRAW_HEXAGRAM-->")
                    if start > 0 and end > start:
                        hexagram = HexagramData.model_validate(_json.loads(tool_content[start:end]))
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

    # 持久化会话消息
    session = get_or_create_session(request.session_id)
    msgs = session.get("messages", [])
    msgs.append({"role": "user", "content": request.message})
    msgs.append({"role": "assistant", "content": answer})
    update_session(request.session_id, request.message[:50], msgs)

    return ChatResponse(
        answer=answer or "抱歉，处理出错，请重试。",
        hexagram=hexagram,
        thinking_chain=thinking_chain,
    )
