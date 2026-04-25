# Deploy From Any Network (Public Share Link)

This guide publishes the AIC portal so CTO/CEO can access from any network.

## Option A (recommended): Azure Static Web Apps via GitHub Actions

### Prerequisites
- Azure subscription
- Microsoft Entra app registration
- GitHub repository secrets configured (see AZURE-DEPLOY.md)

### Steps
1. Push branch to GitHub (already done for this project).
2. Open GitHub Actions and run workflow: **AIC — Azure CI/CD**.
3. Deploy to staging first (`develop` branch) or production (`main` branch + approval gate).
4. After completion, copy the SWA URL from workflow output.
5. Share URL with leadership.

### Result
- Public HTTPS URL reachable from any network
- Role-based demo access ready at `/index.html`

## Option B: Temporary executive preview link
If Azure environments are not ready yet, deploy static build to a temporary provider (Netlify/Vercel) while keeping production data disabled and demo mode enabled.

## Network accessibility checklist
- [ ] Public DNS resolves
- [ ] HTTPS certificate valid
- [ ] CSP headers present
- [ ] Login page loads from non-corporate network
- [ ] No firewall blocks for CDN scripts

## Final leadership link format
`https://<public-hostname>/index.html`

Include with link:
- `docs/CTO-CEO-ACCESS-PACK.md`
- `docs/CTO-DEMO-FLOW.md`

