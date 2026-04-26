# AIC Network & Security Architecture

## 1) Network Zones

- Public Edge: Azure Static Web App endpoint (HTTPS only)
- Controlled API ingress: Azure API Management
- Data services: Cosmos DB, Key Vault, Storage, Monitor

## 2) Trust Boundaries

1. Browser <-> SWA
2. SWA/Client Token <-> APIM
3. APIM <-> Cosmos/Key Vault
4. Telemetry pipeline <-> Analytics store

## 3) Identity and Access

- Identity provider: Microsoft Entra ID
- OAuth flow: Authorization Code + PKCE
- Role claims required for protected pages and API operations

## 4) APIM Policy Controls

- JWT validation (issuer, audience, claims)
- Role claim enforcement
- Per-subject rate limit (300 requests / 60s)
- CORS allow-list only
- Sensitive header stripping

## 5) Web Security Headers

- Strict-Transport-Security
- Content-Security-Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy
- Permissions-Policy
- Cache-Control: no-store

## 6) Key Management

- Secrets stored in Azure Key Vault with RBAC
- Cosmos master key retrieved by APIM using Key Vault reference
- No browser exposure of data-plane master secrets

## 7) Threat Mitigations

- XSS: DOMPurify + sanitization wrapper
- CSRF: per-session token validation
- Clickjacking: frame denial + frame busting
- Open redirect: safe redirect allow-list
- Brute force / abuse: rate limiting + monitored audit trail

## 8) Monitoring & Detection

- App + gateway telemetry in App Insights / Log Analytics
- Alerts on exception spikes, API failures, Cosmos pressure
- Audit log stream for user and privilege actions

## 9) Compliance Mapping (summary)

- OWASP Top 10: covered through layered controls
- PDPL/DIFC: data minimization + retention boundaries + auditable access
- Enterprise controls: policy as code, environment promotion gates, least privilege role model