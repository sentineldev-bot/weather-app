"use client";

import { useCallback, useState } from "react";
import type { GeoLocation, WeatherData } from "@/lib/types";
import { fetchWeather } from "@/lib/weather-api";

interface UseWeatherReturn {
  weather: WeatherData | null;
  location: GeoLocation | null;
  loading: boolean;
  error: string | null;
  fetchForLocation: (loc: GeoLocation) => Promise<void>;
  clear: () => void;
}

/**
 * Hook to fetch and manage weather data for a selected location.
 */
export function useWeather(): UseWeatherReturn {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchForLocation = useCallback(async (loc: GeoLocation) => {
    setLoading(true);
    setError(null);
    setLocation(loc);

    try {
      const data = await fetchWeather(
        loc.latitude,
        loc.longitude,
        loc.timezone
      );
      setWeather(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch weather";
      setError(message);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setWeather(null);
    setLocation(null);
    setError(null);
  }, []);

  return { weather, location, loading, error, fetchForLocation, clear };
}
