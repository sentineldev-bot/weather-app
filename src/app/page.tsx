import { Cloud, MapPin, Thermometer, Wind } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Search */}
      <section className="flex flex-col items-center gap-4">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          Check the Weather
        </h2>
        <p className="text-center text-muted-foreground">
          Search for any city to get real-time weather and forecasts
        </p>
        <div className="flex w-full max-w-md gap-2">
          <Input placeholder="Search city..." className="flex-1" />
          <Button>
            <MapPin className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
      </section>

      {/* Current Weather Skeleton (placeholder for SEN-375+) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Current Weather
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex items-center gap-4">
              <div className="text-6xl">🌤️</div>
              <div>
                <p className="text-4xl font-light tabular-nums">--°C</p>
                <p className="text-muted-foreground">Feels like --°C</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <DetailCard
                icon={<Thermometer className="h-4 w-4" />}
                label="Humidity"
                value="--%"
              />
              <DetailCard
                icon={<Wind className="h-4 w-4" />}
                label="Wind"
                value="-- km/h"
              />
              <DetailCard
                icon={<Cloud className="h-4 w-4" />}
                label="Pressure"
                value="-- hPa"
              />
              <DetailCard
                icon={<MapPin className="h-4 w-4" />}
                label="Visibility"
                value="-- km"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5-Day Forecast Skeleton */}
      <section>
        <h3 className="mb-4 text-lg font-semibold">5-Day Forecast</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="text-center">
              <CardContent className="p-4">
                <Skeleton className="mx-auto mb-2 h-4 w-12" />
                <Skeleton className="mx-auto mb-2 h-10 w-10 rounded-full" />
                <Skeleton className="mx-auto h-4 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function DetailCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg bg-muted/50 p-3">
      <div className="flex items-center gap-1 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-sm font-medium tabular-nums">{value}</span>
    </div>
  );
}
