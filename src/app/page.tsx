"use client";

import { AlertCircle } from "lucide-react";
import { CitySearch } from "@/components/weather/city-search";
import { CurrentWeather } from "@/components/weather/current-weather";
import { WeatherSkeleton } from "@/components/weather/weather-skeleton";
import { useWeather } from "@/hooks/use-weather";
import type { GeoLocation } from "@/lib/types";

export default function Home() {
  const { weather, location, loading, error, fetchForLocation } = useWeather();

  function handleSelect(loc: GeoLocation) {
    fetchForLocation(loc);
  }

  return (
    <div className="space-y-8">
      {/* Search */}
      <section className="flex flex-col items-center gap-4">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          Check the Weather
        </h2>
        <p className="text-center text-muted-foreground">
          Search for any city to get real-time weather and forecasts
        </p>
        <CitySearch onSelect={handleSelect} />
      </section>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-destructive" />
          <p>{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && <WeatherSkeleton />}

      {/* Current Weather */}
      {weather && location && !loading && (
        <CurrentWeather
          weather={weather.current}
          cityName={location.name}
          country={location.country}
        />
      )}

      {/* Empty state */}
      {!weather && !loading && !error && (
        <div className="py-16 text-center">
          <p className="text-4xl">🌤️</p>
          <p className="mt-4 text-lg text-muted-foreground">
            Search for a city above to see current weather
          </p>
        </div>
      )}
    </div>
  );
}
