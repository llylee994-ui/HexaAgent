"""古籍文本切片器：按案例/段落拆分"""

import re


def chunk_text(text: str, source: str = "", max_chunk: int = 600, min_chunk: int = 100) -> list[dict]:
    """将古籍文本按案例或段落拆分为 chunks

    识别模式：
    - "占x" / "占xx" → 案例起始
    - "断曰" / "余曰" / "野鹤曰" → 断语
    - 空行 → 段落分界

    Returns: list of {content, metadata:{source, chunk_type, index}}
    """
    # 先按空行分大段
    paragraphs = [p.strip() for p in re.split(r'\n\s*\n', text) if p.strip()]

    chunks = []
    buffer = ""
    chunk_type = "theory"

    for para in paragraphs:
        # 检测案例起始
        is_case_start = bool(re.search(r'^[占].{1,20}[:：]|^[占].{1,10}$', para))

        if is_case_start and buffer:
            # 上一个 chunk 结束
            if len(buffer.strip()) >= min_chunk:
                chunks.append({
                    "content": buffer.strip(),
                    "metadata": {
                        "source": source,
                        "chunk_type": chunk_type,
                        "index": len(chunks),
                    }
                })
            buffer = para
            chunk_type = "case"
        else:
            buffer = (buffer + "\n\n" + para).strip()
            if len(buffer) >= max_chunk:
                chunks.append({
                    "content": buffer[:],
                    "metadata": {
                        "source": source,
                        "chunk_type": chunk_type,
                        "index": len(chunks),
                    }
                })
                buffer = ""

    # 收尾
    if len(buffer.strip()) >= min_chunk:
        chunks.append({
            "content": buffer.strip(),
            "metadata": {
                "source": source,
                "chunk_type": chunk_type,
                "index": len(chunks),
            }
        })

    return chunks


def chunk_simple_lines(text: str, source: str = "", max_chunk: int = 500) -> list[dict]:
    """简单按行分块 —— 适用于按行分割的古籍"""
    lines = text.strip().split('\n')
    chunks = []
    buffer = ""

    for line in lines:
        if len(buffer) + len(line) > max_chunk and buffer:
            chunks.append({
                "content": buffer.strip(),
                "metadata": {"source": source, "chunk_type": "text", "index": len(chunks)}
            })
            buffer = line
        else:
            buffer = (buffer + line + "\n").strip()

    if buffer.strip():
        chunks.append({
            "content": buffer.strip(),
            "metadata": {"source": source, "chunk_type": "text", "index": len(chunks)}
        })

    return chunks
