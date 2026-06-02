"""向量存储管理器（text2vec 语义模型 + TF-IDF 兜底）"""

import json
import os
import numpy as np

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "chroma_db")
INDEX_FILE = "guji_index.json"
MODEL_NAME = "shibing624/text2vec-base-chinese"


class VectorStore:
    """语义向量存储（text2vec 优先，TF-IDF 兜底）"""

    def __init__(self, path: str = DB_PATH):
        os.makedirs(path, exist_ok=True)
        self.index_path = os.path.join(path, INDEX_FILE)
        self.chunks: list[dict] = []
        self.embeddings: np.ndarray | None = None
        self.model = None
        self._load()

    def _get_model(self):
        """懒加载 text2vec 语义模型"""
        if self.model is not None:
            return self.model
        try:
            from text2vec import SentenceModel
            self.model = SentenceModel(MODEL_NAME)
            return self.model
        except Exception:
            return None

    def _embed(self, texts: list[str]) -> np.ndarray | None:
        model = self._get_model()
        if model is None:
            return None
        return model.encode(texts, normalize_embeddings=True, show_progress_bar=False)

    def _load(self):
        if os.path.exists(self.index_path):
            try:
                with open(self.index_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                self.chunks = data.get("chunks", [])
                emb_list = data.get("embeddings")
                if emb_list and len(emb_list) == len(self.chunks):
                    self.embeddings = np.array(emb_list)
            except Exception:
                self.chunks = []
                self.embeddings = None

    def _save(self):
        data = {"chunks": self.chunks}
        if self.embeddings is not None and len(self.embeddings) == len(self.chunks):
            data["embeddings"] = self.embeddings.tolist()
        with open(self.index_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def add_chunks(self, chunks: list[dict]):
        docs = [c["content"] for c in chunks]
        self.chunks.extend(chunks)

        # 尝试用 text2vec 生成向量
        new_embs = self._embed(docs)
        if new_embs is not None and self.embeddings is not None:
            self.embeddings = np.vstack([self.embeddings, new_embs])
        elif new_embs is not None:
            self.embeddings = new_embs

        self._save()

    def search(self, query: str, n_results: int = 4) -> list[dict]:
        if not self.chunks:
            return []

        docs = [c["content"] for c in self.chunks]

        # text2vec 语义分
        semantic_scores = None
        if self.embeddings is not None and len(self.embeddings) == len(self.chunks):
            q_emb = self._embed([query])
            if q_emb is not None:
                from sklearn.metrics.pairwise import cosine_similarity
                semantic_scores = cosine_similarity(q_emb, self.embeddings)[0]

        # BM25 关键词分
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity
        vec = TfidfVectorizer(max_features=5000, ngram_range=(1, 2), sublinear_tf=True)
        matrix = vec.fit_transform(docs)
        q_vec = vec.transform([query])
        bm25_scores = cosine_similarity(q_vec, matrix)[0]

        # 混合打分：语义 0.6 + BM25 0.4
        if semantic_scores is not None:
            combined = semantic_scores * 0.6 + bm25_scores * 0.4
        else:
            combined = bm25_scores

        top = np.argsort(combined)[::-1][:n_results]

        items = []
        for idx in top:
            score = float(combined[idx])
            if score > 0.1:
                items.append({
                    "id": f"chunk_{idx}",
                    "content": docs[idx],
                    "metadata": self.chunks[idx].get("metadata", {}),
                    "score": score,
                })
        return items

    def count(self) -> int:
        return len(self.chunks)

    def clear(self):
        self.chunks = []
        self.embeddings = None
        self.model = None
        if os.path.exists(self.index_path):
            os.remove(self.index_path)
