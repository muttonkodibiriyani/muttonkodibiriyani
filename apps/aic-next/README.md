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

## Migration intent

- Keep existing static portal live during migration.
- Rebuild role workspaces in this app incrementally.
- Move shared logic into typed modules under `src/lib`.
