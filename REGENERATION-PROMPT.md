# AIC Portal — AI Regeneration Prompt

This file is the master prompt that any agent (Claude, GPT-4, Gemini) can paste into Cursor or another AI workspace to **regenerate the entire Alshaya Investment Council portal from scratch**.

---

## How to use

1. Open Cursor IDE (or your preferred AI workspace) in an empty directory
2. Open the AI chat panel (Cmd/Ctrl + L)
3. Paste the prompt below
4. The agent will scaffold every file specified in `## 📁 COMPLETE FILE STRUCTURE`
5. After all files are generated, run `npx serve . -p 3000` and open `http://localhost:3000`

If the agent stops, say "continue" until all files are present.

---

## Build prompt

> You are an expert full-stack Azure developer. Build the complete **Alshaya Investment Council Portal** version 2.1.0 from scratch. The portal is an enterprise investment governance platform for Alshaya Group's 70+ retail brands across the GCC. It uses pure HTML5/CSS3/vanilla JS (no build tools), is hosted on Azure Static Web Apps with Microsoft Entra ID auth, and proxies all data access through Azure API Management to Azure Cosmos DB.
>
> **Roles** (5): Initiative_Submitter, Strategy_Reviewer, Investment_Committee, Portfolio_Viewer, Platform_Admin.
>
> **Workflow**: Draft → Submitted → Gatekeeper Review → Validated → Council Vote → Approved/Conditional/Rejected → Stage 0 (Discovery, 4%) → Stage 1 (MVP, 30%) → Stage 2 (Pilot, 40%) → Stage 3 (Rollout, 26%) → Completed.
>
> **Scoring**: 5-dimension weighted Gatekeeper score (30/25/20/15/10). 6-shark Council panel + Red Team modifier. Pass ≥ 75, Conditional 60–74, Fail < 60.
>
> Build all files in `## 📁 COMPLETE FILE STRUCTURE` (see CURSOR_BUILD_PROMPT.md). Apply the `## 🎨 VISUAL DESIGN SYSTEM` (deep navy dark theme, indigo accent, fixed 240px sidebar). Implement every method in `## 🗃️ JAVASCRIPT MODULES`. Build all 10 pages per `## 📄 PAGE SPECIFICATIONS`. Apply `## 🔒 SECURITY REQUIREMENTS` to every file. The portal must work 100% in demo mode (localStorage-backed, no Azure dependency) AND in production mode (APIM + Cosmos DB).
>
> Sample data: 5 initiatives (INV-2026-0041 Starbucks ML inventory, INV-2026-0038 H&M C&C, INV-2026-0044 VS self-checkout draft, INV-2026-0047 loyalty unification, INV-2025-0031 dynamic pricing closed) and 7 users (Dina Al-Saleh, Faisal Al-Tamimi, Rania Al-Khoury, Khalid Al-Mansouri, Tariq Mansour, Sarah Al-Rashidi, Omar Al-Hassan).
>
> Build order:
> 1. css/design-system.css
> 2. js/config.js, db.js, security.js, auth.js, azure-api.js, app.js
> 3. index.html, portal-router.html, 403.html
> 4. initiator-, strategy-, cxo-dashboard.html
> 5. submit-initiative.html (8-step wizard), initiative-detail.html (7 tabs)
> 6. admin.html, ms-guide.html, _test.html
> 7. staticwebapp.config.json
> 8. infra/main.bicep + 8 modules
> 9. .github/workflows/azure-deploy.yml + CODEOWNERS + PR template
> 10. README.md, AZURE-DEPLOY.md, SECURITY.md

---

## Quality gates the regenerated portal must pass

- Open `_test.html` — all assertions must pass green
- Each role can sign in via demo selector and is routed to the correct landing page
- Submitter cannot access `admin.html` (gets 403)
- Admin sees all 5 sample initiatives and 7 sample users
- Score submission updates the initiative in `localStorage` immediately
- Stage gate approval persists and is visible in audit log
- All charts render without console errors
- CSP and security headers present in `staticwebapp.config.json`
- No Cosmos master key visible anywhere in client code
- All `innerHTML` writes routed through `AIC_SEC.sanitize()`

---

## File-level invariants

| Invariant | Rule |
|-----------|------|
| `'use strict'` at top of every JS file | Yes |
| `Object.freeze()` on all config objects | Yes |
| Console log prefix | `[AIC <Module>]` |
| Sample DB version | `'2.1.0'` (reseeds when changed) |
| localStorage keys | `aic_db_initiatives`, `aic_db_users`, `aic_db_drafts`, `aic_db_audit`, `aic_db_version`, `aic_user`, `aic_session`, `aic_profile` |
| Frame-busting | `if (window.top !== window.self)` in security.js |
| Session policy | 8h absolute, 30min idle |
| Audit batch | flush every 10 events or 15s |

---

## Versioning policy

When making changes that alter the data shape:

1. Bump `AIC_CONFIG.app.version` in `js/config.js`
2. Bump `VERSION` const in `js/db.js` so existing demo databases reseed
3. Update the version badge in README and the sidebar logo footer

Backwards-incompatible Cosmos schema changes require:

1. New container with versioned name (e.g. `investment_briefs_v2`)
2. Migration script in `/scripts` (not present in v2.1.0)
3. Dual-write window for safe rollback
