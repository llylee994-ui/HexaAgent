"""HexaAgent FastAPI 后端入口"""

import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.models import ChatRequest, ChatResponse, HexagramData
from app.agent import create_agent, format_hexagram_text
from app.core.paipan import paipan
from app.session_manager import (
    get_or_create_session, update_session, list_sessions, get_session, delete_session,
)
from app.memory.user_case_store import UserCaseStore
from app.config import is_configured, save_settings, DEEPSEEK_BASE_URL, MODEL_NAME, THINKING_MODE, REASONING_EFFORT

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


@app.get("/api/config/status")
def config_status():
    return {
        "configured": is_configured(),
        "thinking_mode": THINKING_MODE,
        "reasoning_effort": REASONING_EFFORT,
    }


@app.post("/api/config/setup")
def config_setup(data: dict):
    save_settings(
        api_key=data.get("api_key", ""),
        base_url=data.get("base_url", DEEPSEEK_BASE_URL),
        model=data.get("model", MODEL_NAME),
    )
    # 需要重启 agent 才能生效
    global agent
    agent = create_agent()
    return {
        "success": True,
        "thinking_mode": THINKING_MODE,
        "reasoning_effort": REASONING_EFFORT,
    }


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


# ── 知识库管理 ──────────────────────────────

from app.knowledge.vector_store import VectorStore as KBStore

@app.get("/api/knowledge")
def api_knowledge_list(search: str = "", limit: int = 100, offset: int = 0):
    store = KBStore()
    items = []
    for i, c in enumerate(store.chunks):
        if search and search not in c["content"]:
            continue
        items.append({
            "id": i,
            "content": c["content"],
            "source": c.get("metadata", {}).get("source", ""),
            "keywords": c.get("metadata", {}).get("keywords", ""),
        })
    total = len(items)
    return {"items": items[offset:offset + limit], "total": total}


@app.post("/api/knowledge")
def api_knowledge_add(data: dict):
    store = KBStore()
    new_content = data.get("content", "")
    # 去重：检查是否已存在相同内容
    for c in store.chunks:
        if c["content"].strip() == new_content.strip():
            return {"success": True, "id": store.chunks.index(c), "duplicate": True}
    chunk = {
        "content": new_content,
        "metadata": {"source": data.get("source", "用户"), "keywords": data.get("keywords", ""), "index": store.count()},
    }
    store.add_chunks([chunk])
    return {"success": True, "id": store.count() - 1, "duplicate": False}


@app.put("/api/knowledge/{chunk_id}")
def api_knowledge_update(chunk_id: int, data: dict):
    store = KBStore()
    if chunk_id < 0 or chunk_id >= store.count():
        return {"error": "not found"}, 404
    store.chunks[chunk_id]["content"] = data.get("content", store.chunks[chunk_id]["content"])
    store.chunks[chunk_id]["metadata"]["source"] = data.get("source", store.chunks[chunk_id]["metadata"].get("source", ""))
    store.chunks[chunk_id]["metadata"]["keywords"] = data.get("keywords", store.chunks[chunk_id]["metadata"].get("keywords", ""))
    # 重新生成向量
    from app.knowledge.vector_store import VectorStore as VS
    emb = store._embed([store.chunks[chunk_id]["content"]])
    if emb is not None and store.embeddings is not None:
        store.embeddings[chunk_id] = emb[0]
    store._save()
    return {"success": True}


@app.delete("/api/knowledge/{chunk_id}")
def api_knowledge_delete(chunk_id: int):
    store = KBStore()
    if chunk_id < 0 or chunk_id >= store.count():
        return {"error": "not found"}, 404
    store.chunks.pop(chunk_id)
    if store.embeddings is not None and len(store.embeddings) > chunk_id:
        store.embeddings = np.delete(store.embeddings, chunk_id, axis=0)  # type: ignore
    store._save()
    return {"success": True}


@app.post("/api/knowledge/reindex")
def api_knowledge_reindex():
    store = KBStore()
    docs = [c["content"] for c in store.chunks]
    embs = store._embed(docs)
    if embs is not None:
        store.embeddings = embs
        store._save()
        return {"success": True, "count": len(docs)}
    return {"success": False, "error": "模型未加载"}


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
        # 只在会话首条消息注入时间（后续消息自动沿用已排的卦）
        session = get_or_create_session(request.session_id)
        if session.get("messages"):
            user_message = request.message
        else:
            now_str = f"当前时间是 {__import__('datetime').datetime.now().strftime('%Y年%m月%d日 %H:%M')}"
            user_message = f"{now_str}。用户问题：{request.message}"

    # 加载历史消息（多轮对话上下文）
    session = get_or_create_session(request.session_id)
    history = session.get("messages", [])
    # 只加载最近 10 条消息
    recent = history[-10:] if len(history) > 10 else history
    agent_messages = []
    for h in recent:
        role = "user" if h["role"] == "user" else "assistant"
        content = h["content"]
        # 将保存的卦象数据附到 assistant 消息前面，让 AI 知道之前排了什么卦
        if h.get("hexagram") and isinstance(h["hexagram"], dict):
            hd = h["hexagram"]
            sizhu_str = f"{hd['sizhu']['year']}年 {hd['sizhu']['month']}月 {hd['sizhu']['day']}日 {hd['sizhu']['hour']}时" if hd.get("sizhu") else ""
            hex_prefix = f"[此前的排盘结果：{hd.get('hexagram_name', '')}"
            if hd.get("changed_to"):
                hex_prefix += f" 之 {hd['changed_to']}"
            if sizhu_str:
                hex_prefix += f"，四柱：{sizhu_str}"
            hex_prefix += "]\n\n"
            content = hex_prefix + content
        agent_messages.append((role, content))
    agent_messages.append(("user", user_message))

    try:
        result = await agent.ainvoke(
            {"messages": agent_messages},
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
                # 从嵌入的 RAW_HEXAGRAM 块中提取 JSON
                if isinstance(tool_content, str) and "RAW_HEXAGRAM" in tool_content:
                    import re
                    m = re.search(r'RAW_HEXAGRAM\s*\n(.*?)\n\s*RAW_HEXAGRAM', tool_content, re.DOTALL)
                    if m:
                        hexagram = HexagramData.model_validate(_json.loads(m.group(1)))
            except Exception:
                pass
        elif t == "ai":
            if hasattr(msg, "tool_calls") and msg.tool_calls:
                tool_names = [tc.get("name", "") for tc in msg.tool_calls]
                thinking_chain.append(f"Agent 决定调用: {', '.join(tool_names)}")
                continue
            # 提取思考模式中的推理内容
            reasoning = getattr(msg, "additional_kwargs", {}).get("reasoning_content", "")
            if reasoning:
                thinking_chain.append(f"深度思考: {reasoning[:200]}{'...' if len(reasoning) > 200 else ''}")

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
    msgs.append({"role": "user", "content": request.message, "hexagram": request.hexagram_data.model_dump() if request.hexagram_data else None})
    msgs.append({"role": "assistant", "content": answer, "hexagram": hexagram.model_dump() if hexagram else None})
    update_session(request.session_id, request.message[:50], msgs)

    # 保存卦例到用户长期记忆
    if hexagram:
        try:
            _save_user_case(request.session_id, request.message, hexagram, answer)
        except Exception:
            pass

    return ChatResponse(
        answer=answer or "抱歉，处理出错，请重试。",
        hexagram=hexagram,
        thinking_chain=thinking_chain,
    )


def _save_user_case(session_id: str, question: str, hd: HexagramData, answer: str):
    """将卦例保存到用户长期记忆"""
    # 提取卦象关键信息
    changing = [l for l in hd.yao_lines if l.changing]
    shi_yao = next((l for l in hd.yao_lines if l.shi_ying == "shi"), None)
    key_info_parts = []
    if shi_yao:
        key_info_parts.append(f"世{shi_yao.liuqin}{shi_yao.zhi}")
    for cl in changing:
        key_info_parts.append(f"动{cl.position}爻{cl.gan}{cl.zhi}{cl.liuqin}")
    if hd.xun_kong:
        key_info_parts.append(f"空{'、'.join(hd.xun_kong)}")
    key_info = "，".join(key_info_parts)

    # 截取 AI 断语第一句作为摘要
    first_line = answer.split("\n")[0].strip().lstrip("#").strip()[:100] if answer else ""

    store = UserCaseStore()
    store.add_case(
        session_id=session_id,
        question=question,
        hexagram_name=hd.hexagram_name,
        changed_to=hd.changed_to or "",
        key_yao_info=key_info,
        answer_summary=first_line,
    )
