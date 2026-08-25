# Zorviox

Simple tools for the modern web.

## Tech Stack

- **Next.js 16** (App Router, Turbopack)
- **TypeScript** (strict)
- **Tailwind CSS v4**
- **shadcn/ui** (base-nova style)
- **Inter** font (via next/font/google)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Build for production     |
| `npm run start` | Start production server  |
| `npm run lint`  | Run ESLint               |

## Pages

| Route                        | Description                        |
| ---------------------------- | ---------------------------------- |
| `/`                          | Homepage with tool discovery       |
| `/tools`                     | All tools listing                  |
| `/tools/meta-tag-checker`    | Meta Tag Checker (fully functional)|
| `/privacy`                   | Privacy policy                     |
| `/terms`                     | Terms of service                   |

## API

| Endpoint                  | Method | Description                        |
| ------------------------- | ------ | ---------------------------------- |
| `/api/meta-tag-checker`   | POST   | Analyzes a URL's meta tags         |

## Structure

```
src/
├── app/
│   ├── layout.tsx                     # Root layout (Inter font, header, footer)
│   ├── page.tsx                       # Homepage
│   ├── not-found.tsx                  # Custom 404
│   ├── sitemap.ts                     # Dynamic sitemap
│   ├── robots.ts                      # robots.txt
│   ├── globals.css                    # Design system
│   ├── tools/
│   │   ├── page.tsx                   # Tools listing
│   │   └── meta-tag-checker/page.tsx  # Meta Tag Checker + SEO content
│   ├── api/meta-tag-checker/route.ts  # Server-side analysis
│   ├── privacy/page.tsx
│   └── terms/page.tsx
├── components/
│   ├── layout/        (container, header, footer)
│   └── tools/         (meta-tag-checker-tool)
└── lib/
    ├── utils.ts       (cn utility)
    └── constants.ts   (site config, tools)
```

## Adding a New Tool

1. Add entry to `src/lib/constants.ts`
2. Create page at `src/app/tools/your-tool/page.tsx`
3. Add API route at `src/app/api/your-tool/route.ts` if needed
4. Sitemap updates automatically
