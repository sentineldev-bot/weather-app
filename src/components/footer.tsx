export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container mx-auto flex max-w-4xl flex-col items-center gap-2 px-4 py-4 md:h-14 md:flex-row md:justify-between">
        <p className="text-center text-sm text-muted-foreground">
          Powered by{" "}
          <a
            href="https://open-meteo.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-4 hover:text-foreground"
          >
            Open-Meteo
          </a>{" "}
          — Free weather API, no key required.
        </p>
        <p className="text-center text-xs text-muted-foreground">
          Built with Next.js, Tailwind CSS &amp; shadcn/ui
        </p>
      </div>
    </footer>
  );
}
