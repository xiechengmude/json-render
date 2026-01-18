"use client";

import { type ComponentRenderProps } from "@json-render/react";
import { useData } from "@json-render/react";
import { getByPath } from "@json-render/core";

export function PriceAlert({ element }: ComponentRenderProps) {
  const {
    symbolPath,
    pricePath,
    targetPath,
    conditionPath,
    messagePath,
    severity = "warning",
  } = element.props as {
    symbolPath: string;
    pricePath: string;
    targetPath: string;
    conditionPath: string;
    messagePath: string;
    severity?: "info" | "warning" | "danger" | null;
  };

  const { data } = useData();

  const symbol = getByPath(data, symbolPath) as string;
  const price = getByPath(data, pricePath) as number;
  const target = getByPath(data, targetPath) as number;
  const condition = getByPath(data, conditionPath) as "above" | "below";
  const message = getByPath(data, messagePath) as string;

  const severityStyles = {
    info: {
      bg: "rgba(59, 130, 246, 0.1)",
      border: "#3b82f6",
      icon: "ℹ️",
    },
    warning: {
      bg: "rgba(245, 158, 11, 0.1)",
      border: "#f59e0b",
      icon: "⚠️",
    },
    danger: {
      bg: "rgba(239, 68, 68, 0.1)",
      border: "#ef4444",
      icon: "🚨",
    },
  };

  const style = severityStyles[severity || "warning"];

  const isTriggered =
    (condition === "above" && price >= target) ||
    (condition === "below" && price <= target);

  const progress =
    condition === "above"
      ? Math.min(100, (price / target) * 100)
      : Math.min(100, (target / price) * 100);

  return (
    <div
      style={{
        padding: 12,
        background: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: "var(--radius)",
        borderLeft: `4px solid ${style.border}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>{style.icon}</span>
          <span style={{ fontWeight: 600 }}>{symbol}</span>
          {isTriggered && (
            <span
              style={{
                fontSize: 10,
                padding: "2px 6px",
                background: style.border,
                color: "white",
                borderRadius: 4,
              }}
            >
              已触发
            </span>
          )}
        </div>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>
          {condition === "above" ? "突破" : "跌破"} {target.toFixed(2)}
        </span>
      </div>

      <div style={{ fontSize: 13, marginBottom: 8 }}>{message}</div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 12,
        }}
      >
        <span>当前: {price.toFixed(2)}</span>
        <div
          style={{
            flex: 1,
            height: 4,
            background: "var(--border)",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: style.border,
              transition: "width 0.3s",
            }}
          />
        </div>
        <span>目标: {target.toFixed(2)}</span>
      </div>
    </div>
  );
}
