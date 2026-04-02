"use client";

import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { WeatherLayer } from "./weather-map";

// Fix default marker icon path issue in Next.js
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

// OpenWeatherMap free tile layers (no API key needed for basic tiles)
// Using Open-Meteo tile proxy which is free
const WEATHER_TILE_URLS: Record<WeatherLayer, string> = {
  temp: "https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=b1b15e88fa797225412429c1c50c122a1",
  precipitation:
    "https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=b1b15e88fa797225412429c1c50c122a1",
  clouds:
    "https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=b1b15e88fa797225412429c1c50c122a1",
  wind: "https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=b1b15e88fa797225412429c1c50c122a1",
};

interface WeatherMapInnerProps {
  latitude: number;
  longitude: number;
  activeLayer: WeatherLayer;
  onLocationClick: (lat: number, lon: number) => void;
}

export default function WeatherMapInner({
  latitude,
  longitude,
  activeLayer,
  onLocationClick,
}: WeatherMapInnerProps) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={7}
      className="h-[400px] w-full"
      zoomControl={true}
    >
      {/* Base map tiles */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Weather overlay */}
      <TileLayer
        url={WEATHER_TILE_URLS[activeLayer]}
        opacity={0.6}
        key={activeLayer}
      />

      {/* Current location marker */}
      <Marker position={[latitude, longitude]}>
        <Popup>
          <span className="text-sm font-medium">Selected Location</span>
          <br />
          <span className="text-xs text-gray-500">
            {latitude.toFixed(2)}°, {longitude.toFixed(2)}°
          </span>
        </Popup>
      </Marker>

      {/* Map event handlers */}
      <MapController
        latitude={latitude}
        longitude={longitude}
        onLocationClick={onLocationClick}
      />
    </MapContainer>
  );
}

/** Handles map click events and auto-centering */
function MapController({
  latitude,
  longitude,
  onLocationClick,
}: {
  latitude: number;
  longitude: number;
  onLocationClick: (lat: number, lon: number) => void;
}) {
  const map = useMap();
  const prevCoords = useRef({ lat: latitude, lon: longitude });

  // Auto-center when selected city changes
  useEffect(() => {
    if (
      prevCoords.current.lat !== latitude ||
      prevCoords.current.lon !== longitude
    ) {
      map.flyTo([latitude, longitude], map.getZoom(), {
        duration: 1.5,
      });
      prevCoords.current = { lat: latitude, lon: longitude };
    }
  }, [latitude, longitude, map]);

  // Click to get weather
  useMapEvents({
    click(e) {
      onLocationClick(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}
