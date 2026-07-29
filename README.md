# zorviox

Monorepo for various projects and experiments.

## Current Setup

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Library:** shadcn/ui
- **Package Manager:** npm

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Commands

| Command          | Description                |
| ---------------- | -------------------------- |
| `npm run dev`    | Start development server   |
| `npm run build`  | Build for production       |
| `npm run start`  | Start production server    |
| `npm run lint`   | Run ESLint                 |

## Project Structure

```
zorviox/
├── src/
│   ├── app/          # Next.js App Router pages & layouts
│   ├── components/   # UI components (shadcn/ui)
│   └── lib/          # Utility functions
└── ...
```