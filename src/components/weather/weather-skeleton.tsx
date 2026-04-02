import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function WeatherSkeleton() {
  return (
    <div className="space-y-6">
      {/* Current weather skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Forecast skeleton */}
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
    </div>
  );
}
