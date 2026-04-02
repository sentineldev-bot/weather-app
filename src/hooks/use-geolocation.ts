"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GeoLocation } from "@/lib/types";
import { reverseGeocode } from "@/lib/weather-api";

const VISITED_KEY = "weather-app-geo-prompted";

type GeoStatus = "idle" | "loading" | "granted" | "denied" | "unavailable";

interface UseGeolocationReturn {
  status: GeoStatus;
  location: GeoLocation | null;
  detect: () => void;
  hasAutoDetected: boolean;
}

/**
 * Hook to manage browser geolocation with auto-detect on first visit.
 */
export function useGeolocation(
  autoDetectOnFirstVisit: boolean = true
): UseGeolocationReturn {
  const [status, setStatus] = useState<GeoStatus>("idle");
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [hasAutoDetected, setHasAutoDetected] = useState(false);
  const detecting = useRef(false);

  const detect = useCallback(async () => {
    if (detecting.current) return;
    if (!navigator.geolocation) {
      setStatus("unavailable");
      return;
    }

    detecting.current = true;
    setStatus("loading");

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: false,
          maximumAge: 300000, // cache for 5 minutes
        });
      });

      const { latitude, longitude } = pos.coords;

      // Reverse geocode to get a city name
      const geo = await reverseGeocode(latitude, longitude);

      const loc: GeoLocation = {
        name: geo?.name || "Current Location",
        country: geo?.country || "",
        countryCode: "",
        admin1: geo?.admin1 || "",
        latitude,
        longitude,
        population: 0,
        timezone: "auto",
      };

      setLocation(loc);
      setStatus("granted");
    } catch (err: unknown) {
      const geoErr = err as GeolocationPositionError;
      if (geoErr?.code === 1) {
        // PERMISSION_DENIED — don't show error, just silently set denied
        setStatus("denied");
      } else if (geoErr?.code === 2) {
        setStatus("unavailable");
      } else {
        // Timeout or other — treat as unavailable
        setStatus("unavailable");
      }
    } finally {
      detecting.current = false;
    }
  }, []);

  // Auto-detect on first visit
  useEffect(() => {
    if (!autoDetectOnFirstVisit) return;
    if (typeof window === "undefined") return;

    const prompted = localStorage.getItem(VISITED_KEY);
    if (prompted) {
      setHasAutoDetected(true);
      return;
    }

    localStorage.setItem(VISITED_KEY, "1");
    setHasAutoDetected(true);
    detect();
  }, [autoDetectOnFirstVisit, detect]);

  return { status, location, detect, hasAutoDetected };
}
