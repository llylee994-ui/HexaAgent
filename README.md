# 🔮 HexaAgent — 六爻解卦智能体

基于 LangChain 和 DeepSeek 的六爻解卦 AI Agent。不仅能装卦、断卦，还能像真正的六爻高手一样进行多步推理、按需调用排盘工具、检索古籍案例，并根据用户水平自动调整解说风格。本项目旨在展示如何将传统东方玄学与现代 AI Agent 技术深度融合，构建可解释、有记忆、能推理的智能系统。

## ✨ 核心特性

- **真·Agent 架构**：Agent 自主规划推理步骤——先排盘，再用神，后断卦，最后生成解读。
- **工具调用**：纳甲排盘器、旺衰判断器、用神锁定器、古籍案例检索器，按需调用。
- **RAG 增强**：通过 ChromaDB 向量库内置《增删卜易》《卜筮正宗》等经典案例，断卦有据可依。
- **可视化卦象输入**：支持三种输入模式：
  - **自动模式**：用户只提供公历时间和问题，Agent 自动完成排盘。
  - **可视化手动模式**：交互式卦象编辑器，逐爻点选阴阳/动爻/六亲/地支，支持卦名快捷填充。
  - **文本模式**：高级用户可直接粘贴结构化卦象文本，跳过排盘步骤。
- **自适应表达**：自动判断用户水平，动态切换"大白话模式"或"五行术语模式"。
- **持久记忆**：短期记忆（当前对话上下文）+ 长期记忆（ChromaDB 存储历史卦例摘要及 embedding），支持跨会话个性化与趋势分析。
- **可解释推理链**：前端展示 Agent 完整思维链，从卦象到结论的推导过程完全透明。

## 🧠 系统架构

```
用户界面 (React + TailwindCSS)
     │
     ├─ 聊天窗口 (ChatWindow)
     ├─ 可视化卦象编辑器 (HexagramEditor)  ← 核心交互组件
     ├─ 思维链展示 (ThinkingChain)
     └─ 历史记录面板 (HistoryPanel)
     │
     ▼
后端 API (FastAPI)
     │
     ▼
六爻 Agent 核心 (LangChain Agent Executor)
     │
     ├─ 意图识别模块：新手/专家？问何事？
     ├─ 规划与调度：决定调用哪些工具、按什么顺序
     │
     ├─ 工具集 (Tools)：
     │   ├─ 🛠️ 排盘工具 (LiuyaoPlanner)：纳甲、六亲、世应、空亡、神煞
     │   ├─ 🛠️ 旺衰分析工具 (WangShuai)：月建日辰冲合、生克力量计算
     │   ├─ 🛠️ 用神锁定工具 (YongShen)：根据问题意图自动聚焦用神
     │   └─ 🛠️ 古籍检索工具 (GujiSearch)：基于 RAG 的案例检索
     │
     ├─ 记忆系统：
     │   ├─ 短期记忆 (ConversationBufferMemory)
     │   └─ 长期记忆 (ChromaDB 存储历史卦例摘要向量)
     │
     └─ 表达层：
         ├─ 小白翻译器：将术语转为生活化比喻
         └─ 结构化输出：结论、推理过程、风险提示、应期
```

## 🛠️ 技术栈

| 层级 | 技术 | 作用 |
|------|------|------|
| 前端 | React + TailwindCSS + zustand | 聊天界面、可视化卦象编辑器、思维链展示、状态管理 |
| 后端 | FastAPI | RESTful API，会话与用户管理 |
| Agent 框架 | LangChain (Python) | Agent Executor、工具定义、思维链、记忆管理 |
| 大语言模型 | DeepSeek API（可替换为任意 OpenAI 兼容接口） | Agent 大脑，负责推理、规划和生成 |
| 向量数据库 | ChromaDB | 古籍案例语义检索 + 长期记忆向量存储 |
| 排盘核心 | 纯 Python（自定义规则） | 万年历、天干地支、纳甲装卦，零外部依赖 |
| 长期记忆 | ChromaDB（复用同一向量库） | 历史卦例摘要及 embedding 存储 |

## 🔄 核心工作流

以一次自动排盘的完整流程为例：

1. **用户输入**：通过前端聊天框或可视化卦象编辑器发送："我最近想换工作，能成吗？我的生辰是1990年5月20日。"

2. **API 接收与上下文组装**：后端将消息与 sessionId 转发给 Agent。

3. **Agent 第一步推理（规划）**：
   - "用户问事业，需先获取卦象。"
   - "调用排盘工具，参数：当前时间。"

4. **工具执行与返回**：排盘工具输出标准卦象 JSON（含五行、六亲、世应、空亡、动变等）。

5. **Agent 第二步推理（分析）**：
   - "卦象已出，问事业，需锁定用神官鬼爻。"
   - "调用用神锁定工具，参数：问题='换工作'，卦象=…"
   - "调用旺衰分析工具，参数：用神官鬼午火，月建寅，日辰子。"

6. **Agent 第三步推理（增强与生成）**：
   - "官鬼午火动化回头克，日辰子水冲克。调用古籍检索工具，搜索'官鬼 动化回头克 事业'。"
   - "检索到《增删卜易》相似案例：官鬼动化回头克，忌神无制，主有灾非。"

7. **最终生成**：Agent 综合所有信息，输出分层解读：
   - **白话版**："目前跳槽时机不太好，新工作压力巨大，还可能遇到不靠谱的承诺。建议夏天（火旺之月）再做打算。"
   - **专业版**：完整五行生克分析、应期推导。
   - **思维链**：三步推理过程以可视化格式返回，供前端展示。

## 📁 项目结构

```
hexa-agent/
├── frontend/                    # React 前端
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── ChatWindow/      # 聊天窗口
│       │   ├── HexagramEditor/  # 可视化卦象编辑器（核心组件）
│       │   ├── ThinkingChain/   # 思维链展示
│       │   └── HistoryPanel/    # 历史记录
│       ├── hooks/               # API 调用 hooks
│       ├── stores/              # zustand 状态管理
│       ├── types/               # TypeScript 类型定义
│       └── App.tsx
├── backend/                     # FastAPI 后端
│   ├── app/
│   │   ├── api/                 # 路由：chat, history, hexagram
│   │   ├── core/                # 配置、Agent 初始化
│   │   ├── agents/              # LangChain Agent 定义
│   │   ├── tools/               # 自定义工具（排盘、旺衰、用神、检索）
│   │   ├── memory/              # 长期记忆管理
│   │   ├── knowledge/           # 古籍数据导入、向量化脚本
│   │   └── models/              # Pydantic 数据模型
│   ├── data/                    # 古籍原文
│   ├── requirements.txt
│   └── main.py
├── docs/                        # 详细架构文档、接口说明
├── .env.example
├── README.md
└── LICENSE
```

## 🚀 快速开始

### 前提条件

- Python 3.10+
- Node.js 18+
- DeepSeek API Key（或任意兼容 OpenAI 接口的 Key）

### 一键启动

```bash
# Windows 直接双击运行
start.bat

# macOS / Linux / Git Bash
./start.sh
```

两个服务会自动启动：
- 后端 API → http://localhost:8000/docs
- 前端 UI → http://localhost:5173

### 手动安装

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 初始化古籍向量库（仅首次）
python scripts/init_knowledge_base.py

# 配置环境变量
cp .env.example .env
# 编辑 .env，填入 DEEPSEEK_API_KEY

# 启动后端服务
uvicorn app.main:app --reload
```

### 前端安装

```bash
cd frontend
npm install
npm run dev
```

访问 http://localhost:3000 即可开始对话。

## 🖱️ 可视化卦象输入

手动输入无需记忆干支格式，通过交互式编辑器逐爻配置：

```
┌──────────────────────────────────────────┐
│  排盘方式：[自动排盘] [手动输入]          │
├──────────────────────────────────────────┤
│                                          │
│  快捷选择：[天风姤 ▾] [一键填充]          │
│                                          │
│  上爻  [⚊ ⚋] [动]  父母▾  戌土▾         │
│  五爻  [⚊ ⚋] [动]  兄弟▾  申金▾  应     │
│  四爻  [⚊ ⚋] [动]  官鬼▾  午火▾         │
│  三爻  [⚊ ⚋] [动]  兄弟▾  酉金▾         │
│  二爻  [⚊ ⚋] [动]  子孙▾  亥水▾  世     │
│  初爻  [⚊ ⚋] [动]  父母▾  丑土▾         │
│                                          │
│  月建：[巳▾]  日辰：[卯▾]  旬空：[辰巳▾] │
│                                          │
│  问题：看这笔投资合作能否成功。            │
│  [提交断卦]                               │
└──────────────────────────────────────────┘
```

### 卦象数据模型 (JSON Schema)

前端编辑器与后端共用此模型，无论自动排盘还是手动输入，统一此格式传输：

```json
{
  "mode": "manual",
  "hexagram_name": "天风姤",
  "changed_to": "天水讼",
  "yao_lines": [
    {"position": 1, "type": "yin", "changing": true,  "liuqin": "父母", "dizhi": "丑土", "original_line": null},
    {"position": 2, "type": "yang","changing": false, "liuqin": "子孙", "dizhi": "亥水", "original_line": null, "shi_ying": "shi"},
    {"position": 3, "type": "yang","changing": false, "liuqin": "兄弟", "dizhi": "酉金", "original_line": null},
    {"position": 4, "type": "yang","changing": true,  "liuqin": "官鬼", "dizhi": "午火", "original_line": null},
    {"position": 5, "type": "yang","changing": false, "liuqin": "兄弟", "dizhi": "申金", "original_line": null, "shi_ying": "ying"},
    {"position": 6, "type": "yang","changing": false, "liuqin": "父母", "dizhi": "戌土", "original_line": null}
  ],
  "yue_jian": "巳",
  "ri_chen": "卯",
  "xun_kong": ["辰", "巳"],
  "question": "看这笔投资合作能否成功。",
  "user_level": "beginner"
}
```

### 手动输入的结构化文本（高级模式）

资深用户可在聊天框直接粘贴此格式，Agent 将跳过排盘步骤直接进入分析：

```text
公历2026年5月19日未时。四柱：丙午 癸巳 癸卯 己未。
主卦《天风姤》之《天水讼》。初爻、四爻动。
世爻在二爻，妻财丑土持世。应爻在五爻，官鬼午火临应。
完整六爻：
初爻：父母 丑土 (动) → 妻财 寅木
二爻：子孙 亥水 (世)
三爻：兄弟 酉金
四爻：官鬼 午火 (动) → 兄弟 午火
五爻：兄弟 申金 (应)
上爻：父母 戌土
特殊状态：日辰卯，旬空辰巳。月建巳，亥水月破。二爻亥水既月破又旬空。
问题：看这笔投资合作能否成功。
```

## 🗺️ 开发路线图

### 里程碑一：核心可用（排盘 + 断卦 API）

- Python 六爻排盘引擎（纳甲、六亲、世应、空亡、神煞）
- 输出标准化 JSON 卦象
- LangChain Agent 集成排盘工具，实现基础自动断卦
- FastAPI `/api/chat` 端点，支持单轮对话

### 里程碑二：可交互（可视化输入 + 聊天前端）

- 可视化卦象编辑器组件（逐爻配置 + 卦名快捷填充）
- 聊天窗口 + 思维链展示 + 历史面板
- 手动/自动/文本三合一输入模式
- 前后端卦象 JSON Schema 统一与联调

### 里程碑三：增强系统（RAG + 记忆 + 自适应）

- ChromaDB 古籍案例导入与语义检索工具
- 长期记忆系统（历史卦例 embedding 存储与回溯）
- 短期记忆集成（ConversationBufferMemory）
- 自适应表达（小白/专家模式自动切换）
- 测试、文档与开源准备

## 📄 License

MIT
