import type { GeoLocation, WeatherData, DailyForecast } from "./types";
import { decodeWeatherCode } from "./weather-codes";

const GEO_BASE = "https://geocoding-api.open-meteo.com/v1";
const WEATHER_BASE = "https://api.open-meteo.com/v1";

// ============================================================
// Geocoding
// ============================================================

/**
 * Search for cities by name via Open-Meteo Geocoding API.
 */
export async function searchCities(
  query: string,
  limit: number = 6
): Promise<GeoLocation[]> {
  if (!query || query.trim().length < 2) return [];

  const url = `${GEO_BASE}/search?name=${encodeURIComponent(query.trim())}&count=${limit}&language=en&format=json`;

  const res = await fetchWithTimeout(url);
  const data = await res.json();

  if (!data.results) return [];

  return data.results.map(
    (r: Record<string, unknown>): GeoLocation => ({
      name: (r.name as string) || "",
      country: (r.country as string) || "",
      countryCode: (r.country_code as string) || "",
      admin1: (r.admin1 as string) || "",
      latitude: r.latitude as number,
      longitude: r.longitude as number,
      population: (r.population as number) || 0,
      timezone: (r.timezone as string) || "auto",
    })
  );
}

// ============================================================
// Weather
// ============================================================

const CURRENT_PARAMS = [
  "temperature_2m",
  "relative_humidity_2m",
  "apparent_temperature",
  "weather_code",
  "wind_speed_10m",
  "wind_direction_10m",
  "surface_pressure",
  "is_day",
  "uv_index",
  "visibility",
].join(",");

const DAILY_PARAMS = [
  "weather_code",
  "temperature_2m_max",
  "temperature_2m_min",
  "sunrise",
  "sunset",
  "precipitation_sum",
  "precipitation_probability_max",
  "wind_speed_10m_max",
  "uv_index_max",
].join(",");

/**
 * Fetch current weather + 7-day forecast from Open-Meteo.
 */
export async function fetchWeather(
  lat: number,
  lon: number,
  timezone: string = "auto"
): Promise<WeatherData> {
  const url =
    `${WEATHER_BASE}/forecast` +
    `?latitude=${lat}` +
    `&longitude=${lon}` +
    `&current=${CURRENT_PARAMS}` +
    `&daily=${DAILY_PARAMS}` +
    `&timezone=${encodeURIComponent(timezone)}` +
    `&forecast_days=7`;

  const res = await fetchWithTimeout(url);
  const data = await res.json();

  if (!data.current) {
    throw new Error("Invalid weather response — no current data.");
  }

  return normalizeWeatherData(data);
}

// ============================================================
// Normalization
// ============================================================

interface RawWeatherResponse {
  current: Record<string, number | string>;
  daily?: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
    uv_index_max: number[];
  };
  timezone?: string;
  latitude: number;
  longitude: number;
}

function normalizeWeatherData(raw: RawWeatherResponse): WeatherData {
  const c = raw.current;
  const isNight = (c.is_day as number) === 0;
  const code = decodeWeatherCode(c.weather_code as number, isNight);

  const current = {
    temp: Math.round(c.temperature_2m as number),
    feelsLike: Math.round(c.apparent_temperature as number),
    humidity: c.relative_humidity_2m as number,
    windSpeed: Math.round(c.wind_speed_10m as number),
    windDir: c.wind_direction_10m as number,
    pressure: Math.round(c.surface_pressure as number),
    uvIndex: (c.uv_index as number) ?? 0,
    visibility:
      c.visibility != null
        ? parseFloat(((c.visibility as number) / 1000).toFixed(1))
        : 0,
    weatherCode: c.weather_code as number,
    description: code.desc,
    icon: code.icon,
    isDay: (c.is_day as number) === 1,
    time: (c.time as string) || "",
  };

  const daily: DailyForecast[] = [];
  if (raw.daily?.time) {
    for (let i = 0; i < raw.daily.time.length; i++) {
      const dayCode = decodeWeatherCode(raw.daily.weather_code[i], false);
      daily.push({
        date: raw.daily.time[i],
        tempMax: Math.round(raw.daily.temperature_2m_max[i]),
        tempMin: Math.round(raw.daily.temperature_2m_min[i]),
        weatherCode: raw.daily.weather_code[i],
        description: dayCode.desc,
        icon: dayCode.icon,
        precipSum: raw.daily.precipitation_sum[i],
        precipProb: raw.daily.precipitation_probability_max[i],
        windMax: Math.round(raw.daily.wind_speed_10m_max[i]),
        uvMax: raw.daily.uv_index_max[i],
        sunrise: raw.daily.sunrise[i],
        sunset: raw.daily.sunset[i],
      });
    }
  }

  return {
    current,
    daily,
    timezone: raw.timezone || "auto",
    latitude: raw.latitude,
    longitude: raw.longitude,
  };
}

// ============================================================
// Utilities
// ============================================================

async function fetchWithTimeout(
  url: string,
  timeoutMs: number = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`API error: HTTP ${res.status}`);
    return res;
  } catch (err: unknown) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Request timed out — please try again.");
    }
    throw err;
  }
}

/** Convert wind direction degrees to compass string */
export function windDirection(degrees: number): string {
  const dirs = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  return dirs[Math.round(degrees / 22.5) % 16];
}

/** Format day string for forecast display */
export function formatDay(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return "Today";
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return d.toLocaleDateString("en", { weekday: "short" });
}
