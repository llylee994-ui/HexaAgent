# HexaAgent &mdash; 六爻解卦智能体

基于 LangChain + DeepSeek 的六爻解卦 AI Agent。自动起卦排盘、三画卦纳甲纳支、六亲五行推算、世应旬空六神，结合 text2vec 古籍语义检索与对话记忆，提供有据可依的六爻断卦解读。前端支持自动排盘、可视化手动编辑、文本输入三种模式，米白抹茶配色，适配桌面端与移动端。

## 特性

- **真 Agent 架构** &mdash; 自主推理&rarr;排盘&rarr;用神&rarr;古籍检索&rarr;断卦
- **三画卦纳甲** &mdash; 上下卦独立查表，本卦变卦均正确纳支
- **六亲自动推算** &mdash; 卦宫五行 vs 爻地支五行，环形生克法
- **六神自动分配** &mdash; 甲乙起青龙，日干驱动
- **空亡自动标记** &mdash; 旬首推算，逐爻标记
- **text2vec 语义检索** &mdash; 文字2向量中文模型 + BM25 混合精排
- **古籍知识库** &mdash; 内置《增删卜易》《卜筮正宗》等 500+ 条目，支持批量 txt 导入和可视化增删改查
- **用户知识库管理** &mdash; 面板编辑/删除/新增，支持从对话多选合并导入
- **自适应表达** &mdash; 自动检测新手/专家，切换白话/术语风格
- **AI 自检** &mdash; 输出前校验六亲、动爻、用神是否与卦象一致
- **深度思考模式** &mdash; 可选 reasoning_effort 低/中/高三档
- **多轮对话记忆** &mdash; 会话 JSON 持久化，刷新不丢失，多端同步
- **移动端适配** &mdash; 响应式布局，浮层面板，底部输入栏

## 快速开始

### 前提

- Python 3.10+
- Node.js 18+
- DeepSeek API Key

### 启动

```bash
git clone https://github.com/llylee994-ui/HexaAgent.git
cd HexaAgent
# 双击 start.bat（Windows）或 ./start.sh（macOS/Linux）
```

首次运行自动安装依赖、初始化知识库。浏览器打开后填写 API Key 即可使用。手机同 WiFi 下访问终端显示的 Network 地址。

## 三种输入模式

| 模式 | 说明 |
|------|------|
| 自动排盘 | 输入问题，Agent 数字起卦 + 纳甲六亲六神空亡全自动 |
| 手动编辑 | 搜索卦名一键填阴阳纳支六亲，支持动爻&rarr;自动变卦、伏神、备注 |
| 文本输入 | 粘贴结构化卦象文本，跳过排盘 |

## 项目结构

```
HexaAgent/
├── start.bat / start.sh         # 一键启动（自动安装依赖+初始化知识库）
├── frontend/                    # React + TypeScript + TailwindCSS
│   └── src/
│       ├── components/          # Layout, ChatWindow, HexagramEditor, KnowledgePanel ...
│       ├── stores/              # zustand 状态管理
│       ├── utils/hexagrams.ts   # 64卦表、纳支、六亲、六神、空亡算法
│       └── hooks/useApi.ts      # API 封装
├── backend/
│   ├── main.py                  # FastAPI 入口（/api/chat, /api/paipan, /api/sessions, /api/knowledge ...）
│   ├── app/
│   │   ├── agent.py             # LangGraph Agent + 3 tools + System Prompt
│   │   ├── config.py            # 环境变量 + settings.json 持久化
│   │   ├── models.py            # Pydantic 数据模型
│   │   ├── session_manager.py   # 会话 JSON 持久化
│   │   ├── core/                # 排盘引擎
│   │   │   ├── ganzhi.py        # 天干地支六十甲子五行
│   │   │   ├── sizhu.py         # 四柱推算
│   │   │   ├── bagua.py         # 八卦 64 卦 + 梅花易数起卦
│   │   │   ├── najia.py         # 三画卦纳甲
│   │   │   ├── liuqin.py        # 六亲（卦宫五行环形法）
│   │   │   ├── shiying.py       # 世应
│   │   │   ├── xunkong.py       # 旬空
│   │   │   ├── liushen.py       # 六神
│   │   │   └── paipan.py        # 排盘主入口
│   │   ├── knowledge/           # 知识库
│   │   │   ├── vector_store.py  # text2vec + BM25 混合检索
│   │   │   └── search_tool.py   # LangChain 检索 Tool
│   │   └── memory/              # 用户长期记忆
│   │       ├── user_case_store.py
│   │       └── memory_tool.py
│   ├── data/texts/              # 古籍 txt 文件（README.txt 说明用法）
│   └── scripts/init_kb.py       # 知识库初始化
└── .env.example                 # API Key 模板
```

## 知识库管理

- 点击标题栏 **知识库** 打开管理面板
- 搜索、编辑、删除、新增条目
- **从对话导入**：勾选多条消息，合并收录（自动带卦象卡数据）
- 将古籍 `.txt` 放入 `backend/data/texts/`，运行 `python scripts/init_kb.py --texts`
- 支持 UTF-8 / GBK 编码

## License

MIT
