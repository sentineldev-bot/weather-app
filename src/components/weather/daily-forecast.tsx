"use client";

import { Droplets, Wind } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDay, windDirection } from "@/lib/weather-api";
import type { DailyForecast as DailyForecastType } from "@/lib/types";

interface DailyForecastProps {
  days: DailyForecastType[];
}

export function DailyForecast({ days }: DailyForecastProps) {
  // Show 5 days (skip today)
  const forecast = days.slice(1, 6);
  if (forecast.length === 0) return null;

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold">5-Day Forecast</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {forecast.map((day) => (
          <Card
            key={day.date}
            className="text-center transition-transform hover:-translate-y-0.5"
          >
            <CardContent className="p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {formatDay(day.date)}
              </p>

              <div className="my-2 text-3xl" role="img" aria-label={day.description}>
                {day.icon}
              </div>

              <p className="text-sm">
                <span className="font-semibold">{day.tempMax}°</span>{" "}
                <span className="text-muted-foreground">{day.tempMin}°</span>
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {day.description}
              </p>

              <div className="mt-3 flex items-center justify-center gap-3 text-xs text-muted-foreground">
                {day.precipProb > 0 && (
                  <span className="flex items-center gap-0.5">
                    <Droplets className="h-3 w-3" />
                    {day.precipProb}%
                  </span>
                )}
                <span className="flex items-center gap-0.5">
                  <Wind className="h-3 w-3" />
                  {day.windMax}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
