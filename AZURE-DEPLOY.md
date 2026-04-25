# Azure Deployment Guide

## 1. Architecture overview
Static Web Apps hosts the portal, AAD authenticates users, APIM validates JWTs and protects Cosmos DB, Key Vault stores secrets, and App Insights/Log Analytics centralize telemetry.

## 2. Prerequisites
Azure CLI, Bicep, GitHub repo admin access, Azure subscription owner/contributor, AAD app registration permissions.

## 3. Azure AD App Registration
```bash
az ad app create --display-name aic-portal
az ad app permission add --id <appId> --api 00000003-0000-0000-c000-000000000000 --api-permissions e1fe6dd8-ba31-4d61-89e7-88639da4683d=Scope
az ad app federated-credential create --id <appId> --parameters credential.json
```
Add app roles for `Platform_Admin`, `Investment_Committee`, `Strategy_Reviewer`, `Initiative_Submitter`, `Portfolio_Viewer`.

## 4. Infrastructure deployment
```bash
az deployment sub create --location uaenorth --template-file infra/main.bicep --parameters infra/parameters/staging.bicepparam
az deployment sub create --location uaenorth --template-file infra/main.bicep --parameters infra/parameters/production.bicepparam
```

## 5. GitHub repository setup
Enable Actions, environments, branch protection, CodeQL, and required reviewers for production.

## 6. GitHub Actions secrets
Use OIDC variables for subscription, tenant, and client ID. Store SWA deployment tokens as secrets. Rotate tokens every 90 days.

## 7. GitHub environments & branch protection
Create `staging` and `production`; require manual approval for production.

## 8. First deployment walkthrough
Deploy infrastructure, configure Static Web App app settings, push to `develop`, then promote to `main`.

## 9. Smoke tests & validation
Check `index.html`, role redirects, security headers, `_test.html`, and APIM `/health`.

## 10. Custom domain & TLS
Add custom domain in Static Web Apps and validate DNS CNAME/TXT records.

## 11. User & role management
Assign AAD app roles in Enterprise Applications. A new demo admin defaults to Platform_Admin in local mode.

## 12. Operational runbook
Use App Insights failures, APIM request logs, Cosmos request charge metrics, and Log Analytics queries.

## 13. Rollback procedure
Redeploy previous Static Web Apps artifact, restore prior Bicep parameters, and open a rollback incident issue.

## 14. Cost estimate
| Service | Driver | Estimate |
|---|---|---|
| Static Web Apps Standard | app hosting | low |
| APIM Developer/Standard | API gateway | medium |
| Cosmos DB | RU/s and storage | medium |
| App Insights/Log Analytics | ingestion | low-medium |
| Storage/Key Vault | storage/secrets | low |
