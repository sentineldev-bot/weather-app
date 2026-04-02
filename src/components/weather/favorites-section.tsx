"use client";

import { useEffect, useState } from "react";
import { Loader2, Star, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchWeather } from "@/lib/weather-api";
import type { CurrentWeather, FavoriteLocation, GeoLocation } from "@/lib/types";

interface FavoritesSectionProps {
  favorites: FavoriteLocation[];
  onSelect: (loc: GeoLocation) => void;
  onRemove: (lat: number, lon: number) => void;
}

interface FavWeather {
  temp: number;
  icon: string;
  description: string;
}

export function FavoritesSection({
  favorites,
  onSelect,
  onRemove,
}: FavoritesSectionProps) {
  const [weatherCache, setWeatherCache] = useState<
    Record<string, FavWeather | "loading" | "error">
  >({});

  // Auto-refresh weather for all favorites on mount / change
  useEffect(() => {
    if (favorites.length === 0) return;

    favorites.forEach((fav) => {
      const key = `${fav.latitude}_${fav.longitude}`;
      // Skip if already loaded
      if (weatherCache[key] && weatherCache[key] !== "error") return;

      setWeatherCache((prev) => ({ ...prev, [key]: "loading" }));

      fetchWeather(fav.latitude, fav.longitude, fav.timezone)
        .then((data) => {
          setWeatherCache((prev) => ({
            ...prev,
            [key]: {
              temp: data.current.temp,
              icon: data.current.icon,
              description: data.current.description,
            },
          }));
        })
        .catch(() => {
          setWeatherCache((prev) => ({ ...prev, [key]: "error" }));
        });
    });
    // Only run on favorites change, not weatherCache
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favorites]);

  if (favorites.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Star className="h-4 w-4 text-yellow-500" />
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Favorites
        </h3>
        <span className="text-xs text-muted-foreground">
          ({favorites.length}/10)
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
        {favorites.map((fav) => {
          const key = `${fav.latitude}_${fav.longitude}`;
          const w = weatherCache[key];

          return (
            <Card
              key={key}
              className="group cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md"
              onClick={() =>
                onSelect({
                  ...fav,
                  population: 0,
                })
              }
            >
              <CardContent className="relative p-3">
                {/* Remove button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -right-1 -top-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(fav.latitude, fav.longitude);
                  }}
                  aria-label={`Remove ${fav.name}`}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>

                <p className="truncate text-sm font-medium">{fav.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {fav.country}
                </p>

                <div className="mt-2 flex items-center gap-2">
                  {w === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : w === "error" ? (
                    <span className="text-xs text-muted-foreground">--</span>
                  ) : w ? (
                    <>
                      <span className="text-lg">{w.icon}</span>
                      <span className="text-lg font-light tabular-nums">
                        {w.temp}°
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">--</span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
