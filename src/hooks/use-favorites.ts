"use client";

import { useCallback, useEffect, useState } from "react";
import type { FavoriteLocation, GeoLocation } from "@/lib/types";

const STORAGE_KEY = "weather-app-favorites";
const MAX_FAVORITES = 10;

interface UseFavoritesReturn {
  favorites: FavoriteLocation[];
  isFavorite: (lat: number, lon: number) => boolean;
  addFavorite: (loc: GeoLocation) => boolean;
  removeFavorite: (lat: number, lon: number) => void;
  canAdd: boolean;
  maxReached: boolean;
}

function makeKey(lat: number, lon: number): string {
  return `${Math.round(lat * 100)}_${Math.round(lon * 100)}`;
}

export function useFavorites(): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<FavoriteLocation[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setFavorites(parsed);
      }
    } catch {
      // ignore corrupt data
    }
  }, []);

  // Persist to localStorage on change
  const persist = useCallback((favs: FavoriteLocation[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
  }, []);

  const isFavorite = useCallback(
    (lat: number, lon: number): boolean => {
      const key = makeKey(lat, lon);
      return favorites.some(
        (f) => makeKey(f.latitude, f.longitude) === key
      );
    },
    [favorites]
  );

  const addFavorite = useCallback(
    (loc: GeoLocation): boolean => {
      if (favorites.length >= MAX_FAVORITES) return false;
      if (isFavorite(loc.latitude, loc.longitude)) return false;

      const fav: FavoriteLocation = {
        name: loc.name,
        country: loc.country,
        countryCode: loc.countryCode,
        admin1: loc.admin1,
        latitude: loc.latitude,
        longitude: loc.longitude,
        timezone: loc.timezone,
        addedAt: new Date().toISOString(),
      };

      const next = [...favorites, fav];
      setFavorites(next);
      persist(next);
      return true;
    },
    [favorites, isFavorite, persist]
  );

  const removeFavorite = useCallback(
    (lat: number, lon: number) => {
      const key = makeKey(lat, lon);
      const next = favorites.filter(
        (f) => makeKey(f.latitude, f.longitude) !== key
      );
      setFavorites(next);
      persist(next);
    },
    [favorites, persist]
  );

  return {
    favorites,
    isFavorite,
    addFavorite,
    removeFavorite,
    canAdd: favorites.length < MAX_FAVORITES,
    maxReached: favorites.length >= MAX_FAVORITES,
  };
}

export { MAX_FAVORITES };
