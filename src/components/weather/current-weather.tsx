"use client";

import {
  Cloud,
  Droplets,
  Eye,
  Gauge,
  Sun,
  Thermometer,
  Wind,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { windDirection } from "@/lib/weather-api";
import type { CurrentWeather as CurrentWeatherType } from "@/lib/types";

interface CurrentWeatherProps {
  weather: CurrentWeatherType;
  cityName: string;
  country: string;
}

export function CurrentWeather({
  weather,
  cityName,
  country,
}: CurrentWeatherProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            {cityName}
            {country && (
              <span className="text-sm font-normal text-muted-foreground">
                {country}
              </span>
            )}
          </span>
          {weather.time && (
            <span className="text-xs font-normal text-muted-foreground">
              Updated:{" "}
              {new Date(weather.time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Main temp + icon */}
          <div className="flex items-center gap-4">
            <span className="text-6xl" role="img" aria-label={weather.description}>
              {weather.icon}
            </span>
            <div>
              <p className="text-5xl font-light tabular-nums">
                {weather.temp}°C
              </p>
              <p className="text-muted-foreground">{weather.description}</p>
              <p className="text-sm text-muted-foreground">
                Feels like {weather.feelsLike}°C
              </p>
            </div>
          </div>

          {/* Detail grid */}
          <div className="grid grid-cols-2 gap-3">
            <DetailItem
              icon={<Droplets className="h-4 w-4" />}
              label="Humidity"
              value={`${weather.humidity}%`}
            />
            <DetailItem
              icon={<Wind className="h-4 w-4" />}
              label="Wind"
              value={`${weather.windSpeed} km/h ${windDirection(weather.windDir)}`}
            />
            <DetailItem
              icon={<Gauge className="h-4 w-4" />}
              label="Pressure"
              value={`${weather.pressure} hPa`}
            />
            <DetailItem
              icon={<Eye className="h-4 w-4" />}
              label="Visibility"
              value={`${weather.visibility} km`}
            />
            <DetailItem
              icon={<Sun className="h-4 w-4" />}
              label="UV Index"
              value={formatUV(weather.uvIndex)}
            />
            <DetailItem
              icon={<Thermometer className="h-4 w-4" />}
              label="Feels Like"
              value={`${weather.feelsLike}°C`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg bg-muted/50 p-3">
      <div className="flex items-center gap-1 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-sm font-medium tabular-nums">{value}</span>
    </div>
  );
}

function formatUV(uv: number): string {
  if (uv <= 2) return `${uv.toFixed(1)} Low`;
  if (uv <= 5) return `${uv.toFixed(1)} Moderate`;
  if (uv <= 7) return `${uv.toFixed(1)} High`;
  if (uv <= 10) return `${uv.toFixed(1)} Very High`;
  return `${uv.toFixed(1)} Extreme`;
}
