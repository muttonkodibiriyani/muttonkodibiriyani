# AIC Portal — Security

> Defence-in-depth, designed for INTERNAL-CONFIDENTIAL data with PII implications under Saudi PDPL and UAE DIFC.

## Contents

1. Defence-in-depth layers
2. Authentication & session
3. Role-based access control
4. API security
5. Client-side hardening
6. Security headers
7. CI/CD controls
8. Audit logging inventory
9. OWASP Top 10 coverage
10. Compliance — PDPL / DIFC
11. Incident reporting

---

## 1. Defence-in-depth layers

```
   ┌────────────────────────────────────────────────────┐
   │  Layer 1 — Identity (Microsoft Entra ID)           │
   │  • PKCE OAuth 2.0  • Conditional Access  • MFA     │
   └────────────────────────────────────────────────────┘
   ┌────────────────────────────────────────────────────┐
   │  Layer 2 — Edge (Azure App Service + WAF/CDN)      │
   │  • App Service auth or app-level auth integration  │
   │  • CSP / HSTS / Frame-Options / Permissions-Policy │
   └────────────────────────────────────────────────────┘
   ┌────────────────────────────────────────────────────┐
   │  Layer 3 — Browser runtime (AIC_SEC module)        │
   │  • DOMPurify XSS sanitization                      │
   │  • CSRF tokens, frame-busting                      │
   │  • Session limits (8h max, 30min idle)             │
   │  • Input validation & rate limiting                │
   └────────────────────────────────────────────────────┘
   ┌────────────────────────────────────────────────────┐
   │  Layer 4 — Gateway (Azure API Management)          │
   │  • JWT validation (audience + role claim)          │
   │  • 300 calls/60s per AAD subject                   │
   │  • Cosmos master-key injection from Key Vault      │
   │  • CORS allow-list only                            │
   └────────────────────────────────────────────────────┘
   ┌────────────────────────────────────────────────────┐
   │  Layer 5 — Data plane                              │
   │  • Cosmos DB private network ACL bypass            │
   │  • TLS 1.2+ only • Continuous backup (30d)         │
   │  • Audit log container with 90-day TTL             │
   └────────────────────────────────────────────────────┘
   ┌────────────────────────────────────────────────────┐
   │  Layer 6 — Secrets (Azure Key Vault — Premium)     │
   │  • RBAC, purge protection, soft delete             │
   │  • Cosmos key never leaves Azure                   │
   └────────────────────────────────────────────────────┘
```

## 2. Authentication & session

| Control | Setting |
|---------|--------|
| Identity provider | Microsoft Entra ID (Azure AD) |
| OAuth flow | Authorisation Code + PKCE (no implicit grant) |
| Token storage | `sessionStorage` only |
| Absolute session | 8 hours |
| Idle timeout | 30 minutes |
| Frame busting | `top !== self` → break-out |
| MFA | Enforced via Conditional Access policy |
| Domain hint | `alshaya.com` — prevents external accounts |

## 3. Role-based access control

| Role | Hierarchy | Submit | Score | Vote | Approve gate | Admin |
|------|----------|--------|-------|------|--------------|-------|
| Platform_Admin | 100 | ✓ | ✓ | ✓ | ✓ | ✓ |
| Investment_Committee | 80 | ✓ | ✓ | ✓ | ✓ | — |
| Strategy_Reviewer | 60 | ✓ | ✓ | — | — | — |
| Initiative_Submitter | 40 | ✓ | — | — | — | — |

Enforcement points:
1. App-level RBAC and route guards in protected pages
2. APIM JWT policy — API-level role claim check
3. `AIC_SEC.canAccess()` and `requireAccess()` — DOM-level for in-app gating
4. `data-min-role` attribute hides UI elements client-side (defence-in-depth, not enforcement)

## 4. API security

All Cosmos calls go via APIM. The APIM inbound policy:

1. Validate JWT against AAD OpenID config — fail closed on invalid/expired
2. Require audience = `api://<CLIENT_ID>/AIC.ReadWrite`
3. Require at least one valid AIC role claim
4. Rate-limit 300 calls per 60s per AAD subject
5. Inject Cosmos `Authorization` header from Key Vault secret `cosmos-master-key`
6. Strip `x-ms-cosmos-keys` and `x-ms-cosmos-quorum` from response

The Cosmos master key value never appears in:
- Browser JS
- App Service app settings and deployment configuration
- APIM portal UI (it's a secret named-value with Key Vault back-end)
- Application logs (we strip auth headers from APIM telemetry sampling)

## 5. Client-side hardening

| Risk | Control |
|------|--------|
| XSS | All `innerHTML` writes go through `AIC_SEC.sanitize()` (DOMPurify) |
| Clickjacking | `X-Frame-Options: DENY` + JS frame-busting |
| Open redirect | `AIC_SEC.safeRedirect()` allow-list of known portal pages |
| CSRF | Per-session token in `sessionStorage`, sent as `X-CSRF-Token` |
| Brute force | `AIC_SEC.checkRateLimit()` on login (5/min), score (10/min), submit (3/min) |
| Token leak | Tokens in `sessionStorage` only — never `localStorage` |
| Stale data | `Cache-Control: no-store, no-cache, must-revalidate` |

## 6. Security headers

| Header | Value | Purpose |
|--------|-------|--------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Force HTTPS |
| `Content-Security-Policy` | locked allow-list (jsdelivr, alcdn, login.microsoftonline.com only) | XSS / data exfil |
| `X-Frame-Options` | `DENY` | Clickjacking |
| `X-Content-Type-Options` | `nosniff` | MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Referrer leak |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Hardware access |
| `Cache-Control` | `no-store, no-cache, must-revalidate` | Stale data |

## 7. CI/CD controls

- **OIDC federated identity** — no Azure secrets in GitHub
- **Gitleaks** secret scan on every PR
- **CodeQL** JavaScript security-extended queries
- **npm audit** (best effort)
- **Branch protection** — require code owner review on `js/security.js`, `js/auth.js`, infra
- **Production environment** requires manual approval

## 8. Audit logging inventory

The portal emits an audit event via `AIC_SEC.audit()` for:

| Event | Severity | Where logged |
|-------|----------|--------------|
| `LOGIN_INITIATED`, `LOGIN_SUCCESS`, `LOGIN_FAILED` | INFO/WARN/CRIT | audit_log container |
| `LOGOUT`, `SESSION_INVALIDATED` | INFO | audit_log |
| `INITIATIVE_CREATED/UPDATED/DELETED/SUBMITTED` | INFO | audit_log |
| `GATEKEEPER_SCORE_SUBMITTED` | INFO | audit_log |
| `COUNCIL_VOTE` | INFO | audit_log |
| `STAGE_GATE_APPROVED` | INFO | audit_log |
| `USER_CREATED/UPDATED/DELETED` | INFO/WARN | audit_log |
| `ACCESS_DENIED` | WARN | audit_log + App Insights |
| `RATE_LIMITED` | WARN | audit_log |
| `OPEN_REDIRECT_BLOCKED` | WARN | audit_log |
| `DATA_CLEAR_ALL` | CRITICAL | audit_log + alert |

Audit container has 90-day TTL (PDPL retention policy). For longer-term retention, the storage account `audit-exports` container holds CSV exports.

## 9. OWASP Top 10 coverage

| OWASP risk | Mitigation |
|-----------|-----------|
| A01 Broken Access Control | Multi-layer RBAC: page guards, APIM JWT, AIC_SEC.canAccess |
| A02 Cryptographic Failures | TLS 1.2+ everywhere, no client-side crypto, Key Vault for secrets |
| A03 Injection | Parameterised Cosmos queries via APIM, DOMPurify on all rendering |
| A04 Insecure Design | Defence-in-depth, threat-modelled |
| A05 Security Misconfiguration | Bicep IaC, no manual config, CSP locked down |
| A06 Vulnerable Components | npm audit + CodeQL + Dependabot (recommend enabling) |
| A07 Auth Failures | AAD + MFA + PKCE, session limits, rate limit on login |
| A08 Software & Data Integrity | OIDC for CI, signed Bicep deployments, code owner review |
| A09 Logging Failures | Audit log on all sensitive ops, App Insights, alerts |
| A10 SSRF | No server-side fetch — all proxying via APIM with allow-list |

## 10. Compliance — PDPL / DIFC

- **Data classification**: INTERNAL-CONFIDENTIAL. PII in `portal_users` (email, name, title only — no employee number, no payroll data).
- **PDPL — Saudi**: 90-day audit log TTL, EU-style data subject rights process supported via Admin → User Delete (anonymises submitted initiatives by replacing `submittedBy` with `[redacted]`).
- **DIFC — UAE**: Data residency in UAE North + UAE Central regions only. No cross-border transfer outside the UAE.
- **Encryption at rest**: AES-256 (Cosmos default), Storage GRS with Microsoft-managed keys.
- **Encryption in transit**: TLS 1.2+ enforced on every endpoint.
- **Right to erasure**: 90-day soft-delete window, then hard delete via admin operation.

## 11. Incident reporting

If you suspect a security incident:

1. **Immediate**: rotate Cosmos master key (`az cosmosdb keys regenerate`) and update the Key Vault secret. APIM picks up the new value automatically.
2. **Within 1 hour**: email `aic-security@alshaya.com` AND `ciso@alshaya.com` with:
   - Affected timeframe (UTC)
   - Suspected scope (which container, which users)
   - Audit log export from Admin Console
3. **Within 24 hours**: file an incident in the corporate IRP system with audit evidence attached.
4. **Within 72 hours** (PDPL/GDPR): notify Data Protection Officer if personal data was accessed.

Severity tiers:

| Sev | Definition | Response time |
|-----|-----------|---------------|
| 1 | Confirmed unauthorised data access | 15 min |
| 2 | Plausible compromise, scope unconfirmed | 1 hour |
| 3 | Anomalous activity, investigation needed | 4 hours |
| 4 | Routine alert, low risk | 1 business day |

---

For controls catalogue and threat model documents, contact `aic-security@alshaya.com`.
