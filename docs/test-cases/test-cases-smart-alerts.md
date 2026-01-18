# 智能提醒领域测试用例集

> 针对资产波动提醒和日常高频通用提醒场景的 json-render 测试用例。

---

## 测试数据模板

### 资产数据
```json
{
  "portfolio": {
    "totalValue": 1250000,
    "dailyChange": -15680,
    "dailyChangePercent": -0.0125,
    "weeklyChange": 28500,
    "weeklyChangePercent": 0.0233,
    "holdings": [
      { "symbol": "AAPL", "name": "苹果", "value": 320000, "change": -2.5, "shares": 1600 },
      { "symbol": "TSLA", "name": "特斯拉", "value": 180000, "change": 5.8, "shares": 720 },
      { "symbol": "NVDA", "name": "英伟达", "value": 250000, "change": -4.2, "shares": 2000 },
      { "symbol": "BTC", "name": "比特币", "value": 150000, "change": 3.1, "units": 1.5 },
      { "symbol": "ETH", "name": "以太坊", "value": 80000, "change": -1.8, "units": 25 }
    ],
    "alerts": [
      { "type": "price_drop", "symbol": "NVDA", "message": "英伟达跌破关键支撑位", "severity": "warning", "time": "10:30" },
      { "type": "price_surge", "symbol": "TSLA", "message": "特斯拉突破前高", "severity": "success", "time": "09:45" },
      { "type": "volatility", "symbol": "BTC", "message": "比特币波动率异常升高", "severity": "danger", "time": "08:15" }
    ]
  }
}
```

### 日常提醒数据
```json
{
  "reminders": {
    "today": [
      { "id": 1, "title": "团队周会", "time": "10:00", "type": "meeting", "priority": "high" },
      { "id": 2, "title": "提交周报", "time": "17:00", "type": "task", "priority": "medium" },
      { "id": 3, "title": "健身打卡", "time": "19:00", "type": "health", "priority": "low" }
    ],
    "upcoming": [
      { "id": 4, "title": "信用卡还款", "date": "2024-01-20", "type": "finance", "amount": 5680 },
      { "id": 5, "title": "车险续费", "date": "2024-01-25", "type": "finance", "amount": 3200 },
      { "id": 6, "title": "体检预约", "date": "2024-02-01", "type": "health" }
    ],
    "weather": {
      "current": "晴",
      "temp": 12,
      "high": 18,
      "low": 5,
      "alert": "明日降温10度，注意保暖"
    },
    "stats": {
      "tasksCompleted": 12,
      "tasksPending": 5,
      "streakDays": 7
    }
  }
}
```

---

## 一、资产波动提醒场景

### 1.1 投资组合总览仪表盘

| # | 提示词 (中文) |
|---|-------------|
| 1 | 创建投资组合总览：顶部显示总资产(125万)和日涨跌(-1.25%，红色)，下方2列网格展示5个持仓卡片，每个显示股票名、市值、涨跌幅(用颜色区分涨跌) |
| 2 | 构建资产监控面板：警告提示"3个持仓触发预警"，一行3个指标(总资产、日盈亏、周盈亏带趋势)，底部饼图展示资产配置分布 |

| # | Prompt (English) |
|---|------------------|
| 1 | Create portfolio overview: top shows total assets (1.25M) and daily change (-1.25%, red), below a 2-column grid with 5 holding cards, each showing stock name, value, and change percent (color-coded for gain/loss) |
| 2 | Build asset monitoring panel: warning alert "3 holdings triggered alerts", row of 3 metrics (total assets, daily P&L, weekly P&L with trends), pie chart at bottom showing asset allocation |

---

### 1.2 价格波动预警

| # | 提示词 (中文) |
|---|-------------|
| 1 | 构建价格预警中心：顶部危险警告"比特币波动率异常"，然后3个预警卡片纵向排列，每个包含：时间、股票代码(徽章)、预警消息、当前价格变动 |
| 2 | 创建实时监控看板：左侧显示3个触发预警的持仓(用danger/warning/success徽章)，右侧折线图展示今日价格走势 |

| # | Prompt (English) |
|---|------------------|
| 1 | Build price alert center: danger alert at top "BTC volatility abnormal", then 3 alert cards stacked vertically, each with: time, stock symbol (badge), alert message, current price change |
| 2 | Create real-time monitoring board: left side shows 3 triggered holdings (with danger/warning/success badges), right side line chart showing today's price trend |

---

### 1.3 止盈止损提醒

| # | 提示词 (中文) |
|---|-------------|
| 1 | 创建止盈止损监控卡片：标题"风控提醒"，表格显示5个持仓的：代码、买入价、现价、涨跌幅、止盈线、止损线、状态(用徽章显示安全/预警/触发) |
| 2 | 构建风险预警面板：顶部错误提示"NVDA已触发止损线"，下方两列：左侧是触发止损的持仓列表(红色徽章)，右侧是接近止盈的持仓列表(绿色徽章) |

| # | Prompt (English) |
|---|------------------|
| 1 | Create take-profit/stop-loss monitor card: title "Risk Control", table showing 5 holdings with: symbol, buy price, current price, change %, take-profit line, stop-loss line, status (badge: safe/warning/triggered) |
| 2 | Build risk alert panel: error alert at top "NVDA hit stop-loss", two columns below: left shows stop-loss triggered holdings (red badges), right shows near take-profit holdings (green badges) |

---

### 1.4 市场异动提醒

| # | 提示词 (中文) |
|---|-------------|
| 1 | 创建市场异动速报：信息提示"美股开盘前15分钟"，一行4个指标(道琼斯、纳斯达克、标普500、恐慌指数VIX)，下方柱状图展示板块涨跌排行 |
| 2 | 构建加密货币监控：警告提示"BTC大额转账预警"，2x2网格展示主流币种(BTC、ETH、SOL、BNB)的价格和24h涨跌，底部表格显示近3笔大额转账记录 |

| # | Prompt (English) |
|---|------------------|
| 1 | Create market movement alert: info alert "15 min before US market open", row of 4 metrics (Dow Jones, NASDAQ, S&P 500, VIX), bar chart below showing sector performance ranking |
| 2 | Build crypto monitoring: warning alert "BTC large transfer detected", 2x2 grid showing major coins (BTC, ETH, SOL, BNB) price and 24h change, table at bottom showing 3 recent large transfers |

---

## 二、日常高频通用提醒场景

### 2.1 今日待办概览

| # | 提示词 (中文) |
|---|-------------|
| 1 | 创建今日待办看板：标题"今日安排"，一行3个指标(已完成12、待处理5、连续打卡7天)，下方列表显示3个今日任务，每个带时间、标题、优先级徽章(高/中/低) |
| 2 | 构建智能日程卡片：顶部成功提示"已完成70%今日任务"，时间线布局展示今日3个事项，每个带时间标签、类型图标、任务描述 |

| # | Prompt (English) |
|---|------------------|
| 1 | Create today's todo dashboard: title "Today's Schedule", row of 3 metrics (completed 12, pending 5, streak 7 days), list below showing 3 today's tasks, each with time, title, priority badge (high/medium/low) |
| 2 | Build smart schedule card: success alert at top "70% of today's tasks completed", timeline layout showing 3 today's events, each with time label, type icon, task description |

---

### 2.2 账单还款提醒

| # | 提示词 (中文) |
|---|-------------|
| 1 | 创建账单提醒卡片：警告提示"信用卡还款日临近"，表格显示待还账单：名称、到期日、金额(货币格式)、状态徽章(紧急/即将到期/正常)，底部两个按钮"立即还款"和"设置提醒" |
| 2 | 构建财务日历：标题"本月待付款项"，一行2个指标(本月待还总额8880、已还款0)，下方卡片列表展示每笔账单的到期日和金额 |

| # | Prompt (English) |
|---|------------------|
| 1 | Create bill reminder card: warning alert "Credit card payment due soon", table showing pending bills: name, due date, amount (currency), status badge (urgent/due soon/normal), two buttons at bottom "Pay Now" and "Set Reminder" |
| 2 | Build financial calendar: title "This Month's Payments", row of 2 metrics (total due 8880, paid 0), card list below showing each bill's due date and amount |

---

### 2.3 健康习惯打卡

| # | 提示词 (中文) |
|---|-------------|
| 1 | 创建健康打卡面板：标题"今日健康目标"，进度条显示步数(8000/10000)、饮水(6/8杯)、睡眠(7/8小时)，底部3个按钮："运动打卡"、"饮水+1"、"早睡提醒" |
| 2 | 构建习惯追踪卡片：成功提示"连续打卡7天"，2x2网格展示4个习惯(运动、阅读、冥想、早起)，每个显示完成状态徽章和连续天数 |

| # | Prompt (English) |
|---|------------------|
| 1 | Create health check-in panel: title "Today's Health Goals", progress bars showing steps (8000/10000), water (6/8 cups), sleep (7/8 hours), 3 buttons at bottom: "Exercise Check-in", "Water +1", "Sleep Reminder" |
| 2 | Build habit tracking card: success alert "7-day streak", 2x2 grid showing 4 habits (exercise, reading, meditation, early rise), each with completion badge and streak days |

---

### 2.4 天气与出行提醒

| # | 提示词 (中文) |
|---|-------------|
| 1 | 创建天气提醒卡片：警告提示"明日降温10度，注意保暖"，一行3个指标(当前12°、最高18°、最低5°)，下方文字显示今日天气"晴" |
| 2 | 构建出行提醒面板：标题"今日出行建议"，信息提示"适合户外活动"，2列布局：左侧天气信息(温度、湿度、风力)，右侧穿衣建议和注意事项列表 |

| # | Prompt (English) |
|---|------------------|
| 1 | Create weather reminder card: warning alert "Temperature drop 10°C tomorrow, dress warm", row of 3 metrics (current 12°, high 18°, low 5°), text below showing today's weather "Sunny" |
| 2 | Build travel reminder panel: title "Today's Travel Tips", info alert "Good for outdoor activities", 2-column layout: left with weather info (temp, humidity, wind), right with clothing suggestions and notes list |

---

### 2.5 综合智能提醒中心

| # | 提示词 (中文) |
|---|-------------|
| 1 | 创建智能提醒中心：顶部一行4个快捷指标(待办3、账单2、健康目标80%、资产涨跌-1.2%)，下方3个分类卡片纵向排列：今日待办、财务提醒、健康打卡，每个卡片最多显示2条最重要的提醒 |
| 2 | 构建个人助手首页：标题"早安，今天是周一"，警告提示区显示最紧急的1条提醒，然后2x2网格展示4个模块摘要(日程、财务、健康、资产)，每个带数字指标和状态徽章 |

| # | Prompt (English) |
|---|------------------|
| 1 | Create smart reminder center: top row of 4 quick metrics (todos 3, bills 2, health goals 80%, portfolio change -1.2%), 3 category cards stacked below: today's todos, financial reminders, health check-ins, each card shows max 2 most important reminders |
| 2 | Build personal assistant home: title "Good morning, it's Monday", warning alert area showing 1 most urgent reminder, then 2x2 grid with 4 module summaries (schedule, finance, health, portfolio), each with number metric and status badge |

---

## 快速测试命令

### 资产波动 - 投资组合
```bash
curl -s -X POST "http://localhost:3001/api/generate" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"创建投资组合总览：顶部显示总资产和日涨跌，下方网格展示5个持仓卡片，每个显示股票名、市值、涨跌幅","context":{"model":"opus","data":{"portfolio":{"totalValue":1250000,"dailyChange":-15680,"dailyChangePercent":-0.0125,"holdings":[{"symbol":"AAPL","name":"苹果","value":320000,"change":-2.5},{"symbol":"TSLA","name":"特斯拉","value":180000,"change":5.8},{"symbol":"NVDA","name":"英伟达","value":250000,"change":-4.2}]}}}}' \
  --max-time 60
```

### 日常提醒 - 今日待办
```bash
curl -s -X POST "http://localhost:3001/api/generate" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"创建今日待办看板：一行3个指标(已完成、待处理、连续打卡天数)，下方列表显示今日任务，每个带时间、标题、优先级徽章","context":{"model":"opus","data":{"reminders":{"stats":{"tasksCompleted":12,"tasksPending":5,"streakDays":7},"today":[{"title":"团队周会","time":"10:00","priority":"high"},{"title":"提交周报","time":"17:00","priority":"medium"},{"title":"健身打卡","time":"19:00","priority":"low"}]}}}}' \
  --max-time 60
```

### 综合提醒中心
```bash
curl -s -X POST "http://localhost:3001/api/generate" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Build smart reminder center: top row with 4 metrics (todos, bills, health %, portfolio change), then 3 category cards: todos, finance, health","context":{"model":"opus","data":{"summary":{"todos":3,"bills":2,"healthGoal":0.8,"portfolioChange":-0.012}}}}' \
  --max-time 60
```

---

## 场景能力覆盖矩阵

| 场景 | Metric | Chart | Table | Alert | Badge | Button | Grid | Stack |
|------|--------|-------|-------|-------|-------|--------|------|-------|
| 投资组合总览 | ✅ | ✅ | - | ✅ | ✅ | - | ✅ | ✅ |
| 价格波动预警 | ✅ | ✅ | - | ✅ | ✅ | - | - | ✅ |
| 止盈止损提醒 | - | - | ✅ | ✅ | ✅ | - | ✅ | - |
| 市场异动提醒 | ✅ | ✅ | ✅ | ✅ | - | - | ✅ | - |
| 今日待办概览 | ✅ | - | - | ✅ | ✅ | - | - | ✅ |
| 账单还款提醒 | ✅ | - | ✅ | ✅ | ✅ | ✅ | - | ✅ |
| 健康习惯打卡 | ✅ | - | - | ✅ | ✅ | ✅ | ✅ | - |
| 天气出行提醒 | ✅ | - | - | ✅ | - | - | ✅ | ✅ |
| 综合提醒中心 | ✅ | - | - | ✅ | ✅ | - | ✅ | ✅ |

---

*最后更新: 2024-01*
