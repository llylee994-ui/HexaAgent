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


@app.post("/api/chat")
async def api_chat(request: ChatRequest):
    """聊天接口：Agent 排盘 + 断卦一体化"""
    import traceback

    if request.mode == "manual" and request.hexagram_data:
        hex_json = request.hexagram_data.model_dump_json(indent=2)
        user_message = f"""用户手动提供了以下卦象数据，请跳过排盘直接解读：

卦象数据：
{hex_json}

用户问题：{request.message}

请直接分析卦象并给出解读。"""
    elif request.mode == "text" and request.hexagram_data:
        hex_json = request.hexagram_data.model_dump_json(indent=2)
        user_message = f"""用户以文本模式提供了以下卦象，请跳过排盘直接解读：

卦象数据：
{hex_json}

用户问题：{request.message}

请直接分析卦象并给出解读。"""
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
            # 尝试从工具返回中解析卦象 JSON
            tool_content = getattr(msg, "content", "")
            try:
                if isinstance(tool_content, str) and "hexagram_name" in tool_content:
                    hexagram = HexagramData.model_validate(_json.loads(tool_content))
            except Exception:
                pass
        elif t == "ai":
            # 跳过工具调用消息（content 为空，tool_calls 非空）
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
