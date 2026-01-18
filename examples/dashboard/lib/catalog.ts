import { createCatalog } from "@json-render/core";
import { z } from "zod";

/**
 * Dashboard component catalog
 *
 * This defines the ONLY components that the AI can generate.
 * It acts as a guardrail - the AI cannot create arbitrary HTML/CSS.
 *
 * Note: OpenAI structured output requires all fields to be required.
 * Use .nullable() instead of .optional() for optional fields.
 */
export const dashboardCatalog = createCatalog({
  name: "dashboard",
  components: {
    // Layout Components
    Card: {
      props: z.object({
        title: z.string().nullable(),
        description: z.string().nullable(),
        padding: z.enum(["sm", "md", "lg"]).nullable(),
      }),
      hasChildren: true,
      description: "A card container with optional title",
    },

    Grid: {
      props: z.object({
        columns: z.number().min(1).max(4).nullable(),
        gap: z.enum(["sm", "md", "lg"]).nullable(),
      }),
      hasChildren: true,
      description: "Grid layout with configurable columns",
    },

    Stack: {
      props: z.object({
        direction: z.enum(["horizontal", "vertical"]).nullable(),
        gap: z.enum(["sm", "md", "lg"]).nullable(),
        align: z.enum(["start", "center", "end", "stretch"]).nullable(),
      }),
      hasChildren: true,
      description: "Flex stack for horizontal or vertical layouts",
    },

    // Data Display Components
    Metric: {
      props: z.object({
        label: z.string(),
        valuePath: z.string(),
        format: z.enum(["number", "currency", "percent"]).nullable(),
        trend: z.enum(["up", "down", "neutral"]).nullable(),
        trendValue: z.string().nullable(),
      }),
      description: "Display a single metric with optional trend indicator",
    },

    Chart: {
      props: z.object({
        type: z.enum(["bar", "line", "pie", "area"]),
        dataPath: z.string(),
        title: z.string().nullable(),
        height: z.number().nullable(),
      }),
      description: "Display a chart from array data",
    },

    Table: {
      props: z.object({
        dataPath: z.string(),
        columns: z.array(
          z.object({
            key: z.string(),
            label: z.string(),
            format: z.enum(["text", "currency", "date", "badge"]).nullable(),
          }),
        ),
      }),
      description: "Display tabular data",
    },

    List: {
      props: z.object({
        dataPath: z.string(),
        emptyMessage: z.string().nullable(),
      }),
      hasChildren: true,
      description: "Render a list from array data",
    },

    // Interactive Components
    Button: {
      props: z.object({
        label: z.string(),
        variant: z.enum(["primary", "secondary", "danger", "ghost"]).nullable(),
        size: z.enum(["sm", "md", "lg"]).nullable(),
        action: z.string(),
        disabled: z.boolean().nullable(),
      }),
      description: "Clickable button with action",
    },

    Select: {
      props: z.object({
        label: z.string().nullable(),
        bindPath: z.string(),
        options: z.array(
          z.object({
            value: z.string(),
            label: z.string(),
          }),
        ),
        placeholder: z.string().nullable(),
      }),
      description: "Dropdown select input",
    },

    DatePicker: {
      props: z.object({
        label: z.string().nullable(),
        bindPath: z.string(),
        placeholder: z.string().nullable(),
      }),
      description: "Date picker input",
    },

    // Typography
    Heading: {
      props: z.object({
        text: z.string(),
        level: z.enum(["h1", "h2", "h3", "h4"]).nullable(),
      }),
      description: "Section heading",
    },

    Text: {
      props: z.object({
        content: z.string(),
        variant: z.enum(["body", "caption", "label"]).nullable(),
        color: z
          .enum(["default", "muted", "success", "warning", "danger"])
          .nullable(),
      }),
      description: "Text paragraph",
    },

    // Status Components
    Badge: {
      props: z.object({
        text: z.string(),
        variant: z
          .enum(["default", "success", "warning", "danger", "info"])
          .nullable(),
      }),
      description: "Small status badge",
    },

    Alert: {
      props: z.object({
        type: z.enum(["info", "success", "warning", "error"]),
        title: z.string(),
        message: z.string().nullable(),
        dismissible: z.boolean().nullable(),
      }),
      description: "Alert/notification banner",
    },

    // Special Components
    Divider: {
      props: z.object({
        label: z.string().nullable(),
      }),
      description: "Visual divider",
    },

    Empty: {
      props: z.object({
        title: z.string(),
        description: z.string().nullable(),
        action: z.string().nullable(),
        actionLabel: z.string().nullable(),
      }),
      description: "Empty state placeholder",
    },

    // ========== Stock Market Components ==========

    CandlestickChart: {
      props: z.object({
        dataPath: z.string(),
        title: z.string().nullable(),
        height: z.number().nullable(),
        showVolume: z.boolean().nullable(),
        showMA: z.array(z.number()).nullable(), // e.g. [5, 10, 20] for MA5, MA10, MA20
        period: z
          .enum(["1m", "5m", "15m", "30m", "1h", "1d", "1w", "1M"])
          .nullable(),
      }),
      description:
        "K-line candlestick chart with optional volume and moving averages",
    },

    OrderBook: {
      props: z.object({
        bidsPath: z.string(),
        asksPath: z.string(),
        levels: z.number().nullable(), // default 5
        showTotal: z.boolean().nullable(),
        priceDecimals: z.number().nullable(),
      }),
      description: "Order book showing bid/ask levels (买卖五档盘口)",
    },

    StockQuote: {
      props: z.object({
        symbolPath: z.string(),
        namePath: z.string(),
        pricePath: z.string(),
        changePath: z.string(),
        changePercentPath: z.string(),
        volumePath: z.string().nullable(),
        showSparkline: z.boolean().nullable(),
        sparklineDataPath: z.string().nullable(),
      }),
      description: "Compact stock quote display with price and change",
    },

    MiniChart: {
      props: z.object({
        dataPath: z.string(),
        type: z.enum(["line", "area", "bar"]).nullable(),
        color: z.enum(["green", "red", "blue", "gray"]).nullable(),
        width: z.number().nullable(),
        height: z.number().nullable(),
      }),
      description: "Mini sparkline chart for inline display",
    },

    TickerTape: {
      props: z.object({
        dataPath: z.string(),
        speed: z.enum(["slow", "normal", "fast"]).nullable(),
        showChange: z.boolean().nullable(),
      }),
      description: "Scrolling stock ticker tape",
    },

    PriceAlert: {
      props: z.object({
        symbolPath: z.string(),
        pricePath: z.string(),
        targetPath: z.string(),
        conditionPath: z.string(), // "above" | "below"
        messagePath: z.string(),
        severity: z.enum(["info", "warning", "danger"]).nullable(),
      }),
      description: "Price alert notification with target and condition",
    },
  },
  actions: {
    export_report: { description: "Export the current dashboard to PDF" },
    refresh_data: { description: "Refresh all metrics and charts" },
    view_details: { description: "View detailed information" },
    apply_filter: { description: "Apply the current filter settings" },
    // Stock Market Actions
    add_to_watchlist: { description: "Add stock to watchlist" },
    remove_from_watchlist: { description: "Remove stock from watchlist" },
    set_price_alert: { description: "Set a price alert for a stock" },
    buy_stock: { description: "Execute buy order" },
    sell_stock: { description: "Execute sell order" },
    change_period: { description: "Change chart time period" },
    toggle_indicator: { description: "Toggle technical indicator" },
  },
  validation: "strict",
});

// Export the component list for the AI prompt
export const componentList = dashboardCatalog.componentNames as string[];
