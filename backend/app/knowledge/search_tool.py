"""古籍检索 LangChain Tool"""

from langchain_core.tools import tool
from .vector_store import VectorStore

_vector_store: VectorStore | None = None


def get_vector_store() -> VectorStore:
    global _vector_store
    if _vector_store is None:
        _vector_store = VectorStore()
    return _vector_store


def create_guji_search_tool():
    """创建古籍案例检索工具（Agent 可调用）"""
    store = get_vector_store()

    @tool
    def guji_search(query: str) -> str:
        """古籍案例检索工具：根据查询字符串搜索《增删卜易》《卜筮正宗》等古籍中的相似卦例。

        Args:
            query: 搜索查询，建议包含卦象特征关键词，如 "官鬼动化回头克" 或 "世爻旬空 求财"

        Returns:
            匹配的古籍案例及断语，供参考
        """
        results = store.search(query, n_results=3)
        if not results:
            return "未检索到相似古籍案例。"

        output_parts = []
        for i, r in enumerate(results):
            src = r["metadata"].get("source", "未知")
            output_parts.append(f"【古籍案例 {i + 1}】来源：{src}\n{r['content']}\n---")

        return "\n\n".join(output_parts)

    return guji_search
