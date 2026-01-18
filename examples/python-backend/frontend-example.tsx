/**
 * 前端集成示例 - 连接 Python 后端
 *
 * 这个文件展示了如何在 React 中消费 Python 后端的 JSONL 流
 *
 * 使用方法：
 * 1. 将此代码复制到你的 React 项目中
 * 2. 安装依赖: npm install @json-render/react
 * 3. 复制 components/ui 目录到你的项目
 * 4. 修改 PYTHON_BACKEND_URL 为你的后端地址
 */

"use client";

import { useState, useCallback } from "react";

// ============================================
// 配置：修改为你的 Python 后端地址
// ============================================
const PYTHON_BACKEND_URL = "http://localhost:8000";

// ============================================
// 方法一：使用 @json-render/react 官方 Hook（推荐）
// ============================================

import {
  DataProvider,
  ActionProvider,
  VisibilityProvider,
  Renderer,
} from "@json-render/react";
import { componentRegistry } from "@/components/ui";

// 自定义 Hook：连接 Python 后端的流式 UI 生成
function usePythonUIStream() {
  const [elements, setElements] = useState<any[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const send = useCallback(async (prompt: string, data: object = {}) => {
    setIsStreaming(true);
    setError(null);
    setElements([]);

    try {
      const response = await fetch(`${PYTHON_BACKEND_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, data }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // 按换行符分割，处理每一行 JSON
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // 最后一行可能不完整，保留到下次

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          try {
            const element = JSON.parse(trimmed);
            setElements((prev) => [...prev, element]);
          } catch (e) {
            console.warn("跳过无效 JSON:", trimmed);
          }
        }
      }

      // 处理缓冲区剩余内容
      if (buffer.trim()) {
        try {
          const element = JSON.parse(buffer.trim());
          setElements((prev) => [...prev, element]);
        } catch (e) {
          // 忽略
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setIsStreaming(false);
    }
  }, []);

  const clear = useCallback(() => {
    setElements([]);
    setError(null);
  }, []);

  return { elements, isStreaming, error, send, clear };
}

// ============================================
// 示例页面组件
// ============================================

export default function PythonBackendDemo() {
  const [prompt, setPrompt] = useState("");
  const [data, setData] = useState({
    // 示例数据 - 可以是任何你需要的数据
    user: { name: "张三", vip: true },
    stock: {
      symbol: "600519",
      name: "贵州茅台",
      price: 1680.5,
      change: 2.35,
    },
    kline: [
      {
        time: "09:30",
        open: 1665,
        high: 1672,
        low: 1662,
        close: 1670,
        volume: 8500,
      },
      {
        time: "09:35",
        open: 1670,
        high: 1678,
        low: 1668,
        close: 1675,
        volume: 12000,
      },
      {
        time: "09:40",
        open: 1675,
        high: 1682,
        low: 1673,
        close: 1680,
        volume: 15000,
      },
      {
        time: "09:45",
        open: 1680,
        high: 1688,
        low: 1678,
        close: 1685,
        volume: 18000,
      },
      {
        time: "09:50",
        open: 1685,
        high: 1690,
        low: 1680,
        close: 1682,
        volume: 14000,
      },
    ],
  });

  const { elements, isStreaming, error, send, clear } = usePythonUIStream();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    await send(prompt, data);
  };

  // 示例提示词
  const examples = [
    "创建一个欢迎卡片，显示用户名称",
    "显示股票价格和涨跌幅",
    "创建K线图显示股票走势",
    "创建一个仪表盘：顶部显示4个指标，下方是图表",
  ];

  return (
    <DataProvider initialData={data}>
      <VisibilityProvider>
        <ActionProvider handlers={{}}>
          <div
            style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px" }}
          >
            {/* 标题 */}
            <header style={{ marginBottom: 48 }}>
              <h1 style={{ margin: 0, fontSize: 32, fontWeight: 600 }}>
                Python 后端 Demo
              </h1>
              <p style={{ margin: "8px 0 0", color: "#666", fontSize: 16 }}>
                连接到 {PYTHON_BACKEND_URL}
              </p>
            </header>

            {/* 输入表单 */}
            <form onSubmit={handleSubmit} style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="描述你想要的 UI..."
                  disabled={isStreaming}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    fontSize: 16,
                  }}
                />
                <button
                  type="submit"
                  disabled={isStreaming || !prompt.trim()}
                  style={{
                    padding: "12px 24px",
                    background: isStreaming ? "#ccc" : "#000",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 16,
                    cursor: isStreaming ? "not-allowed" : "pointer",
                  }}
                >
                  {isStreaming ? "生成中..." : "生成"}
                </button>
                {elements.length > 0 && (
                  <button
                    type="button"
                    onClick={clear}
                    style={{
                      padding: "12px 16px",
                      background: "transparent",
                      border: "1px solid #ddd",
                      borderRadius: 8,
                      cursor: "pointer",
                    }}
                  >
                    清空
                  </button>
                )}
              </div>

              {/* 示例按钮 */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {examples.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => setPrompt(ex)}
                    style={{
                      padding: "6px 12px",
                      background: "#f5f5f5",
                      border: "1px solid #ddd",
                      borderRadius: 6,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </form>

            {/* 错误提示 */}
            {error && (
              <div
                style={{
                  padding: 16,
                  marginBottom: 24,
                  background: "#fee",
                  border: "1px solid #fcc",
                  borderRadius: 8,
                  color: "#c00",
                }}
              >
                错误: {error.message}
              </div>
            )}

            {/* 渲染区域 */}
            <div
              style={{
                minHeight: 300,
                padding: 24,
                background: "#fafafa",
                border: "1px solid #eee",
                borderRadius: 8,
              }}
            >
              {elements.length === 0 && !isStreaming ? (
                <div
                  style={{ textAlign: "center", padding: 60, color: "#999" }}
                >
                  输入提示词生成 UI
                </div>
              ) : (
                // 使用 json-render 的 Renderer 渲染组件
                <Renderer
                  tree={{
                    elements: Object.fromEntries(
                      elements.map((el, i) => [i.toString(), el]),
                    ),
                    rootIds: elements.map((_, i) => i.toString()),
                  }}
                  registry={componentRegistry}
                  loading={isStreaming}
                />
              )}
            </div>

            {/* 调试：显示原始 JSON */}
            {elements.length > 0 && (
              <details style={{ marginTop: 24 }}>
                <summary style={{ cursor: "pointer", color: "#666" }}>
                  查看 JSON 数据
                </summary>
                <pre
                  style={{
                    marginTop: 8,
                    padding: 16,
                    background: "#f5f5f5",
                    borderRadius: 8,
                    overflow: "auto",
                    fontSize: 12,
                  }}
                >
                  {JSON.stringify(elements, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </ActionProvider>
      </VisibilityProvider>
    </DataProvider>
  );
}

// ============================================
// 方法二：最简版本（不依赖 json-render，纯手动渲染）
// 适合理解原理或极简场景
// ============================================

export function SimpleDemo() {
  const [elements, setElements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generate = async () => {
    setIsLoading(true);
    setElements([]);

    const response = await fetch(`${PYTHON_BACKEND_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "创建3个指标卡片显示收入、用户数、订单数",
        data: {
          metrics: {
            revenue: 125000,
            users: 1234,
            orders: 567,
          },
        },
      }),
    });

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
          const el = JSON.parse(line);
          setElements((prev) => [...prev, el]);
        }
      }
    }

    setIsLoading(false);
  };

  // 简单的手动渲染（不使用 componentRegistry）
  const renderElement = (el: any, key: number) => {
    switch (el.type) {
      case "Card":
        return (
          <div
            key={key}
            style={{
              padding: 16,
              border: "1px solid #ddd",
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            <h3>{el.props.title}</h3>
            {el.props.children?.map((child: any, i: number) =>
              renderElement(child, i),
            )}
          </div>
        );
      case "Metric":
        return (
          <div key={key} style={{ padding: 8 }}>
            <div style={{ color: "#666", fontSize: 12 }}>{el.props.label}</div>
            <div style={{ fontSize: 24, fontWeight: 600 }}>
              {el.props.valuePath}
            </div>
          </div>
        );
      case "Text":
        return <p key={key}>{el.props.content}</p>;
      default:
        return <div key={key}>Unknown: {el.type}</div>;
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <button onClick={generate} disabled={isLoading}>
        {isLoading ? "生成中..." : "生成 UI"}
      </button>
      <div style={{ marginTop: 24 }}>{elements.map(renderElement)}</div>
    </div>
  );
}
