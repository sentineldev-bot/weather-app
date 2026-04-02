import type {
  GeoLocation,
  WeatherData,
  DailyForecast,
  HourlyForecast,
} from "./types";
import { decodeWeatherCode } from "./weather-codes";
import { deriveAlerts } from "./weather-alerts";

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

const HOURLY_PARAMS = [
  "temperature_2m",
  "weather_code",
  "precipitation_probability",
  "wind_speed_10m",
  "wind_direction_10m",
  "relative_humidity_2m",
  "is_day",
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
    `&hourly=${HOURLY_PARAMS}` +
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
  hourly?: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    precipitation_probability: number[];
    wind_speed_10m: number[];
    wind_direction_10m: number[];
    relative_humidity_2m: number[];
    is_day: number[];
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

  const hourly: HourlyForecast[] = [];
  if (raw.hourly?.time) {
    for (let i = 0; i < raw.hourly.time.length; i++) {
      const hIsNight = raw.hourly.is_day[i] === 0;
      const hCode = decodeWeatherCode(raw.hourly.weather_code[i], hIsNight);
      hourly.push({
        time: raw.hourly.time[i],
        temp: Math.round(raw.hourly.temperature_2m[i]),
        weatherCode: raw.hourly.weather_code[i],
        description: hCode.desc,
        icon: hCode.icon,
        precipProb: raw.hourly.precipitation_probability[i],
        windSpeed: Math.round(raw.hourly.wind_speed_10m[i]),
        windDir: raw.hourly.wind_direction_10m[i],
        humidity: raw.hourly.relative_humidity_2m[i],
        isDay: raw.hourly.is_day[i] === 1,
      });
    }
  }

  const result: WeatherData = {
    current,
    daily,
    hourly,
    alerts: [],
    timezone: raw.timezone || "auto",
    latitude: raw.latitude,
    longitude: raw.longitude,
  };

  // Derive alerts from weather conditions (SEN-380)
  result.alerts = deriveAlerts(result);

  return result;
}

// ============================================================
// Reverse Geocoding (SEN-377)
// ============================================================

interface ReverseGeoResult {
  name: string;
  country: string;
  admin1: string;
}

/**
 * Reverse geocode coordinates to a city name via Nominatim (free, no key).
 */
export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<ReverseGeoResult | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10&accept-language=en`;
    const res = await fetchWithTimeout(url, 5000);
    const data = await res.json();

    if (data?.address) {
      return {
        name:
          data.address.city ||
          data.address.town ||
          data.address.village ||
          data.address.county ||
          data.address.state ||
          "Unknown",
        country: data.address.country || "",
        admin1: data.address.state || "",
      };
    }
  } catch {
    // Fallback silently — caller handles null
  }
  return null;
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
