"""会话管理器：内存存储聊天历史"""

from datetime import datetime
from typing import Optional

# 内存存储：{session_id: Session}
_sessions: dict[str, dict] = {}

# 会话顺序（按创建时间）
_session_order: list[str] = []

MAX_SESSIONS = 50  # 最多保留 50 个会话


def get_or_create_session(session_id: str) -> dict:
    """获取或创建会话"""
    if session_id not in _sessions:
        _sessions[session_id] = {
            "id": session_id,
            "title": "",
            "messages": [],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        }
        _session_order.append(session_id)
        # 限制会话数量
        while len(_session_order) > MAX_SESSIONS:
            old_id = _session_order.pop(0)
            _sessions.pop(old_id, None)
    return _sessions[session_id]


def update_session(session_id: str, title: str = "", messages: Optional[list] = None):
    """更新会话内容"""
    session = get_or_create_session(session_id)
    if title and not session["title"]:
        session["title"] = title[:50]
    if messages is not None:
        session["messages"] = messages
    session["updated_at"] = datetime.now().isoformat()


def list_sessions() -> list[dict]:
    """列出所有会话摘要"""
    result = []
    for sid in reversed(_session_order):
        s = _sessions[sid]
        title = s["title"] or s["messages"][0]["content"][:30] if s["messages"] else "空会话"
        result.append({
            "id": s["id"],
            "title": title,
            "message_count": len(s["messages"]),
            "created_at": s["created_at"],
            "updated_at": s["updated_at"],
        })
    return result


def get_session(session_id: str) -> Optional[dict]:
    """获取指定会话"""
    return _sessions.get(session_id)


def delete_session(session_id: str):
    """删除会话"""
    _sessions.pop(session_id, None)
    if session_id in _session_order:
        _session_order.remove(session_id)
