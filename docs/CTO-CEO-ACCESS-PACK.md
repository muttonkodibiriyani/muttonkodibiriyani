# CTO / CEO Access Pack — Production Demo

This pack gives leadership a direct way to validate the AIC portal from any network once hosted.

## 1) Shareable URL format
After deployment, share one of these:
- Staging: `https://<staging-app>.azurestaticapps.net`
- Production: `https://<prod-app>.azurestaticapps.net`
- Custom domain: `https://aic-portal.<company-domain>`

## 2) Leadership demo credentials (demo mode)
Use these preloaded users on `index.html` -> **Continue as Demo User**:

| Name | Email | Role | Landing page |
|---|---|---|---|
| Khalid Al-Mansouri | admin@alshaya.com | Platform_Admin | admin.html |
| Faisal Al-Tamimi | faisal.tamimi@alshaya.com | Investment_Committee | cxo-dashboard.html |
| Sarah Al-Rashidi | sarah.rashidi@alshaya.com | Strategy_Reviewer | strategy-dashboard.html |
| Dina Al-Saleh | dina.saleh@alshaya.com | Initiative_Submitter | initiator-dashboard.html |
| Omar Al-Hassan | omar.hassan@alshaya.com | Strategy_Reviewer | strategy-dashboard.html |

> Demo credentials are profile selections (no password) in demo mode. For production identity, use Microsoft Entra login.

## 3) CEO/CTO 10-minute validation script

1. Open shareable URL and login as **Dina**.
2. Create a new initiative in 8-step wizard and submit.
3. Logout/login as **Sarah** and submit gatekeeper score.
4. Logout/login as **Faisal** and submit council vote.
5. Open initiative detail and approve next stage gate.
6. Logout/login as **Khalid** and verify full audit trail and exports.

Expected outcomes:
- Lifecycle transitions visible end-to-end
- Audit events captured for submit/score/vote/approve
- Role boundaries enforced (viewer cannot access admin)

## 4) Evidence bundle for executive sign-off
Capture these screenshots:
- Login page
- Initiator dashboard with submitted initiative
- Strategy score panel and live score ring
- Council vote panel with approved status
- Stage gate approval confirmation
- Admin audit log with event lines

## 5) Security statement (executive summary)
- Frontend hosted on Azure Static Web Apps with secure headers
- API access gated through APIM with JWT + role validation + rate limiting
- Data in Cosmos DB with backup and geo-redundancy
- Secrets stored in Key Vault (no master key in browser)
- Full audit logging with retention controls

## 6) Go-live readiness checkpoints
- [ ] Azure environments deployed (staging + production)
- [ ] GitHub OIDC and protected environments configured
- [ ] DNS + TLS validated
- [ ] Smoke tests green
- [ ] UAT sign-off by Strategy + Committee + Admin representatives

