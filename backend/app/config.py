import json
import os
from dotenv import load_dotenv

load_dotenv()

# 读取 settings.json（优先级高于 .env）
SETTINGS_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "settings.json")
_settings = {}
if os.path.exists(SETTINGS_FILE):
    try:
        with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
            _settings = json.load(f)
    except Exception:
        pass

DEEPSEEK_API_KEY = _settings.get("api_key") or os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_BASE_URL = _settings.get("base_url") or os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com/v1")
MODEL_NAME = _settings.get("model") or os.getenv("MODEL_NAME", "deepseek-chat")


def save_settings(api_key: str, base_url: str, model: str):
    """保存配置到 settings.json"""
    os.makedirs(os.path.dirname(SETTINGS_FILE), exist_ok=True)
    settings = {"api_key": api_key, "base_url": base_url, "model": model}
    with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
        json.dump(settings, f, ensure_ascii=False, indent=2)
    # 更新当前模块变量
    global DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL, MODEL_NAME
    DEEPSEEK_API_KEY = api_key
    DEEPSEEK_BASE_URL = base_url
    MODEL_NAME = model


def is_configured() -> bool:
    return bool(DEEPSEEK_API_KEY and DEEPSEEK_API_KEY != "your_api_key_here")
