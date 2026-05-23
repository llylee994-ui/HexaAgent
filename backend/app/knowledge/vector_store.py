"""向量存储管理器（TF-IDF 本地方案，中文分词优化）"""

import json
import os
import re
import warnings
import numpy as np

warnings.filterwarnings("ignore", category=UserWarning, module="sklearn")
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "chroma_db")
INDEX_FILE = "guji_index.json"


def _tokenize_chinese(text: str) -> str:
    """简单中文分词：按单字+词组切分，保留 2-4 字滑动窗口"""
    # 提取中文字符
    chars = re.findall(r'[一-鿿]+', text)
    result = ' '.join(chars)  # 词级
    # 双字词组
    bigrams = []
    for word in chars:
        for i in range(len(word) - 1):
            bigrams.append(word[i:i + 2])
    return result + ' ' + ' '.join(bigrams)


class VectorStore:
    """TF-IDF 向量存储（纯本地，零网络依赖）"""

    def __init__(self, path: str = DB_PATH):
        os.makedirs(path, exist_ok=True)
        self.index_path = os.path.join(path, INDEX_FILE)
        self.chunks: list[dict] = []
        self.docs: list[str] = []
        self.vectorizer: TfidfVectorizer | None = None
        self.matrix = None
        self._load()

    def _load(self):
        """从磁盘加载索引"""
        if os.path.exists(self.index_path):
            try:
                with open(self.index_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                self.chunks = data.get("chunks", [])
                self.docs = [c["content"] for c in self.chunks]
                if self.docs:
                    self._build_index()
            except Exception:
                self.chunks = []
                self.docs = []

    def _save(self):
        """保存索引到磁盘"""
        data = {"chunks": self.chunks}
        with open(self.index_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def _build_index(self):
        """构建 TF-IDF 矩阵"""
        if not self.docs:
            return
        self.vectorizer = TfidfVectorizer(
            tokenizer=_tokenize_chinese,
            max_features=5000,
            ngram_range=(1, 2),
        )
        self.matrix = self.vectorizer.fit_transform(self.docs)

    def add_chunks(self, chunks: list[dict]):
        """批量添加文本切片"""
        for c in chunks:
            self.chunks.append(c)
            self.docs.append(c["content"])
        self._build_index()
        self._save()

    def search(self, query: str, n_results: int = 4) -> list[dict]:
        """余弦相似度检索"""
        if self.matrix is None or not self.chunks:
            return []

        query_vec = self.vectorizer.transform([query])
        sims = cosine_similarity(query_vec, self.matrix)[0]
        top_indices = np.argsort(sims)[::-1][:n_results]

        items = []
        for idx in top_indices:
            if sims[idx] > 0:
                items.append({
                    "id": f"chunk_{idx}",
                    "content": self.chunks[idx]["content"],
                    "metadata": self.chunks[idx].get("metadata", {}),
                    "score": float(sims[idx]),
                })
        return items

    def count(self) -> int:
        return len(self.chunks)

    def clear(self):
        """清空索引"""
        self.chunks = []
        self.docs = []
        self.vectorizer = None
        self.matrix = None
        if os.path.exists(self.index_path):
            os.remove(self.index_path)
