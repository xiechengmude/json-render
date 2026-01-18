# Python 后端 + React 前端 集成示例

## 架构

```
Python (FastAPI)          React (Next.js)
     :8000                     :3000
       │                         │
       │   POST /api/generate    │
       │ ◄─────────────────────  │
       │                         │
       │   JSONL Stream          │
       │ ─────────────────────►  │
       │                         │
       ▼                         ▼
   调用 LLM               渲染 UI 组件
```

## 快速开始

### 1. 启动 Python 后端

```bash
cd examples/python-backend

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入你的 API Key

# 启动
python main.py
# 或
uvicorn main:app --reload --port 8000
```

### 2. 启动 React 前端

```bash
cd examples/dashboard

# 修改 API 地址指向 Python 后端
# 编辑 app/page.tsx 中的 fetch URL 改为 http://localhost:8000/api/generate

pnpm dev
```

### 3. 测试

```bash
# 测试后端
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "显示一个用户欢迎卡片", "data": {"user": {"name": "张三"}}}'
```

## API 接口

### POST /api/generate

生成 UI 组件（流式返回）

**请求体：**
```json
{
  "prompt": "用户需求描述",
  "data": {
    "任意数据": "供组件绑定"
  },
  "model": "gpt-4"  // 可选
}
```

**响应：** JSONL 流
```
{"type":"Card","props":{"title":"欢迎","children":[...]}}
{"type":"Text","props":{"content":"你好，张三"}}
```

## 前端集成代码

```tsx
// 最简单的集成方式
import { useState } from "react";
import { JsonRender, DataProvider } from "@json-render/react";
import { componentRegistry } from "./components/ui";

function App() {
  const [elements, setElements] = useState([]);
  const [data, setData] = useState({});

  const generate = async (prompt: string, inputData: object) => {
    setData(inputData);
    setElements([]);

    const response = await fetch("http://localhost:8000/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, data: inputData }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.trim()) {
          const element = JSON.parse(line);
          setElements(prev => [...prev, element]);
        }
      }
    }
  };

  return (
    <DataProvider data={data}>
      <JsonRender elements={elements} components={componentRegistry} />
    </DataProvider>
  );
}
```
