import type { WeatherCodeInfo } from "./types";

/**
 * WMO Weather Code → Description + Emoji Icon
 * https://open-meteo.com/en/docs#weathervariables
 */
export const WMO_CODES: Record<number, WeatherCodeInfo> = {
  0: { desc: "Clear sky", icon: "☀️", night: "🌙" },
  1: { desc: "Mainly clear", icon: "🌤️", night: "🌙" },
  2: { desc: "Partly cloudy", icon: "⛅", night: "☁️" },
  3: { desc: "Overcast", icon: "☁️", night: "☁️" },
  45: { desc: "Fog", icon: "🌫️", night: "🌫️" },
  48: { desc: "Rime fog", icon: "🌫️", night: "🌫️" },
  51: { desc: "Light drizzle", icon: "🌦️", night: "🌧️" },
  53: { desc: "Moderate drizzle", icon: "🌦️", night: "🌧️" },
  55: { desc: "Dense drizzle", icon: "🌧️", night: "🌧️" },
  56: { desc: "Freezing drizzle", icon: "🌧️", night: "🌧️" },
  57: { desc: "Heavy freezing drizzle", icon: "🌧️", night: "🌧️" },
  61: { desc: "Slight rain", icon: "🌦️", night: "🌧️" },
  63: { desc: "Moderate rain", icon: "🌧️", night: "🌧️" },
  65: { desc: "Heavy rain", icon: "🌧️", night: "🌧️" },
  66: { desc: "Freezing rain", icon: "🌧️", night: "🌧️" },
  67: { desc: "Heavy freezing rain", icon: "🌧️", night: "🌧️" },
  71: { desc: "Slight snow", icon: "🌨️", night: "🌨️" },
  73: { desc: "Moderate snow", icon: "🌨️", night: "🌨️" },
  75: { desc: "Heavy snow", icon: "❄️", night: "❄️" },
  77: { desc: "Snow grains", icon: "❄️", night: "❄️" },
  80: { desc: "Light showers", icon: "🌦️", night: "🌧️" },
  81: { desc: "Moderate showers", icon: "🌧️", night: "🌧️" },
  82: { desc: "Violent showers", icon: "⛈️", night: "⛈️" },
  85: { desc: "Light snow showers", icon: "🌨️", night: "🌨️" },
  86: { desc: "Heavy snow showers", icon: "❄️", night: "❄️" },
  95: { desc: "Thunderstorm", icon: "⛈️", night: "⛈️" },
  96: { desc: "Thunderstorm with hail", icon: "⛈️", night: "⛈️" },
  99: { desc: "Severe thunderstorm", icon: "⛈️", night: "⛈️" },
};

export function decodeWeatherCode(
  code: number,
  isNight: boolean = false
): { desc: string; icon: string } {
  const entry = WMO_CODES[code] ?? { desc: "Unknown", icon: "❓", night: "❓" };
  return { desc: entry.desc, icon: isNight ? entry.night : entry.icon };
}
