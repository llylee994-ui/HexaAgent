"""初始化古籍知识库

用法:
  python scripts/init_kb.py              # 加载种子案例
  python scripts/init_kb.py --reset      # 清空后重新加载
  python scripts/init_kb.py --texts      # 从 data/texts/ 加载 .txt 文件
"""

import json
import os
import sys
import argparse

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.knowledge.vector_store import VectorStore
from app.knowledge.chunker import chunk_text, chunk_simple_lines


def load_seed_cases(store: VectorStore):
    """加载精选种子案例"""
    seed_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "seed_cases.json")
    with open(seed_path, "r", encoding="utf-8") as f:
        cases = json.load(f)

    chunks = []
    for case in cases:
        chunks.append({
            "content": f"【{case['source']}】{case['keywords']}\n{case['content']}",
            "metadata": {
                "source": case["source"],
                "chunk_type": "case",
                "keywords": case.get("keywords", ""),
                "index": len(chunks),
            }
        })

    store.add_chunks(chunks)
    print(f"已加载 {len(chunks)} 条种子案例（来源：{set(c['source'] for c in cases)}）")


def load_text_files(store: VectorStore):
    """从 data/texts/ 目录加载所有 .txt 文件"""
    texts_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "texts")
    if not os.path.isdir(texts_dir):
        print("data/texts/ 目录不存在，跳过文本导入")
        return

    total = 0
    for fname in sorted(os.listdir(texts_dir)):
        if not fname.endswith(".txt"):
            continue
        fpath = os.path.join(texts_dir, fname)
        with open(fpath, "r", encoding="utf-8") as f:
            text = f.read()

        source = fname.replace(".txt", "")
        chunks = chunk_text(text, source=source)
        store.add_chunks(chunks)
        total += len(chunks)
        print(f"  {fname}: {len(chunks)} chunks")

    print(f"文本文件共导入 {total} chunks")


def main():
    parser = argparse.ArgumentParser(description="初始化六爻古籍知识库")
    parser.add_argument("--reset", action="store_true", help="清空现有数据")
    parser.add_argument("--texts", action="store_true", help="同时加载 data/texts/ 中的 .txt 文件")
    args = parser.parse_args()

    store = VectorStore()

    if args.reset:
        store.clear()
        print("已清空知识库")

    # 始终加载种子案例
    load_seed_cases(store)

    # 可选加载文本文件
    if args.texts:
        load_text_files(store)

    print(f"\n知识库总计: {store.count()} 条记录")
    print("初始化完成！")


if __name__ == "__main__":
    main()
