"use client";

import { type ComponentRenderProps } from "@json-render/react";
import { useData } from "@json-render/react";
import { getByPath } from "@json-render/core";

interface OrderLevel {
  price: number;
  volume: number;
  total?: number;
}

export function OrderBook({ element }: ComponentRenderProps) {
  const {
    bidsPath,
    asksPath,
    levels = 5,
    showTotal = true,
    priceDecimals = 2,
  } = element.props as {
    bidsPath: string;
    asksPath: string;
    levels?: number | null;
    showTotal?: boolean | null;
    priceDecimals?: number | null;
  };

  const { data } = useData();
  const bids = (getByPath(data, bidsPath) as OrderLevel[] | undefined) || [];
  const asks = (getByPath(data, asksPath) as OrderLevel[] | undefined) || [];

  const displayLevels = levels || 5;
  const decimals = priceDecimals || 2;

  // Slice to display levels
  const displayBids = bids.slice(0, displayLevels);
  const displayAsks = asks.slice(0, displayLevels).reverse(); // Reverse to show lowest ask at bottom

  // Calculate max volume for depth visualization
  const allVolumes = [...displayBids, ...displayAsks].map((o) => o.volume);
  const maxVolume = Math.max(...allVolumes, 1);

  const formatPrice = (price: number) => price.toFixed(decimals);
  const formatVolume = (vol: number) => {
    if (vol >= 10000) return (vol / 10000).toFixed(1) + "万";
    return vol.toLocaleString();
  };

  const rowStyle = {
    display: "grid",
    gridTemplateColumns: showTotal ? "1fr 1fr 1fr" : "1fr 1fr",
    gap: 8,
    padding: "4px 8px",
    fontSize: 12,
    position: "relative" as const,
  };

  const headerStyle = {
    ...rowStyle,
    color: "var(--muted)",
    fontWeight: 500,
    borderBottom: "1px solid var(--border)",
    marginBottom: 4,
  };

  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: 12,
      }}
    >
      <h4 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600 }}>
        买卖五档
      </h4>

      {/* Asks (sell orders) - shown in red */}
      <div style={{ marginBottom: 8 }}>
        <div style={headerStyle}>
          <span style={{ textAlign: "right" }}>价格</span>
          <span style={{ textAlign: "right" }}>数量</span>
          {showTotal && <span style={{ textAlign: "right" }}>累计</span>}
        </div>
        {displayAsks.map((ask, i) => {
          const depthWidth = (ask.volume / maxVolume) * 100;
          return (
            <div key={`ask-${i}`} style={rowStyle}>
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: `${depthWidth}%`,
                  background: "rgba(239, 68, 68, 0.1)",
                  zIndex: 0,
                }}
              />
              <span
                style={{
                  textAlign: "right",
                  color: "#ef4444",
                  zIndex: 1,
                  position: "relative",
                }}
              >
                {formatPrice(ask.price)}
              </span>
              <span
                style={{ textAlign: "right", zIndex: 1, position: "relative" }}
              >
                {formatVolume(ask.volume)}
              </span>
              {showTotal && (
                <span
                  style={{
                    textAlign: "right",
                    color: "var(--muted)",
                    zIndex: 1,
                    position: "relative",
                  }}
                >
                  {formatVolume(ask.total || ask.volume)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Spread indicator */}
      <div
        style={{
          padding: "8px",
          textAlign: "center",
          fontSize: 11,
          color: "var(--muted)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          margin: "4px 0",
        }}
      >
        {displayAsks.length > 0 && displayBids.length > 0 && (
          <>
            价差:{" "}
            {formatPrice(
              displayAsks[displayAsks.length - 1]?.price -
                displayBids[0]?.price,
            )}{" "}
            (
            {(
              ((displayAsks[displayAsks.length - 1]?.price -
                displayBids[0]?.price) /
                displayBids[0]?.price) *
              100
            ).toFixed(3)}
            %)
          </>
        )}
      </div>

      {/* Bids (buy orders) - shown in green */}
      <div>
        {displayBids.map((bid, i) => {
          const depthWidth = (bid.volume / maxVolume) * 100;
          return (
            <div key={`bid-${i}`} style={rowStyle}>
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: `${depthWidth}%`,
                  background: "rgba(34, 197, 94, 0.1)",
                  zIndex: 0,
                }}
              />
              <span
                style={{
                  textAlign: "right",
                  color: "#22c55e",
                  zIndex: 1,
                  position: "relative",
                }}
              >
                {formatPrice(bid.price)}
              </span>
              <span
                style={{ textAlign: "right", zIndex: 1, position: "relative" }}
              >
                {formatVolume(bid.volume)}
              </span>
              {showTotal && (
                <span
                  style={{
                    textAlign: "right",
                    color: "var(--muted)",
                    zIndex: 1,
                    position: "relative",
                  }}
                >
                  {formatVolume(bid.total || bid.volume)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
