import type { WeatherAlert, WeatherData } from "./types";

/**
 * Generate weather alerts based on current + forecast conditions.
 *
 * Open-Meteo doesn't have a universal alerts API, so we derive alerts
 * from weather data using standard meteorological thresholds.
 * This provides global coverage for any location.
 */
export function deriveAlerts(data: WeatherData): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const now = new Date().toISOString();
  const tomorrow = new Date(
    Date.now() + 24 * 60 * 60 * 1000
  ).toISOString();

  const c = data.current;
  const today = data.daily[0];
  const next3Days = data.daily.slice(0, 3);

  // --- Extreme temperature ---
  if (c.temp >= 40) {
    alerts.push({
      id: "heat-extreme",
      event: "Extreme Heat Warning",
      severity: "extreme",
      description: `Temperature is ${c.temp}°C. Dangerous heat conditions. Stay hydrated, avoid outdoor activity, and check on vulnerable individuals.`,
      start: now,
      end: tomorrow,
      senderName: "Weather App",
    });
  } else if (c.temp >= 35) {
    alerts.push({
      id: "heat-warning",
      event: "Heat Advisory",
      severity: "severe",
      description: `Temperature is ${c.temp}°C. Hot conditions expected. Drink plenty of water and limit sun exposure.`,
      start: now,
      end: tomorrow,
      senderName: "Weather App",
    });
  }

  if (c.temp <= -20) {
    alerts.push({
      id: "cold-extreme",
      event: "Extreme Cold Warning",
      severity: "extreme",
      description: `Temperature is ${c.temp}°C. Dangerous cold conditions. Risk of frostbite and hypothermia. Limit outdoor exposure.`,
      start: now,
      end: tomorrow,
      senderName: "Weather App",
    });
  } else if (c.temp <= -10) {
    alerts.push({
      id: "cold-warning",
      event: "Cold Weather Advisory",
      severity: "severe",
      description: `Temperature is ${c.temp}°C. Very cold conditions. Dress in layers and minimize time outdoors.`,
      start: now,
      end: tomorrow,
      senderName: "Weather App",
    });
  }

  // --- Thunderstorms ---
  if (c.weatherCode >= 95) {
    alerts.push({
      id: "thunderstorm",
      event:
        c.weatherCode >= 96
          ? "Severe Thunderstorm Warning"
          : "Thunderstorm Warning",
      severity: c.weatherCode >= 96 ? "severe" : "moderate",
      description: `${c.description} in the area. Possible lightning, heavy rain${c.weatherCode >= 96 ? ", and hail" : ""}. Seek shelter indoors.`,
      start: now,
      end: tomorrow,
      senderName: "Weather App",
    });
  }

  // --- High winds ---
  if (c.windSpeed >= 90) {
    alerts.push({
      id: "wind-extreme",
      event: "Hurricane-Force Wind Warning",
      severity: "extreme",
      description: `Wind speeds of ${c.windSpeed} km/h detected. Extremely dangerous conditions. Stay indoors and away from windows.`,
      start: now,
      end: tomorrow,
      senderName: "Weather App",
    });
  } else if (c.windSpeed >= 60) {
    alerts.push({
      id: "wind-warning",
      event: "High Wind Warning",
      severity: "severe",
      description: `Wind speeds of ${c.windSpeed} km/h. Strong winds may cause damage. Secure loose objects and avoid driving high-profile vehicles.`,
      start: now,
      end: tomorrow,
      senderName: "Weather App",
    });
  } else if (c.windSpeed >= 40) {
    alerts.push({
      id: "wind-advisory",
      event: "Wind Advisory",
      severity: "minor",
      description: `Wind speeds of ${c.windSpeed} km/h. Gusty conditions expected. Use caution when driving.`,
      start: now,
      end: tomorrow,
      senderName: "Weather App",
    });
  }

  // --- Heavy precipitation (next 3 days) ---
  for (const day of next3Days) {
    if (day.precipSum >= 50) {
      alerts.push({
        id: `flood-${day.date}`,
        event: "Flood Watch",
        severity: "severe",
        description: `Heavy precipitation of ${day.precipSum}mm expected on ${formatAlertDate(day.date)}. Risk of flooding in low-lying areas.`,
        start: day.date + "T00:00:00",
        end: day.date + "T23:59:59",
        senderName: "Weather App",
      });
      break; // Only show the first flood alert
    }
  }

  // --- Heavy snowfall ---
  if ([71, 73, 75, 77, 85, 86].includes(c.weatherCode)) {
    const isHeavy = [75, 77, 86].includes(c.weatherCode);
    alerts.push({
      id: "snow",
      event: isHeavy ? "Heavy Snow Warning" : "Winter Weather Advisory",
      severity: isHeavy ? "severe" : "moderate",
      description: `${c.description}. ${isHeavy ? "Heavy accumulation expected. Travel may be hazardous." : "Light to moderate snow. Roads may be slippery."}`,
      start: now,
      end: tomorrow,
      senderName: "Weather App",
    });
  }

  // --- Low visibility (fog) ---
  if (c.visibility < 1) {
    alerts.push({
      id: "fog",
      event: "Dense Fog Advisory",
      severity: "moderate",
      description: `Visibility is ${c.visibility} km. Dense fog conditions. Use low-beam headlights and reduce speed while driving.`,
      start: now,
      end: tomorrow,
      senderName: "Weather App",
    });
  }

  // --- UV extreme ---
  if (c.uvIndex >= 11) {
    alerts.push({
      id: "uv",
      event: "Extreme UV Warning",
      severity: "severe",
      description: `UV index is ${c.uvIndex.toFixed(1)} (Extreme). Avoid sun exposure between 10am-4pm. Wear SPF 50+ and protective clothing.`,
      start: now,
      end: tomorrow,
      senderName: "Weather App",
    });
  }

  // Sort by severity
  const severityOrder = { extreme: 0, severe: 1, moderate: 2, minor: 3, unknown: 4 };
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return alerts;
}

function formatAlertDate(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

/** Get CSS color class for alert severity */
export function alertSeverityColor(severity: WeatherAlert["severity"]): {
  bg: string;
  border: string;
  text: string;
  badge: string;
} {
  switch (severity) {
    case "extreme":
      return {
        bg: "bg-red-500/10",
        border: "border-red-500/50",
        text: "text-red-600 dark:text-red-400",
        badge: "bg-red-500 text-white",
      };
    case "severe":
      return {
        bg: "bg-orange-500/10",
        border: "border-orange-500/50",
        text: "text-orange-600 dark:text-orange-400",
        badge: "bg-orange-500 text-white",
      };
    case "moderate":
      return {
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/50",
        text: "text-yellow-600 dark:text-yellow-400",
        badge: "bg-yellow-500 text-black",
      };
    case "minor":
      return {
        bg: "bg-blue-500/10",
        border: "border-blue-500/50",
        text: "text-blue-600 dark:text-blue-400",
        badge: "bg-blue-500 text-white",
      };
    default:
      return {
        bg: "bg-muted",
        border: "border-border",
        text: "text-muted-foreground",
        badge: "bg-muted text-muted-foreground",
      };
  }
}
