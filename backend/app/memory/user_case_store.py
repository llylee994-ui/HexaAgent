"""用户历史卦例持久化存储（JSON + TF-IDF 检索）"""

import json
import os
import warnings
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re

warnings.filterwarnings("ignore", category=UserWarning, module="sklearn")

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")
MAX_CASES = 200  # 最多保留 200 条卦例


def _tokenize(text: str) -> str:
    """简单中文分词"""
    chars = re.findall(r'[一-鿿]+', text)
    result = ' '.join(chars)
    bigrams = []
    for word in chars:
        for i in range(len(word) - 1):
            bigrams.append(word[i:i + 2])
    return result + ' ' + ' '.join(bigrams)


class UserCaseStore:
    """用户卦例存储：JSON 持久化 + TF-IDF 语义检索"""

    def __init__(self):
        self.file_path = os.path.join(DATA_PATH, "user_cases.json")
        self.cases: list[dict] = []
        self.vectorizer = None
        self.matrix = None
        self._load()

    def _load(self):
        if os.path.exists(self.file_path):
            try:
                with open(self.file_path, "r", encoding="utf-8") as f:
                    self.cases = json.load(f)
            except Exception:
                self.cases = []
        self._rebuild_index()

    def _save(self):
        # Trim to MAX_CASES
        if len(self.cases) > MAX_CASES:
            self.cases = self.cases[-MAX_CASES:]
        with open(self.file_path, "w", encoding="utf-8") as f:
            json.dump(self.cases, f, ensure_ascii=False, indent=2)

    def _rebuild_index(self):
        if not self.cases:
            return
        texts = [c.get("summary", "") for c in self.cases]
        self.vectorizer = TfidfVectorizer(tokenizer=_tokenize, max_features=3000, ngram_range=(1, 2))
        self.matrix = self.vectorizer.fit_transform(texts)

    def add_case(self, session_id: str, question: str, hexagram_name: str,
                 changed_to: str = "", key_yao_info: str = "", answer_summary: str = ""):
        """添加一条用户卦例"""
        # 摘要：合并卦象关键信息 + 问题 + AI 判断首句
        summary = f"问：{question}。卦：{hexagram_name}"
        if changed_to:
            summary += f" 变{changed_to}"
        if key_yao_info:
            summary += f"。关键：{key_yao_info}"
        if answer_summary:
            summary += f"。断：{answer_summary}"

        case = {
            "session_id": session_id,
            "question": question,
            "hexagram_name": hexagram_name,
            "changed_to": changed_to,
            "key_yao_info": key_yao_info,
            "answer_summary": answer_summary,
            "summary": summary,
            "timestamp": __import__("datetime").datetime.now().isoformat(),
        }
        self.cases.append(case)
        self._rebuild_index()
        self._save()

    def search(self, query: str, n_results: int = 3) -> list[dict]:
        """检索相似历史卦例"""
        if self.matrix is None or not self.cases:
            return []

        query_vec = self.vectorizer.transform([query])
        sims = cosine_similarity(query_vec, self.matrix)[0]
        top_indices = np.argsort(sims)[::-1][:n_results]

        items = []
        for idx in top_indices:
            if sims[idx] > 0.05:
                items.append({**self.cases[idx], "score": float(sims[idx])})
        return items

    def count(self) -> int:
        return len(self.cases)
