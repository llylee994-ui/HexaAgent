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

        from sklearn.metrics.pairwise import cosine_similarity

        # text2vec 语义检索（宽召回）
        if self.embeddings is not None and len(self.embeddings) == len(self.chunks):
            q_emb = self._embed([query])
            if q_emb is not None:
                sem_scores = cosine_similarity(q_emb, self.embeddings)[0]
                # 取 top-20 候选
                wide_top = np.argsort(sem_scores)[::-1][:min(20, len(docs))]

                # BM25 在候选集中精排
                candidate_docs = [docs[i] for i in wide_top]
                from sklearn.feature_extraction.text import TfidfVectorizer

                vec = TfidfVectorizer(max_features=3000, ngram_range=(1, 2), sublinear_tf=True)
                cand_matrix = vec.fit_transform(candidate_docs)
                q_vec = vec.transform([query])
                kw_scores = cosine_similarity(q_vec, cand_matrix)[0]

                # 语义分归一 + 关键词分归一 → 合并
                sem_sub = sem_scores[wide_top]
                sem_norm = (sem_sub - sem_sub.min()) / (sem_sub.max() - sem_sub.min() + 1e-8)
                kw_norm = (kw_scores - kw_scores.min()) / (kw_scores.max() - kw_scores.min() + 1e-8)
                combined = sem_norm * 0.55 + kw_norm * 0.45

                final_top = np.argsort(combined)[::-1][:n_results]
                items = []
                seen = set()
                for pos in final_top:
                    idx = wide_top[pos]
                    content = docs[idx]
                    key = content[:100]
                    if key in seen:  # 去重
                        continue
                    seen.add(key)
                    items.append({
                        "id": f"chunk_{idx}",
                        "content": content,
                        "metadata": self.chunks[idx].get("metadata", {}),
                        "score": float(combined[pos]),
                    })
                if items:
                    return items

        # 纯 text2vec 兜底
        return self._simple_search(query, docs, n_results)

    def _simple_search(self, query: str, docs: list[str], n_results: int) -> list[dict]:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity

        vec = TfidfVectorizer(max_features=5000, ngram_range=(1, 2), sublinear_tf=True)
        matrix = vec.fit_transform(docs)
        q_vec = vec.transform([query])
        scores = cosine_similarity(q_vec, matrix)[0]
        top = np.argsort(scores)[::-1][:n_results]
        items = []
        seen = set()
        for idx in top:
            if scores[idx] <= 0:
                continue
            key = docs[idx][:100]
            if key in seen:
                continue
            seen.add(key)
            items.append({
                "id": f"chunk_{idx}",
                "content": docs[idx],
                "metadata": self.chunks[idx].get("metadata", {}),
                "score": float(scores[idx]),
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
