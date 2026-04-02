"use client";

import { Loader2, LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LocationButtonProps {
  status: "idle" | "loading" | "granted" | "denied" | "unavailable";
  onClick: () => void;
}

export function LocationButton({ status, onClick }: LocationButtonProps) {
  const isLoading = status === "loading";
  const isDenied = status === "denied";
  const isUnavailable = status === "unavailable";

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={onClick}
        disabled={isLoading || isUnavailable}
        className="gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LocateFixed className="h-4 w-4" />
        )}
        {isLoading
          ? "Detecting..."
          : isDenied
            ? "Location denied — try again"
            : "Use my location"}
      </Button>
      {isDenied && (
        <p className="text-xs text-muted-foreground">
          Enable location access in your browser settings
        </p>
      )}
      {isUnavailable && (
        <p className="text-xs text-muted-foreground">
          Geolocation not available in this browser
        </p>
      )}
    </div>
  );
}
