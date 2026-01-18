# JSON-Render Test Cases (English)

> Test prompts for demonstrating json-render capabilities across different scenarios.

## Available Test Data

```json
{
  "analytics": {
    "revenue": 125000,
    "growth": 0.15,
    "customers": 1234,
    "orders": 567,
    "conversionRate": 0.034,
    "salesByRegion": [
      { "label": "US", "value": 45000 },
      { "label": "EU", "value": 35000 },
      { "label": "Asia", "value": 28000 },
      { "label": "Other", "value": 17000 }
    ],
    "recentTransactions": [
      { "id": "TXN001", "customer": "Acme Corp", "amount": 1500, "status": "completed", "date": "2024-01-15" },
      { "id": "TXN002", "customer": "Globex Inc", "amount": 2300, "status": "pending", "date": "2024-01-14" },
      { "id": "TXN003", "customer": "Initech", "amount": 890, "status": "completed", "date": "2024-01-13" }
    ]
  }
}
```

---

## 1. Dashboard / KPI Monitoring

**Capabilities:** Metric + Chart + Data Binding

| # | Prompt |
|---|--------|
| 1 | Create an executive dashboard showing revenue ($125000), growth rate (15%), customer count (1234), and orders (567) in a 2x2 grid with trend indicators |
| 2 | Build a sales performance card with a bar chart showing regional sales (US: 45000, EU: 35000, Asia: 28000) and two key metrics above it |

---

## 2. Data Tables

**Capabilities:** Table + Multi-column Formatting

| # | Prompt |
|---|--------|
| 1 | Show recent transactions table with columns: ID, Customer, Amount (currency format), Status (as badge), Date |
| 2 | Create an order management table with order ID, customer name, total amount, and status badge showing completed/pending |

---

## 3. Complex Layouts

**Capabilities:** Grid + Stack + Card Nesting

| # | Prompt |
|---|--------|
| 1 | Build a dashboard with header section containing title and description, then a 2-column grid: left side has 3 stacked metrics, right side has a line chart |
| 2 | Create a split layout: top row with 4 small metric cards, bottom section with a large card containing a table and action buttons |

---

## 4. Chart Variety

**Capabilities:** Different Chart Types (bar/line/pie/area)

| # | Prompt |
|---|--------|
| 1 | Show sales analytics with 3 charts side by side: bar chart for monthly sales, line chart for growth trend, pie chart for category distribution |
| 2 | Create an area chart showing revenue over time with a title "Monthly Revenue Trend" and height of 300px |

---

## 5. Status & Alerts

**Capabilities:** Alert + Badge + Conditional Display

| # | Prompt |
|---|--------|
| 1 | Build a system status panel with a success alert "All systems operational", followed by 4 service status items each with a badge (API: success, Database: success, Cache: warning, Queue: danger) |
| 2 | Create an error notification card with error alert at top, then a list showing 3 recent issues with danger/warning badges |

---

## 6. Interactive Controls

**Capabilities:** Button + Select + DatePicker

| # | Prompt |
|---|--------|
| 1 | Build a filter panel with a region dropdown (US, EU, Asia, All), date picker, and two buttons: "Apply Filter" (primary) and "Reset" (secondary) |
| 2 | Create a report actions card with heading "Export Options", then 3 buttons in a row: "Export PDF" (primary), "Export CSV" (secondary), "Delete" (danger) |

---

## 7. Complete Business Scenarios

**Capabilities:** Comprehensive Integration

| # | Prompt |
|---|--------|
| 1 | Build a complete e-commerce dashboard: header with title "Store Analytics", row of 4 metrics (revenue, orders, customers, conversion rate), sales by region bar chart, and recent orders table with 4 columns |
| 2 | Create a financial overview: warning alert about pending reviews, 3 key metrics in a row (total revenue, expenses, profit), then two side-by-side charts showing income vs expenses comparison |

---

## Quick Test Commands

### Test with Claude Opus
```bash
curl -s -X POST "http://localhost:3001/api/generate" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Build a complete e-commerce dashboard: header with title Store Analytics, row of 4 metrics (revenue, orders, customers, conversion rate), sales by region bar chart, and recent orders table","context":{"model":"opus","data":{"analytics":{"revenue":125000,"orders":567,"customers":1234,"conversionRate":0.034,"salesByRegion":[{"label":"US","value":45000},{"label":"EU","value":35000},{"label":"Asia","value":28000}],"recentTransactions":[{"id":"TXN001","customer":"Acme","amount":1500,"status":"completed"}]}}}}' \
  --max-time 60
```

### Test with DeepSeek V3.2
```bash
curl -s -X POST "http://localhost:3001/api/generate" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Create a sales performance card with bar chart and 2 metrics","context":{"model":"ds3.2","data":{"analytics":{"revenue":125000,"growth":0.15,"salesByRegion":[{"label":"US","value":45000},{"label":"EU","value":35000}]}}}}' \
  --max-time 60
```

---

## Model Compatibility

| Model | Status | Response Time | Notes |
|-------|--------|---------------|-------|
| Claude Opus | ✅ | ~5s | Best output quality |
| DeepSeek V3.2 | ✅ | ~35s | Stable, slower |
| GLM 4.7 | ⚠️ | ~12s | Outputs markdown wrapper |
| Kimi K2 | ✅ | - | Untested |

---

*Last updated: 2024-01*
