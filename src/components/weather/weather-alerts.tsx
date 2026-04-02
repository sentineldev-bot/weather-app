"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { alertSeverityColor } from "@/lib/weather-alerts";
import type { WeatherAlert } from "@/lib/types";

interface WeatherAlertsProps {
  alerts: WeatherAlert[];
}

export function WeatherAlerts({ alerts }: WeatherAlertsProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const visible = alerts.filter((a) => !dismissed.has(a.id));
  if (visible.length === 0) return null;

  function dismiss(id: string) {
    setDismissed((prev) => new Set(prev).add(id));
  }

  function dismissAll() {
    setDismissed(new Set(alerts.map((a) => a.id)));
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-3">
      {/* Header with dismiss all */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <span className="text-sm font-semibold">
            {visible.length} Active Alert{visible.length !== 1 ? "s" : ""}
          </span>
        </div>
        {visible.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={dismissAll}
            className="text-xs"
          >
            Dismiss all
          </Button>
        )}
      </div>

      {/* Alert cards */}
      {visible.map((alert) => {
        const colors = alertSeverityColor(alert.severity);
        const isExpanded = expanded.has(alert.id);

        return (
          <div
            key={alert.id}
            className={`rounded-lg border ${colors.border} ${colors.bg} overflow-hidden transition-all`}
          >
            {/* Header */}
            <div className="flex items-start gap-3 p-3">
              <span
                className={`mt-0.5 flex-shrink-0 rounded px-2 py-0.5 text-xs font-bold uppercase ${colors.badge}`}
              >
                {alert.severity}
              </span>

              <div className="min-w-0 flex-1">
                <p className={`font-semibold ${colors.text}`}>
                  {alert.event}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatAlertTime(alert.start)} —{" "}
                  {formatAlertTime(alert.end)}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => toggleExpand(alert.id)}
                  aria-label={isExpanded ? "Collapse" : "Expand"}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => dismiss(alert.id)}
                  aria-label="Dismiss alert"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Expanded details */}
            {isExpanded && (
              <div className="border-t border-inherit px-3 pb-3 pt-2">
                <p className="text-sm leading-relaxed text-foreground/80">
                  {alert.description}
                </p>
                {alert.senderName && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Source: {alert.senderName}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Alert count badge for use in other components */
export function AlertBadge({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
      {count}
    </span>
  );
}

function formatAlertTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
