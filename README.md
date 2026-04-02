# 🌤️ Weather App

Real-time weather forecasts powered by [Open-Meteo](https://open-meteo.com/) — free, no API key required.

Built with **Next.js 14+** (App Router), **TypeScript**, **Tailwind CSS**, and **shadcn/ui**.

## Getting Started

### Prerequisites

- Node.js 18.17+
- npm 9+

### Installation

```bash
git clone https://github.com/sentineldev-bot/weather-app.git
cd weather-app
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── globals.css      # Tailwind + shadcn/ui design tokens
│   ├── layout.tsx        # Root layout (header, main, footer)
│   └── page.tsx          # Home page with weather UI
├── components/
│   ├── ui/               # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── skeleton.tsx
│   ├── header.tsx        # App header with navigation
│   └── footer.tsx        # App footer
└── lib/
    └── utils.ts          # cn() utility for Tailwind class merging
```

## Tech Stack

| Technology | Purpose |
|------------|---------|
| [Next.js 14+](https://nextjs.org/) | React framework with App Router |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS |
| [shadcn/ui](https://ui.shadcn.com/) | Accessible UI components |
| [Open-Meteo](https://open-meteo.com/) | Weather API (free, no key) |
| [Lucide React](https://lucide.dev/) | Icons |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting |

## Adding shadcn/ui Components

This project uses [shadcn/ui](https://ui.shadcn.com/) with the CLI configured via `components.json`.

```bash
npx shadcn@latest add [component-name]
```

Pre-installed components: **Button**, **Card**, **Input**, **Skeleton**

## License

MIT
