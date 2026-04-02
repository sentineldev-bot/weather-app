"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { CitySearch } from "@/components/weather/city-search";
import { CurrentWeather } from "@/components/weather/current-weather";
import { DailyForecast } from "@/components/weather/daily-forecast";
import { FavoritesSection } from "@/components/weather/favorites-section";
import { HourlyForecast } from "@/components/weather/hourly-forecast";
import { LocationButton } from "@/components/weather/location-button";
import { WeatherAlerts } from "@/components/weather/weather-alerts";
import { WeatherSkeleton } from "@/components/weather/weather-skeleton";
import { useWeather } from "@/hooks/use-weather";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useFavorites } from "@/hooks/use-favorites";
import type { GeoLocation } from "@/lib/types";

export default function Home() {
  const { weather, location, loading, error, fetchForLocation } = useWeather();
  const geo = useGeolocation(true);
  const {
    favorites,
    isFavorite,
    addFavorite,
    removeFavorite,
    canAdd,
  } = useFavorites();

  // When geolocation succeeds, auto-fetch weather
  useEffect(() => {
    if (geo.status === "granted" && geo.location && !weather && !loading) {
      fetchForLocation(geo.location);
    }
  }, [geo.status, geo.location, weather, loading, fetchForLocation]);

  function handleSelect(loc: GeoLocation) {
    fetchForLocation(loc);
  }

  function handleToggleFavorite() {
    if (!location) return;
    if (isFavorite(location.latitude, location.longitude)) {
      removeFavorite(location.latitude, location.longitude);
    } else {
      addFavorite(location);
    }
  }

  const isLoading = loading || (geo.status === "loading" && !weather);
  const currentIsFav = location
    ? isFavorite(location.latitude, location.longitude)
    : false;

  return (
    <div className="space-y-8">
      {/* Search + Location */}
      <section className="flex flex-col items-center gap-4">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          Check the Weather
        </h2>
        <p className="text-center text-muted-foreground">
          Search for any city or use your location
        </p>
        <CitySearch onSelect={handleSelect} />
        <LocationButton status={geo.status} onClick={() => geo.detect()} />
      </section>

      {/* Favorites */}
      <FavoritesSection
        favorites={favorites}
        onSelect={handleSelect}
        onRemove={removeFavorite}
      />

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-destructive" />
          <p>{error}</p>
        </div>
      )}

      {/* Loading */}
      {isLoading && <WeatherSkeleton />}

      {/* Alerts */}
      {weather && weather.alerts.length > 0 && !isLoading && (
        <WeatherAlerts alerts={weather.alerts} />
      )}

      {/* Current Weather + Forecasts */}
      {weather && location && !isLoading && (
        <>
          <CurrentWeather
            weather={weather.current}
            cityName={location.name}
            country={location.country}
            isFavorite={currentIsFav}
            onToggleFavorite={handleToggleFavorite}
            canFavorite={canAdd}
          />
          <HourlyForecast hours={weather.hourly} />
          <DailyForecast days={weather.daily} />
        </>
      )}

      {/* Empty state */}
      {!weather && !isLoading && !error && geo.hasAutoDetected && (
        <div className="py-16 text-center">
          <p className="text-4xl">🌤️</p>
          <p className="mt-4 text-lg text-muted-foreground">
            Search for a city or allow location access to see weather
          </p>
        </div>
      )}
    </div>
  );
}
