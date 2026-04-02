"use client";

import Link from "next/link";
import { Cloud, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-4xl items-center px-4">
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <Cloud className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">Weather</span>
        </Link>

        <nav className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Forecast</span>
            </Link>
          </Button>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
