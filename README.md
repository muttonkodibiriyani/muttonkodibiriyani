# Alshaya Investment Council Portal

Static, demo-ready investment governance portal for Alshaya Group strategic technology investments.

```
Browser (HTML/CSS/JS) -> Azure Static Web Apps -> Azure API Management -> Cosmos DB
                                  |                  |-> Key Vault
                                  |-> AAD Auth        |-> App Insights / Log Analytics
```

## Pages and roles
- `index.html`: public login/demo selector
- `portal-router.html`: authenticated role router
- `initiator-dashboard.html`: Submitter+ reviewer/committee/admin
- `strategy-dashboard.html`: Strategy reviewer+ committee/admin
- `cxo-dashboard.html`: Investment committee, strategy, admin
- `submit-initiative.html`: Submitter+ reviewer/committee/admin
- `initiative-detail.html`: authenticated users
- `admin.html`: Platform_Admin only
- `ms-guide.html`: authenticated users
- `_test.html`: demo test runner

## Data model
Cosmos containers: `investment_briefs`, `council_evaluations`, `shark_verdicts`, `measurement_plans`, `stage_gates`, `benefits_actuals`, `portfolio_snapshots`, `market_intelligence`, `audit_log`, `portal_users`.

Initiatives include metadata, 5D gatekeeper dimensions, shark verdicts, financials, measurement plan, stage gates, benefits actuals, and audit references.

## JavaScript modules
- `config.js`: frozen config singleton
- `db.js`: localStorage demo DB with Cosmos delegation hooks
- `security.js`: sanitization, CSRF, session, RBAC, audit, rate limits
- `auth.js`: MSAL/AAD with demo fallback
- `azure-api.js`: APIM REST client with retry/backoff
- `app.js`: formatting, page bootstrap, UI helpers, charts

## Local quick start
```bash
npx serve . -p 3000
# open http://localhost:3000/index.html
```

Use the demo user selector to enter each role. Open `_test.html` for automated demo checks.

## Deployment
See [AZURE-DEPLOY.md](AZURE-DEPLOY.md).
