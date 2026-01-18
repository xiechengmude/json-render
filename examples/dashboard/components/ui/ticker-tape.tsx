"use client";

import { type ComponentRenderProps } from "@json-render/react";
import { useData } from "@json-render/react";
import { getByPath } from "@json-render/core";

interface TickerItem {
  symbol: string;
  price: number;
  change: number;
}

export function TickerTape({ element }: ComponentRenderProps) {
  const {
    dataPath,
    speed = "normal",
    showChange = true,
  } = element.props as {
    dataPath: string;
    speed?: "slow" | "normal" | "fast" | null;
    showChange?: boolean | null;
  };

  const { data } = useData();
  const tickers = getByPath(data, dataPath) as TickerItem[] | undefined;

  if (!tickers || tickers.length === 0) {
    return null;
  }

  const speedMap = {
    slow: 40,
    normal: 25,
    fast: 15,
  };

  const duration = speedMap[speed || "normal"];

  // Duplicate for seamless loop
  const items = [...tickers, ...tickers];

  return (
    <div
      style={{
        overflow: "hidden",
        background: "var(--card)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        padding: "8px 0",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 32,
          animation: `ticker ${items.length * duration}s linear infinite`,
          width: "max-content",
        }}
      >
        {items.map((ticker, i) => {
          const isUp = ticker.change >= 0;
          const color = isUp ? "#22c55e" : "#ef4444";
          const arrow = isUp ? "▲" : "▼";

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                whiteSpace: "nowrap",
                fontSize: 13,
              }}
            >
              <span style={{ fontWeight: 600 }}>{ticker.symbol}</span>
              <span>{ticker.price.toFixed(2)}</span>
              {showChange && (
                <span style={{ color, fontSize: 12 }}>
                  {arrow} {Math.abs(ticker.change).toFixed(2)}%
                </span>
              )}
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
