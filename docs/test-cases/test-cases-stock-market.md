# 股票行情测试用例集

> 针对股票行情数据展示场景的 json-render 测试用例。

---

## 新增组件

| 组件 | 用途 | 关键 Props |
|------|------|-----------|
| **CandlestickChart** | K线蜡烛图 | `dataPath`, `showVolume`, `showMA`, `period` |
| **OrderBook** | 买卖五档盘口 | `bidsPath`, `asksPath`, `levels` |
| **StockQuote** | 股票报价卡片 | `symbolPath`, `pricePath`, `changePath` |
| **MiniChart** | 迷你走势图 | `dataPath`, `type`, `color` |
| **TickerTape** | 滚动行情带 | `dataPath`, `speed`, `showChange` |
| **PriceAlert** | 价格预警 | `symbolPath`, `targetPath`, `conditionPath` |

---

## 测试数据模板

### K线数据
```json
{
  "kline": [
    { "time": "09:30", "open": 1638, "high": 1645, "low": 1635, "close": 1642, "volume": 12000 },
    { "time": "09:35", "open": 1642, "high": 1655, "low": 1640, "close": 1650, "volume": 15000 },
    { "time": "09:40", "open": 1650, "high": 1665, "low": 1648, "close": 1660, "volume": 18000 },
    { "time": "09:45", "open": 1660, "high": 1672, "low": 1658, "close": 1668, "volume": 14000 },
    { "time": "09:50", "open": 1668, "high": 1680, "low": 1665, "close": 1675, "volume": 20000 },
    { "time": "09:55", "open": 1675, "high": 1685, "low": 1670, "close": 1680, "volume": 16000 }
  ]
}
```

### 盘口数据
```json
{
  "orderBook": {
    "bids": [
      { "price": 1680.00, "volume": 120, "total": 120 },
      { "price": 1679.50, "volume": 85, "total": 205 },
      { "price": 1679.00, "volume": 200, "total": 405 },
      { "price": 1678.50, "volume": 150, "total": 555 },
      { "price": 1678.00, "volume": 180, "total": 735 }
    ],
    "asks": [
      { "price": 1680.50, "volume": 100, "total": 100 },
      { "price": 1681.00, "volume": 95, "total": 195 },
      { "price": 1681.50, "volume": 160, "total": 355 },
      { "price": 1682.00, "volume": 120, "total": 475 },
      { "price": 1682.50, "volume": 140, "total": 615 }
    ]
  }
}
```

---

## 1. 个股详情页

**展示能力：** CandlestickChart + OrderBook + Metric

| # | 提示词 (中文) |
|---|-------------|
| 1 | 创建个股详情页：顶部显示股票名称(贵州茅台)和代码(600519)，当前价格和涨跌幅，下方两列布局：左侧K线图带成交量，右侧五档盘口 |
| 2 | 构建股票分析卡片：标题区显示价格和涨跌趋势，中间K线图显示日K数据，底部一行4个指标(今开、最高、最低、昨收) |

| # | Prompt (English) |
|---|------------------|
| 1 | Create stock detail page: top shows stock name (Maotai) and code (600519), current price and change, two-column layout below: left K-line chart with volume, right order book 5 levels |
| 2 | Build stock analysis card: header with price and trend, K-line chart in middle showing daily data, bottom row with 4 metrics (open, high, low, prev close) |

---

## 2. 自选股列表

**展示能力：** StockQuote + MiniChart + Table

| # | 提示词 (中文) |
|---|-------------|
| 1 | 创建自选股看板：顶部一行显示3个指数(上证、深证、创业板)，下方列表显示5只自选股，每只显示代码、名称、现价、涨跌幅(颜色区分)、迷你走势图 |
| 2 | 构建股票监控列表：表格形式显示持仓股票，列包括：代码、名称、成本价、现价、盈亏(带颜色徽章)、操作按钮(买入/卖出) |

| # | Prompt (English) |
|---|------------------|
| 1 | Create watchlist dashboard: top row shows 3 indices (SSE, SZSE, ChiNext), list below shows 5 stocks with code, name, price, change percent (color-coded), mini sparkline chart |
| 2 | Build stock monitoring list: table showing portfolio stocks with columns: code, name, cost, current price, P&L (with color badge), action buttons (buy/sell) |

---

## 3. 滚动行情带

**展示能力：** TickerTape + Alert

| # | 提示词 (中文) |
|---|-------------|
| 1 | 创建行情页面：顶部滚动行情带显示主要指数和热门股票实时价格，下方是市场概览仪表盘 |
| 2 | 构建交易大厅界面：顶部警告提示"美联储议息会议今日召开"，下方滚动显示涨幅前10股票，底部是板块热力图 |

| # | Prompt (English) |
|---|------------------|
| 1 | Create market page: top ticker tape scrolling major indices and hot stocks realtime prices, market overview dashboard below |
| 2 | Build trading floor interface: warning alert at top "Fed meeting today", scrolling top 10 gainers below, sector heatmap at bottom |

---

## 4. 价格预警中心

**展示能力：** PriceAlert + Badge + Stack

| # | 提示词 (中文) |
|---|-------------|
| 1 | 创建价格预警面板：3个预警卡片纵向排列，分别显示：NVDA突破预警(danger)、AAPL接近目标价(warning)、TSLA跌破支撑位(danger)，每个显示当前价、目标价、进度条 |
| 2 | 构建预警管理界面：顶部统计(已触发3、监控中5、已暂停2)，下方表格显示所有预警规则，可设置启用/禁用 |

| # | Prompt (English) |
|---|------------------|
| 1 | Create price alert panel: 3 alert cards stacked vertically showing: NVDA breakout alert (danger), AAPL near target (warning), TSLA broke support (danger), each with current price, target, progress bar |
| 2 | Build alert management: top stats (triggered 3, monitoring 5, paused 2), table below showing all alert rules with enable/disable toggle |

---

## 5. 完整交易界面

**展示能力：** 综合所有股票组件

| # | 提示词 (中文) |
|---|-------------|
| 1 | 创建专业交易界面：顶部滚动行情带，左侧自选股列表(5只股票带迷你图)，中间大K线图，右侧五档盘口，底部一行买入/卖出按钮 |
| 2 | 构建投资组合总览：顶部警告提示"2只股票触发止损"，一行4个持仓指标(总市值、日盈亏、持仓成本、浮动盈亏)，下方表格显示所有持仓，每行带迷你走势图 |

| # | Prompt (English) |
|---|------------------|
| 1 | Create professional trading interface: top ticker tape, left watchlist (5 stocks with mini charts), center large K-line chart, right order book, bottom buy/sell buttons |
| 2 | Build portfolio overview: warning alert "2 stocks hit stop-loss", row of 4 metrics (total value, daily P&L, cost basis, unrealized P&L), table below showing all positions with mini sparklines |

---

## 快速测试命令

### K线图 + 盘口
```bash
curl -s -X POST "http://localhost:3001/api/generate" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Create stock detail with K-line chart and order book","context":{"model":"opus","data":{"stock":{"symbol":"600519","name":"贵州茅台","price":1680.50},"kline":[{"time":"09:30","open":1638,"high":1645,"low":1635,"close":1642,"volume":12000},{"time":"09:35","open":1642,"high":1655,"low":1640,"close":1650,"volume":15000},{"time":"09:40","open":1650,"high":1665,"low":1648,"close":1660,"volume":18000}],"orderBook":{"bids":[{"price":1680.00,"volume":120},{"price":1679.50,"volume":85}],"asks":[{"price":1680.50,"volume":100},{"price":1681.00,"volume":95}]}}}}' \
  --max-time 60
```

### 自选股列表
```bash
curl -s -X POST "http://localhost:3001/api/generate" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"创建自选股看板，显示5只股票的代码、名称、现价、涨跌幅","context":{"model":"opus","data":{"stocks":[{"symbol":"600519","name":"贵州茅台","price":1680.50,"change":2.5},{"symbol":"000858","name":"五粮液","price":145.20,"change":-1.8},{"symbol":"601318","name":"中国平安","price":42.50,"change":0.5}]}}}' \
  --max-time 60
```

---

## 组件能力矩阵

| 场景 | CandlestickChart | OrderBook | StockQuote | MiniChart | TickerTape | PriceAlert |
|------|-----------------|-----------|------------|-----------|------------|------------|
| 个股详情页 | ✅ | ✅ | - | - | - | - |
| 自选股列表 | - | - | ✅ | ✅ | - | - |
| 滚动行情带 | - | - | - | - | ✅ | - |
| 价格预警中心 | - | - | - | - | - | ✅ |
| 完整交易界面 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

*最后更新: 2024-01*
