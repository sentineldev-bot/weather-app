// ============================================================
// Open-Meteo API Types (SEN-375)
// ============================================================

/** Geocoding search result */
export interface GeoLocation {
  name: string;
  country: string;
  countryCode: string;
  admin1: string;
  latitude: number;
  longitude: number;
  population: number;
  timezone: string;
}

/** Current weather conditions */
export interface CurrentWeather {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDir: number;
  pressure: number;
  uvIndex: number;
  visibility: number;
  weatherCode: number;
  description: string;
  icon: string;
  isDay: boolean;
  time: string;
}

/** Daily forecast entry */
export interface DailyForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  description: string;
  icon: string;
  precipSum: number;
  precipProb: number;
  windMax: number;
  uvMax: number;
  sunrise: string;
  sunset: string;
}

/** Hourly forecast entry */
export interface HourlyForecast {
  time: string;
  temp: number;
  weatherCode: number;
  description: string;
  icon: string;
  precipProb: number;
  windSpeed: number;
  windDir: number;
  humidity: number;
  isDay: boolean;
}

/** Full weather response */
export interface WeatherData {
  current: CurrentWeather;
  daily: DailyForecast[];
  hourly: HourlyForecast[];
  alerts: WeatherAlert[];
  timezone: string;
  latitude: number;
  longitude: number;
}

/** Weather alert */
export interface WeatherAlert {
  id: string;
  event: string;
  severity: "extreme" | "severe" | "moderate" | "minor" | "unknown";
  description: string;
  start: string;
  end: string;
  senderName: string;
}

/** Saved favorite location */
export interface FavoriteLocation {
  name: string;
  country: string;
  countryCode: string;
  admin1: string;
  latitude: number;
  longitude: number;
  timezone: string;
  addedAt: string;
}

/** Weather code mapping entry */
export interface WeatherCodeInfo {
  desc: string;
  icon: string;
  night: string;
}
