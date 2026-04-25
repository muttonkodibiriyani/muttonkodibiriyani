# AIC Enterprise Architecture — Low-Level Design (LLD)

## 1) Frontend Module Design

### Module: `js/config.js`
- Source of truth for features, role constants, thresholds, container names.
- Immutable configuration (`Object.freeze`) to prevent runtime tampering.

### Module: `js/security.js`
- `sanitize()` wrapping DOMPurify for all HTML insertion points.
- CSRF token generation and validation in session storage.
- Session lifecycle controls: 8h absolute, 30m inactivity.
- RBAC hierarchy + route/page-level access helper functions.
- Client-side audit event batching and flush.
- Sliding-window rate limit utility.

### Module: `js/auth.js`
- MSAL v3 integration (PKCE flow) when Azure AD enabled.
- Demo fallback profile model when Azure AD disabled.
- Profile normalization into role capabilities (`canSubmit`, `canReview`, etc.).

### Module: `js/azure-api.js`
- Centralized API calls via APIM endpoint.
- Request ID headers and retry/backoff for transient failures.
- Operation wrappers for initiatives, users, evaluations, stage gates, audit.

### Module: `js/db.js`
- Demo datastore abstraction on `localStorage`.
- Seed management by DB version (`2.1.0`).
- CRUD + summary + scoring utility functions.

### Module: `js/app.js`
- Shared formatting, status mapping, UX utilities, chart wrappers.
- Page bootstrap (`initPage`) for role checks + sidebar composition.

## 2) Page Design Pattern
All protected pages follow a standard layout:
- Fixed left navigation (role-aware)
- Top action bar
- Main panel with cards/tables/tabs/charts

Common behavior:
- Authentication check on load
- Role visibility enforcement (`data-min-role`)
- Safe sign-out flow + audit record

## 3) API Contract Pattern (via APIM)
- Resource style endpoints (`/initiatives`, `/users`, `/audit`, etc.)
- JSON payloads only
- Auth: Bearer token with valid role claims
- Idempotent update support with ETag/If-Match pattern where applicable

## 4) Data Model Detail
Primary object: Initiative
- Identity: `id`, title/domain metadata
- Governance: status/stage/decision/scores
- Financials: requested/approved/spent/released
- Scoring: weighted dimensions and shark verdicts
- Delivery controls: stage gates and criteria
- Value realization: measurement and benefits actuals

## 5) Error Handling Strategy
- Async operations are wrapped in try/catch
- User-facing feedback with typed toasts (`info/success/warning/error`)
- Audit events for denied access and critical operations
- API retries for 429 and 5xx classes with exponential backoff

## 6) Security-by-Construction Rules
- No direct unsanitized `innerHTML` writes
- No secret material in frontend files
- Token persistence restricted to session storage
- Access denied redirect centralized to `403.html`

## 7) Extensibility Plan
- Replace demo DB with APIM-backed live data by flipping feature flags
- Add server-side API versioning under `/aic/v2` when contracts evolve
- Introduce formal schema validation for payloads if backend service layer is added
