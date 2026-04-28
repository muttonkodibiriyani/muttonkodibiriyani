# AIC Next.js Migration Shell

This folder is the phase-2 migration scaffold for the AIC portal redesign.

## Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- Lucide React
- Recharts

## Run locally

1. Ensure Node.js and npm are available in PATH.
2. Install dependencies:
   - `npm install`
3. Start dev server:
   - `npm run dev`

## Dynamic architecture included

- Role-based dynamic routes: `src/app/workspace/[role]/page.tsx`
- Typed domain/config modules:
  - `src/lib/types.ts`
  - `src/lib/workspace-config.ts`
  - `src/lib/dashboard.ts`
- API routes (for future DB/CMS integration):
  - `src/app/api/initiatives/route.ts`
  - `src/app/api/dashboard/[role]/route.ts`

You can now change workspace behavior and content by editing structured config/data files, not static HTML.

## Migration intent

- Keep existing static portal live during migration.
- Rebuild role workspaces in this app incrementally.
- Move shared logic into typed modules under `src/lib`.
