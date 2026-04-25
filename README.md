# Alshaya Investment Council (AIC) Portal

[![Version](https://img.shields.io/badge/version-2.1.0-6366f1)]()
[![Deploy](https://img.shields.io/badge/azure-static%20web%20app-0078d4)]()
[![Status](https://img.shields.io/badge/status-production--ready-10b981)]()

> Enterprise investment governance portal for Alshaya Group's 70+ retail brands across the GCC. Where business units pitch technology investments, Strategy Reviewers gate-keep with a 5-dimension scorecard, and the Investment Committee votes through a 6-shark panel before capital is released stage-by-stage.

---

## Architecture

```
                        ┌──────────────────────────┐
                        │   Microsoft Entra ID     │
                        │  (Azure AD — RBAC roles) │
                        └────────────┬─────────────┘
                                     │  OIDC / PKCE
 ┌─────────────────┐    HTTPS        ▼
 │     Browser     │ ───────► Azure Static Web App
 │   (HTML/CSS/JS) │          (CDN + auth + routes)
 └─────────────────┘                  │
          │                           │  Bearer token
          │                           ▼
          │             Azure API Management (APIM)
          │             ┌─────────────────────────────┐
          │             │ • JWT validation             │
          │             │ • Rate limit (300/60s)       │
          │             │ • Role claim check           │
          │             │ • Inject Cosmos master key   │
          │             │ • CORS / CSP                 │
          │             └─────────────────────────────┘
          │                           │
          │                           ▼
          │              ┌──────────────────────┐
          │              │  Azure Cosmos DB     │  ← key from Key Vault
          │              │  (10 containers)     │
          │              └──────────────────────┘
          │                           │
          │                           ▼
          ▼              ┌──────────────────────┐
   App Insights ◄─────── │  Log Analytics       │
   (telemetry)           │  (90-day retention)  │
                         └──────────────────────┘
```

### Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla JS ES2022, HTML5, CSS3 — no build step |
| Charts | Chart.js 4.4 |
| Sanitization | DOMPurify 3.0 |
| Auth | MSAL.js 3.10 (PKCE) |
| Hosting | Azure Static Web Apps (Standard) |
| API gateway | Azure API Management |
| Data store | Azure Cosmos DB (SQL API) |
| Secrets | Azure Key Vault (Premium) |
| Telemetry | App Insights → Log Analytics |
| IaC | Azure Bicep (subscription scope) |
| CI/CD | GitHub Actions + OIDC federated identity |

---

## Pages and roles

| Page | Roles allowed |
|------|---------------|
| `index.html` | anonymous + authenticated |
| `portal-router.html` | authenticated |
| `403.html` | anonymous + authenticated |
| `initiator-dashboard.html` | Initiative_Submitter, Strategy_Reviewer, Investment_Committee, Platform_Admin |
| `strategy-dashboard.html` | Strategy_Reviewer, Investment_Committee, Platform_Admin |
| `cxo-dashboard.html` | Investment_Committee, Strategy_Reviewer, Portfolio_Viewer, Platform_Admin |
| `submit-initiative.html` | Initiative_Submitter, Strategy_Reviewer, Investment_Committee, Platform_Admin |
| `initiative-detail.html` | all authenticated |
| `admin.html` | Platform_Admin only |
| `ms-guide.html` | all authenticated |
| `_test.html` | local testing only |

---

## Data model — Cosmos DB containers

| Container | Partition Key | TTL | Notes |
|-----------|--------------|-----|-------|
| `investment_briefs` | `/domain` | none | Primary initiative records |
| `council_evaluations` | `/initiativeId` | none | Council vote records |
| `shark_verdicts` | `/initiativeId` | none | 6-shark + Red Team verdicts |
| `measurement_plans` | `/initiativeId` | none | KPI definitions |
| `stage_gates` | `/initiativeId` | none | Stage gate budgets and exit criteria |
| `benefits_actuals` | `/initiativeId` | none | Realised benefits |
| `portfolio_snapshots` | `/snapshotDate` | 90d | Aggregated daily snapshots |
| `market_intelligence` | `/domain` | none | Comparable deployments |
| `audit_log` | `/sessionId` | 90d (PDPL) | All security/audit events |
| `portal_users` | `/role` | none | unique key on `/email` |

### Initiative object shape

See `js/db.js` `getSampleInitiatives()` for the canonical schema. Key fields:
`id`, `title`, `domain`, `status`, `stage`, `gatekeeperScore`, `councilScore`,
`dimensions {d1..d5}`, `sharkVerdicts[]`, `bearCase`, `measurementPlan`,
`stageGates[]`, `benefitsActuals[]`, `budgetRequested/Approved/Spent`.

---

## JavaScript modules

| Module | Responsibility |
|--------|----------------|
| `config.js` | `AIC_CONFIG` — frozen singleton (auth, cosmos, features, roles, thresholds) |
| `db.js` | `AIC_DB` — local data layer (demo) / production delegates to `AIC_API` |
| `security.js` | `AIC_SEC` — sanitize, validate, CSRF, session, RBAC, audit, rate limit |
| `auth.js` | `AIC_AUTH` — MSAL.js v3 + demo fallback |
| `azure-api.js` | `AIC_API` — APIM REST client with retry/backoff |
| `app.js` | Global utilities, page bootstrap, charts, toasts, modals |

Script load order is **mandatory** in every protected page:
```html
<script src="js/config.js"></script>
<script src="js/db.js"></script>
<script src="js/security.js"></script>
<script src="js/auth.js"></script>
<script src="js/azure-api.js"></script>
<script src="js/app.js"></script>
```

---

## Quick start (local demo)

The portal runs **100% in demo mode** out of the box — no Azure, no install, no credentials.

```bash
# Option 1 — npx (recommended)
npx serve . -p 3000
# then open http://localhost:3000

# Option 2 — Python
python3 -m http.server 3000
```

Sign in via the **Continue as Demo User** button on the login page. Pick any of the 7 sample users to explore each role's experience.

### Verify the build

Open `http://localhost:3000/_test.html` — automated assertions run on load and report passes/failures.

---

## Production deployment

See [`AZURE-DEPLOY.md`](AZURE-DEPLOY.md) for the full 14-section runbook covering:

1. App Registration setup
2. Bicep infrastructure deployment
3. GitHub OIDC + secrets configuration
4. Branch protection and environments
5. Smoke tests, custom domains, rollback procedure

---

## Security

See [`SECURITY.md`](SECURITY.md) for:

- Defence-in-depth controls
- OWASP Top 10 coverage
- PDPL / DIFC compliance notes
- Incident reporting process

The Cosmos DB master key is stored in Key Vault and **never** sent to the browser. APIM injects it at request time.

---

## Repository layout

```
.
├── index.html, *-dashboard.html, ...  # 10 protected pages
├── css/design-system.css              # All shared styles
├── js/                                # 6 JS modules (load order matters)
├── infra/                             # Bicep IaC (1 root + 8 modules)
├── .github/                           # CI/CD + ownership
├── staticwebapp.config.json           # SWA route protection + headers
├── README.md
├── AZURE-DEPLOY.md
├── SECURITY.md
└── REGENERATION-PROMPT.md
```

---

## Support

- Email: aic-support@alshaya.com
- Audit log: Admin Console → Audit Log tab
- Status: `/admin.html` → System Health tab → "Run Health Check"

---

© 2026 Alshaya Group · Internal Confidential
