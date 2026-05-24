"""用户历史卦例检索工具"""

from langchain_core.tools import tool
from .user_case_store import UserCaseStore

_store: UserCaseStore | None = None


def get_user_case_store() -> UserCaseStore:
    global _store
    if _store is None:
        _store = UserCaseStore()
    return _store


def create_memory_search_tool():
    """创建用户历史卦例检索工具"""
    store = get_user_case_store()

    @tool
    def user_history_search(query: str) -> str:
        """用户历史卦例检索工具：搜索用户之前问过的卦例，查看过往解读。

        Args:
            query: 搜索查询，如 "跳槽 事业" 或 "投资 财运"

        Returns:
            匹配的历史卦例及之前的断语
        """
        results = store.search(query, n_results=3)
        if not results:
            return "暂无相关历史卦例。"

        parts = []
        for i, r in enumerate(results):
            parts.append(
                f"【历史卦例 {i + 1}】\n"
                f"问题：{r['question']}\n"
                f"卦象：{r.get('hexagram_name', '')}"
                + (f" 变{r['changed_to']}" if r.get('changed_to') else "")
                + f"\n关键信息：{r.get('key_yao_info', '')}\n"
                f"前次断语：{r.get('answer_summary', '')}\n"
            )
        return "\n".join(parts)

    return user_history_search
