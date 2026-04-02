"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MapPin, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchCities } from "@/lib/weather-api";
import { useDebounce } from "@/hooks/use-debounce";
import type { GeoLocation } from "@/lib/types";

interface CitySearchProps {
  onSelect: (location: GeoLocation) => void;
}

export function CitySearch({ onSelect }: CitySearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoLocation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const debouncedQuery = useDebounce(query, 350);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch results when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    searchCities(debouncedQuery, 6)
      .then((data) => {
        if (!cancelled) {
          setResults(data);
          setIsOpen(true);
          setActiveIdx(-1);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResults([]);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = useCallback(
    (loc: GeoLocation) => {
      setQuery(loc.name + (loc.admin1 ? `, ${loc.admin1}` : ""));
      setIsOpen(false);
      onSelect(loc);
    },
    [onSelect]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((prev) => Math.min(prev + 1, results.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((prev) => Math.max(prev - 1, -1));
    }
    if (e.key === "Enter" && activeIdx >= 0 && results[activeIdx]) {
      e.preventDefault();
      handleSelect(results[activeIdx]);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search city..."
          className="pl-9 pr-9"
          aria-label="Search for a city"
          autoComplete="off"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {isOpen && (
        <ul className="absolute top-full z-50 mt-1 w-full overflow-hidden rounded-md border bg-background shadow-lg">
          {results.length === 0 && !loading && (
            <li className="px-4 py-3 text-sm text-muted-foreground">
              No cities found
            </li>
          )}
          {results.map((loc, idx) => (
            <li
              key={`${loc.latitude}-${loc.longitude}`}
              className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-accent ${
                idx === activeIdx ? "bg-accent" : ""
              }`}
              onClick={() => handleSelect(loc)}
              onMouseEnter={() => setActiveIdx(idx)}
              role="option"
              aria-selected={idx === activeIdx}
            >
              <MapPin className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {loc.name}
                  {loc.admin1 && (
                    <span className="text-muted-foreground">
                      , {loc.admin1}
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">{loc.country}</p>
              </div>
              {loc.population > 0 && (
                <span className="text-xs tabular-nums text-muted-foreground">
                  {loc.population > 1000000
                    ? `${(loc.population / 1000000).toFixed(1)}M`
                    : loc.population > 1000
                      ? `${Math.round(loc.population / 1000)}K`
                      : loc.population}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
