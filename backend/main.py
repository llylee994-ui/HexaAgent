"""HexaAgent FastAPI 后端入口"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.models import ChatRequest, ChatResponse
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


@app.post("/api/paipan")
def api_paipan(request: ChatRequest):
    """排盘接口：返回卦象数据，不经过 Agent"""
    result = paipan(question=request.message)
    return result


@app.post("/api/chat")
async def api_chat(request: ChatRequest):
    """聊天接口：Agent 排盘 + 断卦一体化"""
    if request.mode == "manual" and request.hexagram_data:
        # 手动模式：用户已提供卦象，跳过排盘，直接让 Agent 解读
        hex_json = request.hexagram_data.model_dump_json(indent=2)
        user_message = f"""用户手动提供了以下卦象数据，请跳过排盘直接解读：

卦象数据：
{hex_json}

用户问题：{request.message}

请直接分析卦象并给出解读。"""
    else:
        # 自动模式：Agent 自行决定是否排盘
        now_str = f"当前时间是 {__import__('datetime').datetime.now().strftime('%Y年%m月%d日 %H:%M')}"
        user_message = f"{now_str}。用户问题：{request.message}"

    # 调用 Agent
    result = await agent.ainvoke(
        {"messages": [("user", user_message)]},
        config={"configurable": {"thread_id": request.session_id}},
    )

    # 提取最终回复
    messages = result.get("messages", [])
    answer = ""
    thinking_chain = []

    for msg in messages:
        if hasattr(msg, "type"):
            if msg.type == "tool":
                thinking_chain.append(f"调用工具: {msg.name}")
            elif msg.type == "ai" and msg.content:
                answer = msg.content
            elif msg.type == "tool":
                thinking_chain.append("工具返回结果")

    return ChatResponse(
        answer=answer or "抱歉，处理出错，请重试。",
        thinking_chain=thinking_chain,
    )
