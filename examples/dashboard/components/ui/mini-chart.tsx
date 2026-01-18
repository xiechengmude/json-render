"use client";

import { type ComponentRenderProps } from "@json-render/react";
import { useData } from "@json-render/react";
import { getByPath } from "@json-render/core";

export function MiniChart({ element }: ComponentRenderProps) {
  const {
    dataPath,
    type = "line",
    color = "blue",
    width = 80,
    height = 32,
  } = element.props as {
    dataPath: string;
    type?: "line" | "area" | "bar" | null;
    color?: "green" | "red" | "blue" | "gray" | null;
    width?: number | null;
    height?: number | null;
  };

  const { data } = useData();
  const chartData = getByPath(data, dataPath) as
    | Array<{ value: number }>
    | number[]
    | undefined;

  if (!chartData || chartData.length < 2) {
    return <div style={{ width: width || 80, height: height || 32 }} />;
  }

  // Normalize data
  const values = chartData.map((d) => (typeof d === "number" ? d : d.value));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const w = width || 80;
  const h = height || 32;

  const colorMap = {
    green: "#22c55e",
    red: "#ef4444",
    blue: "#3b82f6",
    gray: "#6b7280",
  };

  const strokeColor = colorMap[color || "blue"];

  // Generate path points
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return { x, y };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const areaPath = linePath + ` L ${w} ${h} L 0 ${h} Z`;

  if (type === "bar") {
    const barWidth = Math.max(2, w / values.length - 1);
    return (
      <svg width={w} height={h}>
        {values.map((v, i) => {
          const barHeight = ((v - min) / range) * h;
          const x = (i / values.length) * w;
          return (
            <rect
              key={i}
              x={x}
              y={h - barHeight}
              width={barWidth}
              height={barHeight}
              fill={strokeColor}
              opacity={0.7}
            />
          );
        })}
      </svg>
    );
  }

  return (
    <svg width={w} height={h}>
      {type === "area" && (
        <path d={areaPath} fill={strokeColor} opacity={0.2} />
      )}
      <path d={linePath} fill="none" stroke={strokeColor} strokeWidth={1.5} />
    </svg>
  );
}
