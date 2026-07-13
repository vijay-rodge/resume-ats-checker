# Resume Scorecard

A React-based resume analysis tool that evaluates resumes against ATS (Applicant Tracking System) criteria. Built with TanStack Start, React 19, and Tailwind CSS.

## Features

- **Resume Upload** — Drag-and-drop support for PDF and DOCX files
- **ATS Analysis** — Scans resumes for keywords, formatting, and structure
- **Score Visualization** — Ring charts and meters showing ATS compatibility
- **Skill Detection** — Identifies technical and soft skills from resume content
- **Analysis Dashboard** — Detailed breakdown of resume strengths and weaknesses

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | TanStack Start (React) |
| UI | React 19, Radix UI, Tailwind CSS 4 |
| Routing | TanStack Router |
| Charts | Recharts |
| PDF Parsing | pdfjs-dist |
| DOCX Parsing | mammoth |
| Form Handling | React Hook Form + Zod |
| Deployment | Cloudflare Pages |

## Prerequisites

- **Node.js** 18+ 
- **npm** 10+ (or Bun)

## Installation

```bash
# Navigate to project directory
cd resume-scorecard

# Install dependencies
npm install --legacy-peer-deps
```

> **Note**: The `--legacy-peer-deps` flag is required due to a peer dependency conflict between React 19 and recharts.

## Development

```bash
# Start development server
npm run dev
```

The app will be available at `http://localhost:5173` (or the port shown in terminal).

## Build

```bash
# Production build
npm run build

# Development build
npm run build:dev

# Preview production build
npm run preview
```

## Project Structure

```
resume-scorecard/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── analysis-dashboard.tsx
│   │   ├── ats-meter.tsx
│   │   ├── score-ring.tsx
│   │   ├── theme-toggle.tsx
│   │   ├── upload-zone.tsx
│   │   └── ui/              # Radix UI components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Core logic
│   │   ├── analyzer.ts      # ATS scoring logic
│   │   ├── parser.ts        # PDF/DOCX parsing
│   │   └── skills.ts        # Skill detection
│   ├── routes/              # Page routes
│   │   ├── __root.tsx       # Root layout
│   │   └── index.tsx        # Home page
│   ├── router.tsx           # Router configuration
│   ├── routeTree.gen.ts     # Generated route tree
│   └── styles.css           # Global styles
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
└── wrangler.jsonc           # Cloudflare Pages config
```

## Key Components

- **UploadZone** — Handles file drag-and-drop, supports PDF and DOCX
- **Analyzer** — Scores resumes on keywords, formatting, length, and structure
- **Parser** — Extracts text from PDF (pdfjs-dist) and DOCX (mammoth) files
- **Skills** — Matches extracted text against a database of technical skills

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

## Known Issues

- React 19 peer dependency conflict with recharts — use `--legacy-peer-deps` during install
- Some Radix UI components may need additional peer dependency flags

## License

Private — All rights reserved