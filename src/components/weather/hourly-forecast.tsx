"use client";

import { Droplets, Wind } from "lucide-react";
import { windDirection } from "@/lib/weather-api";
import type { HourlyForecast as HourlyForecastType } from "@/lib/types";

interface HourlyForecastProps {
  hours: HourlyForecastType[];
}

export function HourlyForecast({ hours }: HourlyForecastProps) {
  // Show next 24 hours from now
  const now = new Date();
  const next24 = hours
    .filter((h) => new Date(h.time) >= now)
    .slice(0, 24);

  if (next24.length === 0) return null;

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold">24-Hour Forecast</h3>

      {/* Scrollable row */}
      <div className="overflow-x-auto">
        <div className="flex gap-2 pb-2" style={{ minWidth: "max-content" }}>
          {next24.map((hour, idx) => {
            const time = new Date(hour.time);
            const label =
              idx === 0
                ? "Now"
                : time.toLocaleTimeString([], {
                    hour: "numeric",
                    hour12: true,
                  });

            return (
              <div
                key={hour.time}
                className={`flex w-16 flex-shrink-0 flex-col items-center gap-1 rounded-lg border p-2 text-center transition-colors ${
                  !hour.isDay
                    ? "border-border/50 bg-muted/30"
                    : "border-border bg-card"
                }`}
              >
                <span className="text-[10px] font-medium text-muted-foreground">
                  {label}
                </span>
                <span className="text-lg" role="img" aria-label={hour.description}>
                  {hour.icon}
                </span>
                <span className="text-sm font-semibold tabular-nums">
                  {hour.temp}°
                </span>

                {hour.precipProb > 0 && (
                  <span className="flex items-center gap-0.5 text-[10px] text-blue-400">
                    <Droplets className="h-2.5 w-2.5" />
                    {hour.precipProb}%
                  </span>
                )}

                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <Wind className="h-2.5 w-2.5" />
                  {hour.windSpeed}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Temperature chart */}
      <TemperatureChart hours={next24} />
    </section>
  );
}

// ============================================================
// SVG Temperature Chart
// ============================================================

function TemperatureChart({ hours }: { hours: HourlyForecastType[] }) {
  if (hours.length < 2) return null;

  const temps = hours.map((h) => h.temp);
  const min = Math.min(...temps) - 2;
  const max = Math.max(...temps) + 2;
  const range = max - min || 1;

  const width = 600;
  const height = 120;
  const padX = 30;
  const padY = 20;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  const points = temps.map((t, i) => ({
    x: padX + (i / (temps.length - 1)) * chartW,
    y: padY + (1 - (t - min) / range) * chartH,
    temp: t,
  }));

  // Build SVG path
  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  // Gradient fill area
  const areaD =
    pathD +
    ` L ${points[points.length - 1].x.toFixed(1)} ${height - padY} L ${points[0].x.toFixed(1)} ${height - padY} Z`;

  return (
    <div className="rounded-lg border bg-card p-3">
      <p className="mb-2 text-xs font-medium text-muted-foreground">
        Temperature Trend
      </p>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        preserveAspectRatio="none"
        aria-label="Hourly temperature chart"
      >
        <defs>
          <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Fill area */}
        <path d={areaD} fill="url(#tempFill)" />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots + labels at key points (every 4th) */}
        {points.map((p, i) => {
          if (i % 4 !== 0 && i !== points.length - 1) return null;
          return (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r="3"
                fill="hsl(var(--primary))"
              />
              <text
                x={p.x}
                y={p.y - 8}
                textAnchor="middle"
                className="fill-foreground text-[9px]"
              >
                {p.temp}°
              </text>
            </g>
          );
        })}

        {/* X-axis labels */}
        {points.map((p, i) => {
          if (i % 4 !== 0) return null;
          const time = new Date(hours[i].time);
          const label = time.toLocaleTimeString([], {
            hour: "numeric",
            hour12: true,
          });
          return (
            <text
              key={`x-${i}`}
              x={p.x}
              y={height - 4}
              textAnchor="middle"
              className="fill-muted-foreground text-[8px]"
            >
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
