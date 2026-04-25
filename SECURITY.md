# Security

## Defence in depth
AAD authentication -> Static Web Apps route authorization -> APIM JWT validation and rate limits -> Cosmos DB private backend -> audit logging.

## Authentication and session security
| Control | Implementation |
|---|---|
| OAuth | MSAL v3 PKCE redirect flow |
| Tokens | sessionStorage/MSAL cache only |
| Session | 8h absolute, 30m inactivity |
| Logout | cache/session invalidation |

## RBAC matrix
| Role | Submit | Review | Approve | Admin | View |
|---|---:|---:|---:|---:|---:|
| Platform_Admin | yes | yes | yes | yes | yes |
| Investment_Committee | yes | yes | yes | no | yes |
| Strategy_Reviewer | yes | yes | no | no | yes |
| Initiative_Submitter | yes | no | no | no | own |
| Portfolio_Viewer | no | no | no | no | yes |

## API security
APIM validates issuer/audience/roles, limits calls per AAD subject, injects Cosmos credentials from Key Vault, strips sensitive headers, and logs requests.

## Client-side security
DOMPurify sanitizes HTML, attribute encoding is centralized, CSRF tokens are generated per session, frame busting and security headers prevent clickjacking, and open redirects are blocked.

## Security headers
CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, and no-store cache headers are configured.

## CI/CD controls
Gitleaks, CodeQL security-extended, dependency audit, Bicep validation, OIDC Azure login, protected production environment.

## Audit logging inventory
Login, logout, access denied, initiative create/update, score submit, stage gate approval, user create/update/delete, session invalidation.

## OWASP Top 10 coverage
Covers broken access control, cryptographic failures, injection, insecure design, security misconfiguration, vulnerable components, auth failures, integrity failures, logging gaps, and SSRF exposure reduction.

## PDPL and DIFC notes
Audit TTL is 90 days, data is classified INTERNAL-CONFIDENTIAL, and personal data is limited to business identity attributes.

## Incident reporting
Report suspected incidents to `aic-support@alshaya.com`; preserve audit exports and App Insights operation IDs.
