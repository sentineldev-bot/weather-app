"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Dynamic import — Leaflet needs window/document
const MapInner = dynamic(() => import("./weather-map-inner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] items-center justify-center rounded-lg border bg-muted/30">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  ),
});

export type WeatherLayer = "temp" | "precipitation" | "clouds" | "wind";

interface WeatherMapProps {
  latitude: number;
  longitude: number;
  onLocationClick: (lat: number, lon: number) => void;
}

const LAYERS: { id: WeatherLayer; label: string; emoji: string }[] = [
  { id: "temp", label: "Temperature", emoji: "🌡️" },
  { id: "precipitation", label: "Rain", emoji: "🌧️" },
  { id: "clouds", label: "Clouds", emoji: "☁️" },
  { id: "wind", label: "Wind", emoji: "💨" },
];

export function WeatherMap({
  latitude,
  longitude,
  onLocationClick,
}: WeatherMapProps) {
  const [activeLayer, setActiveLayer] = useState<WeatherLayer>("temp");

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">🗺️ Weather Map</h3>
        <div className="flex gap-1">
          {LAYERS.map((layer) => (
            <Button
              key={layer.id}
              variant={activeLayer === layer.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveLayer(layer.id)}
              className="gap-1 text-xs"
            >
              <span>{layer.emoji}</span>
              <span className="hidden sm:inline">{layer.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <MapInner
          latitude={latitude}
          longitude={longitude}
          activeLayer={activeLayer}
          onLocationClick={onLocationClick}
        />
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Click anywhere on the map to check weather for that location
      </p>
    </section>
  );
}
