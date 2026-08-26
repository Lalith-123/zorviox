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

| Route                         | Description                            |
| ----------------------------- | -------------------------------------- |
| `/`                           | Homepage with tool discovery           |
| `/tools`                      | All tools listing                      |
| `/tools/meta-tag-checker`     | Meta Tag Checker (fully functional)    |
| `/tools/sitemap-analyzer`     | Sitemap Analyzer (fully functional)    |
| `/tools/redirect-checker`     | Redirect Checker (fully functional)    |
| `/privacy`                    | Privacy policy                         |
| `/terms`                      | Terms of service                       |

## API

| Endpoint                  | Method | Description                            |
| ------------------------- | ------ | -------------------------------------- |
| `/api/meta-tag-checker`   | POST   | Analyzes a URL's meta tags             |
| `/api/sitemap-analyzer`   | POST   | Analyzes XML sitemaps for SEO issues   |
| `/api/redirect-checker`   | POST   | Traces HTTP redirect chains            |

## Structure

```
src/
├── app/
│   ├── layout.tsx                        # Root layout (Inter font, header, footer)
│   ├── page.tsx                          # Homepage
│   ├── not-found.tsx                     # Custom 404
│   ├── sitemap.ts                        # Dynamic sitemap
│   ├── robots.ts                         # robots.txt
│   ├── globals.css                       # Design system
│   ├── tools/
│   │   ├── page.tsx                      # Tools listing
│   │   ├── meta-tag-checker/page.tsx     # Meta Tag Checker + SEO content
│   │   ├── sitemap-analyzer/page.tsx     # Sitemap Analyzer + SEO content
│   │   └── redirect-checker/page.tsx     # Redirect Checker + SEO content
│   ├── api/
│   │   ├── meta-tag-checker/route.ts     # Server-side analysis
│   │   ├── sitemap-analyzer/route.ts     # Server-side sitemap analysis
│   │   └── redirect-checker/route.ts     # Server-side redirect tracing
│   ├── privacy/page.tsx
│   └── terms/page.tsx
├── components/
│   ├── layout/        (container, header, footer)
│   └── tools/         (meta-tag-checker-tool, sitemap-analyzer-tool, redirect-checker-tool)
├── lib/
│   ├── utils.ts       (cn utility)
│   ├── constants.ts   (site config, tools)
│   ├── sitemap/       (XML parsing, analysis, security)
│   │   ├── types.ts
│   │   ├── limits.ts
│   │   ├── security.ts
│   │   ├── parser.ts
│   │   └── analyzer.ts
│   └── redirect/      (HTTP redirect analysis)
│       ├── types.ts
│       ├── limits.ts
│       ├── security.ts
│       ├── normalize.ts
│       ├── headers.ts
│       ├── chain.ts
│       ├── analyzer.ts
│       └── scoring.ts
```

## Redirect Checker Features

- **Manual Redirect Handling**: Uses `redirect: "manual"` to inspect each hop individually
- **Complete Chain Analysis**: Records every redirect with status, location, and timing
- **Redirect Loop Detection**: Detects cycles by normalizing and tracking visited URLs
- **301/302/303/307/308 Detection**: Correctly identifies permanent vs temporary redirects
- **Relative Location Resolution**: Properly resolves relative `Location` headers
- **Query Parameter Preservation**: Preserves query parameters across redirects
- **Cross-Domain Detection**: Identifies hostname changes and cross-domain redirects
- **HTTP/HTTPS Detection**: Flags protocol changes
- **WWW/Non-WWW Detection**: Identifies hostname normalization redirects
- **Meta Refresh Detection**: Detects HTML `<meta http-equiv="refresh">` tags
- **JavaScript Redirect Detection**: Detects common JS redirect patterns (static analysis)
- **SSRF Protection**: Blocks private IPs, validates every redirect destination
- **Response Timing**: Measures individual hop and total response times
- **HTTP Header Analysis**: Shows relevant headers for each hop

## Adding a New Tool

1. Add entry to `src/lib/constants.ts`
2. Create page at `src/app/tools/your-tool/page.tsx`
3. Add API route at `src/app/api/your-tool/route.ts` if needed
4. Sitemap updates automatically
