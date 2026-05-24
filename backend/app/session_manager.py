"""会话管理器：JSON 文件持久化存储"""

import json
import os
from datetime import datetime
from typing import Optional

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
SESSION_FILE = os.path.join(DATA_PATH, "sessions.json")
MAX_SESSIONS = 50

_sessions: dict[str, dict] = {}
_session_order: list[str] = []


def _save():
    """持久化到 JSON 文件"""
    os.makedirs(DATA_PATH, exist_ok=True)
    data = {"sessions": _sessions, "order": _session_order}
    with open(SESSION_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def _load():
    """从 JSON 文件加载"""
    global _sessions, _session_order
    if os.path.exists(SESSION_FILE):
        try:
            with open(SESSION_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            _sessions = data.get("sessions", {})
            _session_order = data.get("order", [])
        except Exception:
            _sessions = {}
            _session_order = []


# 启动时加载
_load()


def get_or_create_session(session_id: str) -> dict:
    if session_id not in _sessions:
        _sessions[session_id] = {
            "id": session_id,
            "title": "",
            "messages": [],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        }
        _session_order.append(session_id)
        while len(_session_order) > MAX_SESSIONS:
            old_id = _session_order.pop(0)
            _sessions.pop(old_id, None)
        _save()
    return _sessions[session_id]


def update_session(session_id: str, title: str = "", messages: Optional[list] = None):
    session = get_or_create_session(session_id)
    if title and not session["title"]:
        session["title"] = title[:50]
    if messages is not None:
        session["messages"] = messages
    session["updated_at"] = datetime.now().isoformat()
    _save()


def list_sessions() -> list[dict]:
    result = []
    for sid in reversed(_session_order):
        s = _sessions.get(sid)
        if not s:
            continue
        title = s["title"] or (s["messages"][0]["content"][:30] if s["messages"] else "空会话")
        result.append({
            "id": s["id"],
            "title": title,
            "message_count": len(s["messages"]),
            "created_at": s.get("created_at", ""),
            "updated_at": s.get("updated_at", ""),
        })
    return result


def get_session(session_id: str) -> Optional[dict]:
    return _sessions.get(session_id)


def delete_session(session_id: str):
    _sessions.pop(session_id, None)
    if session_id in _session_order:
        _session_order.remove(session_id)
    _save()
