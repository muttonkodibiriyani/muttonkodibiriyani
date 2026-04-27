# AIC Portal — Azure Deployment Guide

End-to-end runbook to deploy the Alshaya Investment Council portal to Azure. Assumes you are deploying to a fresh subscription. Estimated total deployment time once secrets are configured: ~25 minutes.

---

## Table of contents

1. [Architecture overview](#1-architecture-overview)
2. [Prerequisites](#2-prerequisites)
3. [Azure AD App Registration](#3-azure-ad-app-registration)
4. [Infrastructure deployment](#4-infrastructure-deployment)
5. [GitHub repository setup](#5-github-repository-setup)
6. [GitHub Actions secrets](#6-github-actions-secrets)
7. [GitHub environments & branch protection](#7-github-environments--branch-protection)
8. [First deployment walkthrough](#8-first-deployment-walkthrough)
9. [Smoke tests & validation](#9-smoke-tests--validation)
10. [Custom domain & TLS](#10-custom-domain--tls)
11. [User & role management](#11-user--role-management)
12. [Operational runbook](#12-operational-runbook)
13. [Rollback procedure](#13-rollback-procedure)
14. [Cost estimate](#14-cost-estimate)

---

## 1. Architecture overview

Browser ⇄ Azure App Service (Linux, Node 20) ⇄ Azure API Management ⇄ Azure Cosmos DB (SQL API). All secrets live in Azure Key Vault. Telemetry funnels into Application Insights and Log Analytics.

The Cosmos master key never leaves the Azure boundary — APIM reads it from Key Vault at request time and adds it to outbound calls. Browsers only ever hold a short-lived AAD bearer token.

---

## 2. Prerequisites

### Tools

- Azure CLI 2.60+
- Bicep CLI 0.30+ (installed via `az bicep install`)
- GitHub CLI 2.40+ (optional, for repo scripting)
- Node 20+ (only for local linting)

### Azure permissions

You need:

- **Subscription Owner** OR (Contributor + User Access Administrator) on the target subscription
- **Cloud Application Administrator** in Microsoft Entra ID to create the App Registration
- Ability to consent to enterprise-app permissions for the AAD app

### Cost

Roughly **$220–340/month** for production (see §14).

---

## 3. Azure AD App Registration

```bash
# Sign in
az login --tenant alshaya.onmicrosoft.com

# Create app registration
APP_ID=$(az ad app create \
  --display-name "AIC Investment Council Portal" \
  --sign-in-audience AzureADMyOrg \
  --web-redirect-uris "https://aic-portal.alshaya.com/portal-router.html" \
  --query appId -o tsv)
echo "Client ID: $APP_ID"

# Add SPA reply URLs (PKCE)
az ad app update --id $APP_ID --set spa.redirectUris='["https://aic-portal.alshaya.com/portal-router.html"]'

# Create custom API scope (AIC.ReadWrite)
az ad app update --id $APP_ID --identifier-uris "api://$APP_ID"
# Then in Azure Portal → App Registration → Expose an API → Add scope "AIC.ReadWrite"

# Define app roles (5 roles)
cat > app-roles.json <<EOF
[
  {"allowedMemberTypes":["User"],"description":"Full system control","displayName":"Platform Admin","id":"$(uuidgen)","isEnabled":true,"value":"Platform_Admin"},
  {"allowedMemberTypes":["User"],"description":"Vote on investments","displayName":"Investment Committee","id":"$(uuidgen)","isEnabled":true,"value":"Investment_Committee"},
  {"allowedMemberTypes":["User"],"description":"Gatekeeper scoring","displayName":"Strategy Reviewer","id":"$(uuidgen)","isEnabled":true,"value":"Strategy_Reviewer"},
  {"allowedMemberTypes":["User"],"description":"Submit and track","displayName":"Initiative Submitter","id":"$(uuidgen)","isEnabled":true,"value":"Initiative_Submitter"},
]
EOF
az ad app update --id $APP_ID --app-roles @app-roles.json

# Create federated credential for GitHub Actions OIDC
az ad app federated-credential create --id $APP_ID --parameters '{
  "name":"github-actions-main",
  "issuer":"https://token.actions.githubusercontent.com",
  "subject":"repo:alshaya/aic-portal:ref:refs/heads/main",
  "audiences":["api://AzureADTokenExchange"]
}'
az ad app federated-credential create --id $APP_ID --parameters '{
  "name":"github-actions-environments-prod",
  "issuer":"https://token.actions.githubusercontent.com",
  "subject":"repo:alshaya/aic-portal:environment:production",
  "audiences":["api://AzureADTokenExchange"]
}'
```

Then in the Azure Portal: assign the AAD app a service principal (`az ad sp create --id $APP_ID`) and grant it the **Contributor** role on the target subscription.

---

## 4. Infrastructure deployment

Run from the repo root:

```bash
export AZURE_TENANT_ID=$(az account show --query tenantId -o tsv)
export AZURE_CLIENT_ID=$APP_ID
export AZURE_SUBSCRIPTION_ID=$(az account show --query id -o tsv)

# Production deployment (subscription scope)
az deployment sub create \
  --location uaenorth \
  --template-file infra/main.bicep \
  --parameters infra/parameters/production.bicepparam \
  --name aic-bootstrap-$(date +%s)
```

What gets deployed:

- 1 Resource Group: `rg-aic-production`
- 1 Log Analytics workspace (90-day retention)
- 1 App Insights (workspace-based)
- 1 Key Vault (Premium, RBAC, purge protection ON)
- 1 Storage account (GRS, audit-exports container)
- 1 Cosmos DB account (SQL API, geo-redundant UAE North + Central)
- 1 APIM service (Standard tier in prod, Developer in staging)
- 1 App Service Plan (Linux, P1v3 or equivalent)
- 1 App Service Web App (Node 20)
- 3 metric alerts (APIM 5xx, Cosmos throttling, exception count)

---

## 5. GitHub repository setup

```bash
# Create the repo (or use an existing one)
gh repo create alshaya/aic-portal --private --source=. --push

# Push code
git add .
git commit -m "Initial AIC portal"
git push -u origin main
```

---

## 5.1 Azure App Service configuration (required once)

In the Azure Portal, open your staging and production web apps and set:

- **Runtime stack**: Node 20 LTS (Linux)
- **Startup command**: `node server.js`
- **Always On**: Enabled
- **HTTPS only**: Enabled
- **Minimum TLS version**: 1.2

For Deployment Center:

1. Go to **Deployment Center** on the Web App.
2. Select **Source: GitHub** and authorize repository access.
3. Choose the branch (`develop` for staging, `main` for production).
4. Keep GitHub Actions enabled (this repo workflow file is already configured).

Runtime environment is also enforced by CI/CD on each deployment (`azure/appservice-settings`):

- `linuxFxVersion`: `NODE|20-lts`
- `appCommandLine`: `node server.js`
- `minTlsVersion`: `1.2`
- `http20Enabled`: `true`
- `alwaysOn`: `true`
- app settings: `WEBSITE_NODE_DEFAULT_VERSION=~20`, `WEBSITES_PORT=8080`, `NODE_ENV=production`

To use publish-profile deployment from GitHub Actions:

1. Open **Get publish profile** on each web app.
2. Save each profile as GitHub secrets:
   - `AZURE_WEBAPP_PUBLISH_PROFILE_STAGING`
   - `AZURE_WEBAPP_PUBLISH_PROFILE_PROD`

---

## 6. GitHub Actions secrets

Set these as **repository secrets** (Settings → Secrets and variables → Actions). All secrets should be rotated on a defined schedule.


| Secret name                   | Source                        | Rotation  |
| ----------------------------- | ----------------------------- | --------- |
| `AZURE_SUBSCRIPTION_ID`       | Azure subscription ID         | On change |
| `AZURE_WEBAPP_PUBLISH_PROFILE_STAGING` | App Service (staging) publish profile | 90 days |
| `AZURE_WEBAPP_PUBLISH_PROFILE_PROD`    | App Service (prod) publish profile    | 90 days |
| `APIM_BASE_URL_STAGING`       | Output from staging deploy    | On change |
| `APIM_BASE_URL_PROD`          | Output from prod deploy       | On change |
| `APPINSIGHTS_CONNSTR_STAGING` | App Insights → Properties     | 90 days   |
| `APPINSIGHTS_CONNSTR_PROD`    | App Insights → Properties     | 90 days   |


Also configure these GitHub repository **variables**:

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_WEBAPP_NAME_STAGING`
- `AZURE_WEBAPP_NAME_PROD`
- `APP_BASE_URL_STAGING`
- `APP_BASE_URL_PROD`

---

## 7. GitHub environments & branch protection

Create two environments under Settings → Environments:

- **staging** — auto-deploy from `develop` branch
- **production** — auto-deploy from `main`, requires manual approval from at least 1 reviewer in the AIC Platform team

Branch protection on `main`:

- Require pull request reviews (1 approver minimum)
- Require status checks: `secret-scan`, `codeql-scan`, `validate`, `dependency-audit`
- Require linear history
- Require code owner review (CODEOWNERS file enforces this)
- Restrict who can push to main: `aic-platform` team

---

## 8. First deployment walkthrough

```bash
# 1. Configure secrets (via gh CLI or web UI)
gh variable set AZURE_CLIENT_ID --body "$APP_ID"
gh variable set AZURE_TENANT_ID --body "$AZURE_TENANT_ID"
# … etc

# 2. Push to develop → triggers staging deploy
git checkout -b develop
git push -u origin develop
# Watch Actions tab → "Deploy → staging" job

# 3. Validate staging:
#    Open your staging app URL (for example: https://aic-portal-staging.azurewebsites.net)
#    Sign in with a test AAD user assigned the Initiative_Submitter role

# 4. Promote to production
gh pr create --base main --head develop --title "Initial production release"
# Get PR review → merge → "Deploy → production" runs (manual approval gate)
```

### Controlled promotion workflow (staging -> production)

Use `.github/workflows/azure-release-promote.yml` for explicit promotion in one workflow run:

```bash
# Staging-only app release (no infra)
gh workflow run azure-release-promote.yml -f release_mode=staging-only -f deploy_infrastructure=false

# Full promotion: staging deploy + production deploy (production approval still applies)
gh workflow run azure-release-promote.yml -f release_mode=promote-to-production -f deploy_infrastructure=false

# Full promotion including infrastructure deploy (Bicep) in both stages
gh workflow run azure-release-promote.yml -f release_mode=promote-to-production -f deploy_infrastructure=true
```

---

## 9. Smoke tests & validation

After each deploy, the workflow runs:

- HTTP 200 check on the App Service root
- Validates `Strict-Transport-Security`, `Content-Security-Policy`, `X-Frame-Options` headers
- Confirms portal pages load with expected RBAC behavior after sign-in

Manual checks for the production cutover:

```bash
URL=https://aic-portal.alshaya.com

# Login flow works
curl -sI $URL/portal-router.html | grep -i "200\|302"

# Health endpoint via APIM
curl -sI $URL/api/health -H "Authorization: Bearer $TOKEN"

# CSP intact
curl -sI $URL | grep -i "content-security-policy"
```

In the portal: **Admin → System Health → Run Health Check** must return 4 green statuses.

---

## 10. Custom domain & TLS

```bash
# Add custom hostname to App Service
az webapp config hostname add \
  --webapp-name <app-service-name> \
  --resource-group rg-aic-production \
  --hostname aic-portal.alshaya.com

# DNS records to configure (apex/CNAME)
# CNAME aic-portal → <app-service-name>.azurewebsites.net
# OR ALIAS / ANAME if using apex
```

Bind a managed certificate in App Service once DNS ownership is verified.

---

## 11. User & role management

To grant a new user access:

1. **Azure Portal → Entra ID → Enterprise Apps → AIC Investment Council Portal → Users and groups**
2. Click **Add user/group**, choose the AAD user, assign the appropriate role (`Platform_Admin`, `Investment_Committee`, `Strategy_Reviewer`, `Initiative_Submitter`)
3. User can sign in immediately — no portal-side setup needed

To add a Platform Admin from inside the portal (after first admin is set up):

1. Sign in as `Platform_Admin`
2. **Admin → User Management → Add User**
3. Select role **Platform Admin** (default)

The portal stores user metadata locally; the actual role enforcement is done by Azure AD claims and APIM JWT validation.

---

## 12. Operational runbook

### Daily checks

- Admin Console → Audit Log: scan for any `CRITICAL` events
- Admin Console → System Health: ensure all 4 cards green

### KQL queries (Log Analytics → Logs)

```kql
// Failed logins in last 24h
AppEvents
| where Name == "LOGIN_FAILED"
| where TimeGenerated > ago(24h)
| summarize count() by tostring(Properties.error)

// APIM 5xx error rate
ApiManagementGatewayLogs
| where TimeGenerated > ago(1h)
| where ResponseCode >= 500
| summarize errors=count() by bin(TimeGenerated, 5m), ApiId

// Slow Cosmos requests (>1s)
AzureDiagnostics
| where ResourceProvider == "MICROSOFT.DOCUMENTDB"
| where duration_s > 1
| project TimeGenerated, OperationName, statusCode_s, duration_s
```

### Common ops tasks


| Task                       | Command / Path                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------ |
| Rotate Cosmos master key   | `az cosmosdb keys regenerate -n <acct> -g <rg> --key-kind primary`, then update Key Vault secret |
| Restart APIM (no downtime) | `az apim update -n <name> -g <rg> --set sku.name=Standard`                                       |
| Export audit logs          | Admin Console → Audit Log → Export CSV                                                           |
| Scale up App Service       | `az appservice plan update -g <rg> -n <plan> --sku P2v3`                                        |


---

## 13. Rollback procedure

If a production deploy fails or breaks the portal:

```bash
# 1. Find the previous successful deployment
az deployment sub list --query "[?contains(name, 'aic-prod')].{name:name, state:properties.provisioningState, time:properties.timestamp}" -o table

# 2. Re-run that deployment with the same parameters
az deployment sub create \
  --location uaenorth \
  --template-file infra/main.bicep \
  --parameters infra/parameters/production.bicepparam \
  --name aic-rollback-$(date +%s)

# 3. Re-run deployment workflow from previous known-good commit:
gh workflow run azure-deploy.yml -r <previous-good-sha>
```

The CI workflow auto-creates a `sev-1` rollback issue on production failures.

For Cosmos data corruption: use **Continuous Backup** (Cosmos → Point-in-Time Restore) — RPO is < 30 days.

---

## 14. Cost estimate


| Resource       | Tier                               | Approx monthly cost (USD) |
| -------------- | ---------------------------------- | ------------------------- |
| App Service Plan | P1v3 (Linux)                     | $70-100                   |
| API Management | Standard (1 unit)                  | $145                      |
| Cosmos DB      | 4000 RU/s autoscale, geo-redundant | $80–120                   |
| Key Vault      | Premium                            | $5                        |
| Log Analytics  | 5 GB ingestion cap                 | $12                       |
| App Insights   | Workspace-based                    | included in LA            |
| Storage        | GRS, < 50 GB                       | $5                        |
| Monitor alerts | 3 metric rules                     | $3                        |
| **Total**      |                                    | **~$320–390/month**       |


For staging (B1 App Service + Developer APIM + single-region Cosmos): ~$90-130/month.

---

## Appendix — env-config.js shape

This file is generated by CI at deploy time from secrets. **Never commit it.** It is `.gitignore`d.

```js
window.__AIC_ENV = {
  AZURE_CLIENT_ID:                       '<app-id>',
  AZURE_TENANT_ID:                       '<tenant-id>',
  APIM_BASE_URL:                         'https://apim-aic-production.azure-api.net/aic/v1',
  APPLICATIONINSIGHTS_CONNECTION_STRING: 'InstrumentationKey=…'
};
```

