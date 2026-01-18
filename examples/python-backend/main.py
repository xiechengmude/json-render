"""
json-render Python 后端示例
运行: pip install fastapi uvicorn openai python-dotenv
启动: uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from openai import OpenAI
import json
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# 允许前端跨域访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# LLM 客户端 (支持 OpenAI / LiteLLM / 任何兼容接口)
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY", "your-key"),
    base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
)

# ============================================
# 核心：Catalog 系统提示词 (组件约束)
# ============================================
CATALOG_SYSTEM_PROMPT = """你是一个 UI 生成器。根据用户需求和提供的数据，生成 JSONL 格式的 UI 组件。

## 输出格式
每行一个 JSON 对象，格式：{"type": "组件名", "props": {...}}

## 可用组件

### 布局组件
- Stack: 垂直/水平布局 {"type":"Stack","props":{"direction":"vertical|horizontal","gap":8,"children":[...]}}
- Grid: 网格布局 {"type":"Grid","props":{"columns":3,"gap":16,"children":[...]}}
- Card: 卡片容器 {"type":"Card","props":{"title":"标题","children":[...]}}

### 展示组件
- Heading: 标题 {"type":"Heading","props":{"level":1-6,"text":"标题文字"}}
- Text: 文本 {"type":"Text","props":{"content":"文本内容"}}
- Metric: 指标卡 {"type":"Metric","props":{"label":"标签","valuePath":"/data/path","trend":"up|down|neutral"}}
- Badge: 徽章 {"type":"Badge","props":{"text":"文字","variant":"success|warning|danger|info"}}
- Table: 表格 {"type":"Table","props":{"dataPath":"/data/path","columns":[{"key":"字段","label":"列名"}]}}

### 图表组件
- Chart: 通用图表 {"type":"Chart","props":{"type":"line|bar|pie","dataPath":"/data/path","xKey":"x轴字段","yKey":"y轴字段"}}
- CandlestickChart: K线图 {"type":"CandlestickChart","props":{"dataPath":"/kline","showVolume":true,"showMA":[5,10,20]}}
- MiniChart: 迷你走势 {"type":"MiniChart","props":{"dataPath":"/data/path","color":"#22c55e"}}

### 股票组件
- StockQuote: 股票报价 {"type":"StockQuote","props":{"symbolPath":"/symbol","pricePath":"/price","changePath":"/change"}}
- OrderBook: 盘口 {"type":"OrderBook","props":{"bidsPath":"/bids","asksPath":"/asks"}}
- TickerTape: 行情带 {"type":"TickerTape","props":{"dataPath":"/tickers","speed":"normal"}}
- PriceAlert: 价格预警 {"type":"PriceAlert","props":{"symbolPath":"/symbol","pricePath":"/price","targetPath":"/target","conditionPath":"/condition","messagePath":"/message","severity":"warning"}}

### 交互组件
- Button: 按钮 {"type":"Button","props":{"label":"按钮文字","action":{"type":"动作类型","payload":{}}}}
- Alert: 提示框 {"type":"Alert","props":{"title":"标题","message":"内容","severity":"info|success|warning|error"}}

## 数据绑定
使用 JSON Pointer 格式引用数据："/stock/price" 表示 data.stock.price

## 规则
1. 只输出 JSONL，不要任何解释
2. 每行一个完整的 JSON 对象
3. 使用提供的数据路径进行绑定
4. 布局组件的 children 是内联数组，不是单独的行
"""


class GenerateRequest(BaseModel):
    prompt: str
    data: dict = {}
    model: str = "gpt-4"


@app.post("/api/generate")
async def generate_ui(request: GenerateRequest):
    """生成 UI 的流式接口"""

    # 构建消息
    messages = [
        {"role": "system", "content": CATALOG_SYSTEM_PROMPT},
        {
            "role": "user",
            "content": f"""## 可用数据
```json
{json.dumps(request.data, ensure_ascii=False, indent=2)}
```

## 用户需求
{request.prompt}

请生成符合需求的 UI 组件（JSONL格式）："""
        }
    ]

    def stream_generator():
        """流式生成器"""
        try:
            response = client.chat.completions.create(
                model=request.model,
                messages=messages,
                stream=True,
                temperature=0.7,
            )

            buffer = ""
            for chunk in response:
                if chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    buffer += content

                    # 按行分割，每遇到换行就输出一行
                    while "\n" in buffer:
                        line, buffer = buffer.split("\n", 1)
                        line = line.strip()
                        if line:
                            # 验证是否是有效 JSON
                            try:
                                json.loads(line)
                                yield line + "\n"
                            except json.JSONDecodeError:
                                # 跳过无效行（可能是 markdown wrapper）
                                pass

            # 处理剩余内容
            if buffer.strip():
                try:
                    json.loads(buffer.strip())
                    yield buffer.strip() + "\n"
                except json.JSONDecodeError:
                    pass

        except Exception as e:
            # 错误时返回 Alert 组件
            error_component = {
                "type": "Alert",
                "props": {
                    "title": "生成失败",
                    "message": str(e),
                    "severity": "error"
                }
            }
            yield json.dumps(error_component) + "\n"

    return StreamingResponse(
        stream_generator(),
        media_type="application/x-ndjson",  # JSONL 的标准 MIME 类型
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # 禁用 nginx 缓冲
        }
    )


@app.get("/health")
async def health():
    return {"status": "ok"}


# ============================================
# 示例数据接口（模拟真实业务数据）
# ============================================

@app.get("/api/stock/{symbol}")
async def get_stock_data(symbol: str):
    """获取股票数据（示例）"""
    # 实际项目中这里查询数据库或调用行情API
    return {
        "stock": {
            "symbol": symbol,
            "name": "贵州茅台" if symbol == "600519" else symbol,
            "price": 1680.50,
            "change": 2.35,
            "changePercent": 0.14,
            "open": 1665.00,
            "high": 1688.00,
            "low": 1660.00,
            "prevClose": 1678.15,
            "volume": 12580000,
        },
        "kline": [
            {"time": "09:30", "open": 1665, "high": 1672, "low": 1662, "close": 1670, "volume": 8500},
            {"time": "09:35", "open": 1670, "high": 1678, "low": 1668, "close": 1675, "volume": 12000},
            {"time": "09:40", "open": 1675, "high": 1682, "low": 1673, "close": 1680, "volume": 15000},
            {"time": "09:45", "open": 1680, "high": 1688, "low": 1678, "close": 1685, "volume": 18000},
            {"time": "09:50", "open": 1685, "high": 1690, "low": 1680, "close": 1682, "volume": 14000},
            {"time": "09:55", "open": 1682, "high": 1686, "low": 1678, "close": 1680, "volume": 11000},
        ],
        "orderBook": {
            "bids": [
                {"price": 1680.00, "volume": 120},
                {"price": 1679.50, "volume": 85},
                {"price": 1679.00, "volume": 200},
                {"price": 1678.50, "volume": 150},
                {"price": 1678.00, "volume": 180},
            ],
            "asks": [
                {"price": 1680.50, "volume": 100},
                {"price": 1681.00, "volume": 95},
                {"price": 1681.50, "volume": 160},
                {"price": 1682.00, "volume": 120},
                {"price": 1682.50, "volume": 140},
            ],
        },
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
