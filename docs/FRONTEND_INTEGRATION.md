# 前端集成指南

> 本文档面向前端开发者，说明如何集成 json-render 渲染 AI 生成的 UI。

## 原理

```
后端 (Python/Node.js)              前端 (React)
┌─────────────────────┐           ┌─────────────────────┐
│  1. 接收用户 prompt  │           │  3. 接收 JSONL 流    │
│  2. 调用 LLM        │  ──────→  │  4. 解析成组件树     │
│  3. 返回 JSONL 流   │           │  5. 渲染真实 UI      │
└─────────────────────┘           └─────────────────────┘
```

**核心概念：**
- 后端返回的是 **JSONL**（每行一个 JSON 对象）
- 前端负责 **解析 + 渲染**
- 组件受 **Catalog** 约束（白名单机制）

---

## 快速开始

### 1. 安装依赖

```bash
npm install @json-render/react @json-render/core
# 如果使用 K 线图
npm install lightweight-charts
```

### 2. 复制组件目录

从 `examples/dashboard/components/ui/` 复制所有文件到你的项目：

```
your-project/
├── components/
│   └── ui/
│       ├── index.ts           # 组件注册表（必须）
│       ├── card.tsx
│       ├── chart.tsx
│       ├── table.tsx
│       ├── metric.tsx
│       ├── candlestick-chart.tsx
│       └── ...
```

### 3. 创建渲染页面

```tsx
"use client";

import { useState } from "react";
import { DataProvider, Renderer } from "@json-render/react";
import { componentRegistry } from "@/components/ui";

// 后端地址
const API_URL = "http://your-backend:8000/api/generate";

export default function AIPage() {
  const [elements, setElements] = useState<any[]>([]);
  const [data, setData] = useState({});  // 业务数据
  const [loading, setLoading] = useState(false);

  // 调用后端生成 UI
  const generate = async (prompt: string, inputData: object) => {
    setLoading(true);
    setData(inputData);
    setElements([]);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, data: inputData }),
    });

    // 流式读取 JSONL
    const reader = response.body!.getReader();
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
          try {
            const element = JSON.parse(line);
            setElements(prev => [...prev, element]);
          } catch (e) {
            console.warn("Invalid JSON:", line);
          }
        }
      }
    }

    setLoading(false);
  };

  // 构建 tree 结构
  const tree = {
    elements: Object.fromEntries(
      elements.map((el, i) => [i.toString(), el])
    ),
    rootIds: elements.map((_, i) => i.toString()),
  };

  return (
    <DataProvider initialData={data}>
      <button onClick={() => generate("显示销售仪表盘", { sales: 12500 })}>
        生成
      </button>

      {elements.length > 0 && (
        <Renderer
          tree={tree}
          registry={componentRegistry}
          loading={loading}
        />
      )}
    </DataProvider>
  );
}
```

---

## 核心 API

### DataProvider

提供数据上下文，组件通过 `valuePath` / `dataPath` 引用数据。

```tsx
<DataProvider initialData={{ user: { name: "张三" }, sales: 12500 }}>
  {children}
</DataProvider>
```

### Renderer

渲染组件树。

```tsx
<Renderer
  tree={{
    elements: { "0": { type: "Card", props: { title: "标题" } } },
    rootIds: ["0"],
  }}
  registry={componentRegistry}
  loading={false}
/>
```

### componentRegistry

组件映射表，定义可用组件。

```tsx
// components/ui/index.ts
export const componentRegistry = {
  Card,
  Chart,
  Table,
  Metric,
  // ...你的组件
};
```

---

## JSONL 格式说明

后端返回的每一行是一个 JSON 对象：

```jsonl
{"type":"Card","props":{"title":"销售概览","children":[...]}}
{"type":"Metric","props":{"label":"总收入","valuePath":"/sales"}}
```

### 组件结构

```typescript
interface Element {
  type: string;        // 组件名，必须在 registry 中存在
  props: {
    // 静态属性
    title?: string;
    label?: string;

    // 数据绑定（JSON Pointer 格式）
    valuePath?: string;   // 单值绑定，如 "/user/name"
    dataPath?: string;    // 数组绑定，如 "/orders"

    // 嵌套子组件
    children?: Element[];
  };
}
```

### 数据绑定示例

```tsx
// 数据
const data = {
  user: { name: "张三" },
  orders: [
    { id: 1, amount: 100 },
    { id: 2, amount: 200 },
  ],
};

// JSONL
{"type":"Text","props":{"valuePath":"/user/name"}}     // 渲染 "张三"
{"type":"Table","props":{"dataPath":"/orders"}}        // 渲染订单表格
```

---

## 可用组件列表

### 布局组件
| 组件 | 用途 | 关键 Props |
|------|------|-----------|
| Stack | 垂直/水平布局 | `direction`, `gap`, `children` |
| Grid | 网格布局 | `columns`, `gap`, `children` |
| Card | 卡片容器 | `title`, `children` |

### 展示组件
| 组件 | 用途 | 关键 Props |
|------|------|-----------|
| Heading | 标题 | `level`, `text` |
| Text | 文本 | `content` 或 `valuePath` |
| Metric | 指标卡 | `label`, `valuePath`, `trend` |
| Badge | 徽章 | `text`, `variant` |
| Table | 表格 | `dataPath`, `columns` |

### 图表组件
| 组件 | 用途 | 关键 Props |
|------|------|-----------|
| Chart | 通用图表 | `type`, `dataPath`, `xKey`, `yKey` |
| CandlestickChart | K线图 | `dataPath`, `showVolume`, `showMA` |
| MiniChart | 迷你走势 | `dataPath`, `color` |

### 股票组件
| 组件 | 用途 | 关键 Props |
|------|------|-----------|
| StockQuote | 股票报价 | `symbolPath`, `pricePath`, `changePath` |
| OrderBook | 盘口 | `bidsPath`, `asksPath` |
| TickerTape | 滚动行情 | `dataPath`, `speed` |
| PriceAlert | 价格预警 | `symbolPath`, `targetPath`, `severity` |

### 交互组件
| 组件 | 用途 | 关键 Props |
|------|------|-----------|
| Button | 按钮 | `label`, `action` |
| Alert | 提示框 | `title`, `message`, `severity` |

---

## 常见问题

### Q: 组件不渲染？
检查：
1. `type` 是否在 `componentRegistry` 中注册
2. `props` 格式是否正确
3. `dataPath` 指向的数据是否存在

### Q: 数据绑定不生效？
确保：
1. 使用 `DataProvider` 包裹
2. `valuePath` 使用 JSON Pointer 格式（以 `/` 开头）
3. 数据结构与路径匹配

### Q: 如何添加自定义组件？
1. 创建组件文件 `components/ui/my-component.tsx`
2. 在 `index.ts` 中导出并注册
3. 告知后端新增组件的 props 结构

---

## 完整示例

见 `examples/dashboard/` 目录。
