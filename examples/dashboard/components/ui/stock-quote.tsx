"use client";

import { type ComponentRenderProps } from "@json-render/react";
import { useData } from "@json-render/react";
import { getByPath } from "@json-render/core";

export function StockQuote({ element }: ComponentRenderProps) {
  const {
    symbolPath,
    namePath,
    pricePath,
    changePath,
    changePercentPath,
    volumePath,
    showSparkline,
    sparklineDataPath,
  } = element.props as {
    symbolPath: string;
    namePath: string;
    pricePath: string;
    changePath: string;
    changePercentPath: string;
    volumePath?: string | null;
    showSparkline?: boolean | null;
    sparklineDataPath?: string | null;
  };

  const { data } = useData();

  const symbol = getByPath(data, symbolPath) as string;
  const name = getByPath(data, namePath) as string;
  const price = getByPath(data, pricePath) as number;
  const change = getByPath(data, changePath) as number;
  const changePercent = getByPath(data, changePercentPath) as number;
  const volume = volumePath ? (getByPath(data, volumePath) as number) : null;
  const sparklineData = sparklineDataPath
    ? (getByPath(data, sparklineDataPath) as Array<{ value: number }>)
    : null;

  const isUp = change >= 0;
  const color = isUp ? "#22c55e" : "#ef4444";
  const arrow = isUp ? "▲" : "▼";

  const formatVolume = (vol: number) => {
    if (vol >= 100000000) return (vol / 100000000).toFixed(2) + "亿";
    if (vol >= 10000) return (vol / 10000).toFixed(1) + "万";
    return vol.toLocaleString();
  };

  // Mini sparkline renderer
  const renderSparkline = () => {
    if (!showSparkline || !sparklineData || sparklineData.length < 2)
      return null;

    const values = sparklineData.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const width = 60;
    const height = 24;
    const points = sparklineData
      .map((d, i) => {
        const x = (i / (sparklineData.length - 1)) * width;
        const y = height - ((d.value - min) / range) * height;
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <svg width={width} height={height} style={{ marginLeft: 8 }}>
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
        />
      </svg>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        gap: 16,
      }}
    >
      {/* Left: Symbol and Name */}
      <div style={{ minWidth: 80 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{symbol}</div>
        <div style={{ fontSize: 12, color: "var(--muted)" }}>{name}</div>
      </div>

      {/* Center: Sparkline */}
      {renderSparkline()}

      {/* Right: Price and Change */}
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 18, fontWeight: 600, color }}>
          {price.toFixed(2)}
        </div>
        <div style={{ fontSize: 12, color }}>
          {arrow} {Math.abs(change).toFixed(2)} ({isUp ? "+" : ""}
          {(changePercent * 100).toFixed(2)}%)
        </div>
        {volume !== null && (
          <div style={{ fontSize: 11, color: "var(--muted)" }}>
            量: {formatVolume(volume)}
          </div>
        )}
      </div>
    </div>
  );
}
