"use client";

import { useRef, useEffect, useCallback } from "react";
import { type ComponentRenderProps } from "@json-render/react";
import { useData } from "@json-render/react";
import { getByPath } from "@json-render/core";
import {
  createChart,
  ColorType,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type HistogramData,
  type LineData,
  type Time,
} from "lightweight-charts";

interface CandleInput {
  time: string | number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

// Calculate Simple Moving Average
function calculateSMA(data: CandleInput[], period: number): LineData[] {
  const result: LineData[] = [];
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    result.push({
      time: data[i].time as Time,
      value: sum / period,
    });
  }
  return result;
}

// Convert time string to timestamp
function parseTime(timeStr: string | number): Time {
  if (typeof timeStr === "number") {
    return timeStr as Time;
  }
  // Handle HH:mm format (intraday)
  if (/^\d{2}:\d{2}$/.test(timeStr)) {
    const today = new Date();
    const [hours, minutes] = timeStr.split(":").map(Number);
    today.setHours(hours, minutes, 0, 0);
    return Math.floor(today.getTime() / 1000) as Time;
  }
  // Handle date format
  const date = new Date(timeStr);
  return Math.floor(date.getTime() / 1000) as Time;
}

export function CandlestickChart({ element }: ComponentRenderProps) {
  const {
    dataPath,
    title,
    height = 400,
    showVolume = true,
    showMA = null,
    period = "1d",
  } = element.props as {
    dataPath: string;
    title?: string | null;
    height?: number | null;
    showVolume?: boolean | null;
    showMA?: number[] | null;
    period?: string | null;
  };

  const { data } = useData();
  const candles = getByPath(data, dataPath) as CandleInput[] | undefined;

  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const maSeriesRefs = useRef<Map<number, ISeriesApi<"Line">>>(new Map());

  // MA line colors
  const maColors: Record<number, string> = {
    5: "#f59e0b", // yellow
    10: "#3b82f6", // blue
    20: "#8b5cf6", // purple
    30: "#ec4899", // pink
    60: "#10b981", // green
  };

  const initChart = useCallback(() => {
    if (!containerRef.current || !candles || candles.length === 0) return;

    // Clean up existing chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      candlestickSeriesRef.current = null;
      volumeSeriesRef.current = null;
      maSeriesRefs.current.clear();
    }

    const chartHeight = height || 400;
    const volumeHeight = showVolume ? chartHeight * 0.2 : 0;
    const mainHeight = chartHeight - volumeHeight;

    // Create chart
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: chartHeight,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#9ca3af",
        fontSize: 12,
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.05)" },
        horzLines: { color: "rgba(255, 255, 255, 0.05)" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: "#6b7280",
          width: 1,
          style: 2,
          labelBackgroundColor: "#374151",
        },
        horzLine: {
          color: "#6b7280",
          width: 1,
          style: 2,
          labelBackgroundColor: "#374151",
        },
      },
      rightPriceScale: {
        borderColor: "rgba(255, 255, 255, 0.1)",
        scaleMargins: {
          top: 0.1,
          bottom: showVolume ? 0.25 : 0.1,
        },
      },
      timeScale: {
        borderColor: "rgba(255, 255, 255, 0.1)",
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        mouseWheel: true,
        pinch: true,
        axisPressedMouseMove: true,
      },
    });

    chartRef.current = chart;

    // Convert and sort data
    const candleData: CandlestickData[] = candles
      .map((c) => ({
        time: parseTime(c.time),
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }))
      .sort((a, b) => (a.time as number) - (b.time as number));

    // Add candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderDownColor: "#ef4444",
      borderUpColor: "#22c55e",
      wickDownColor: "#ef4444",
      wickUpColor: "#22c55e",
    });
    candlestickSeries.setData(candleData);
    candlestickSeriesRef.current = candlestickSeries;

    // Add volume series
    if (showVolume) {
      const volumeData: HistogramData[] = candles
        .map((c, i) => ({
          time: parseTime(c.time),
          value: c.volume || 0,
          color:
            i > 0 && c.close >= candles[i - 1].close
              ? "rgba(34, 197, 94, 0.5)"
              : "rgba(239, 68, 68, 0.5)",
        }))
        .sort((a, b) => (a.time as number) - (b.time as number));

      const volumeSeries = chart.addHistogramSeries({
        priceFormat: {
          type: "volume",
        },
        priceScaleId: "volume",
      });

      chart.priceScale("volume").applyOptions({
        scaleMargins: {
          top: 0.85,
          bottom: 0,
        },
      });

      volumeSeries.setData(volumeData);
      volumeSeriesRef.current = volumeSeries;
    }

    // Add MA lines
    if (showMA && showMA.length > 0) {
      showMA.forEach((maPeriod) => {
        const maData = calculateSMA(candles, maPeriod);
        if (maData.length > 0) {
          const maSeries = chart.addLineSeries({
            color: maColors[maPeriod] || "#6b7280",
            lineWidth: 1,
            priceLineVisible: false,
            lastValueVisible: false,
            crosshairMarkerVisible: false,
          });
          maSeries.setData(maData);
          maSeriesRefs.current.set(maPeriod, maSeries);
        }
      });
    }

    // Fit content
    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [candles, height, showVolume, showMA]);

  useEffect(() => {
    const cleanup = initChart();
    return () => {
      cleanup?.();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [initChart]);

  if (!candles || !Array.isArray(candles) || candles.length === 0) {
    return (
      <div
        style={{
          height: height || 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--muted)",
          background: "var(--card)",
          borderRadius: "var(--radius)",
          border: "1px solid var(--border)",
        }}
      >
        No K-line data
      </div>
    );
  }

  return (
    <div>
      {title && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{title}</h4>
          {showMA && showMA.length > 0 && (
            <div style={{ display: "flex", gap: 12, fontSize: 11 }}>
              {showMA.map((ma) => (
                <span key={ma} style={{ color: maColors[ma] || "#6b7280" }}>
                  MA{ma}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: height || 400,
          borderRadius: "var(--radius)",
          overflow: "hidden",
          border: "1px solid var(--border)",
        }}
      />
      {/* Legend showing period */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 8,
          marginTop: 8,
          fontSize: 11,
          color: "var(--muted)",
        }}
      >
        <span>周期: {period || "1d"}</span>
        <span>|</span>
        <span>数据点: {candles.length}</span>
        {showVolume && (
          <>
            <span>|</span>
            <span>成交量: 显示</span>
          </>
        )}
      </div>
    </div>
  );
}
