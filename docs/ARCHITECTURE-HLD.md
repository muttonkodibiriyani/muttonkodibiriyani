# AIC Enterprise Architecture — High-Level Design (HLD)

## 1) Business Context

The Alshaya Investment Council (AIC) Portal is an internal governance platform used to submit, review, score, approve, and track strategic technology investments across 70+ brands.

## 2) Core Capabilities

- Role-based investment lifecycle orchestration (5 enterprise roles)
- Gatekeeper scoring (5-dimensional weighted model)
- Investment committee voting (council verdict flow)
- Stage-gated capital release controls (Stage 0..3)
- Measurement plan and benefits actual tracking
- Full audit trail for material actions

## 3) Architecture Overview

```text
User Browser
  -> Azure Static Web Apps (Frontend, Auth Gateway)
    -> Azure API Management (Policy, JWT validation, rate limiting)
      -> Azure Cosmos DB (Operational data)
      -> Azure Storage (audit exports)
      -> Application Insights / Log Analytics (telemetry)

Supporting Services:
  - Microsoft Entra ID (identity and role claims)
  - Azure Key Vault (secrets, Cosmos master key)
  - Azure Monitor (alerting)
```

## 4) Domain Layers

- Presentation layer: Pure static web app (HTML/CSS/JS)
- Application layer: Client-side modules (auth, security, API abstraction, DB fallback)
- Integration layer: APIM-managed REST API facade
- Data layer: Cosmos SQL containers aligned to business domains
- Governance layer: audit, monitoring, policy, compliance controls

## 5) NFR Targets (Production)

- Availability: 99.9% SLA target (SWA/APIM/Cosmos managed tiers)
- Security: OWASP-aligned controls, role-based access, strict headers, PKCE
- Performance: < 2.5s first usable paint on GCC corporate networks
- Scalability: APIM + Cosmos autoscale; static frontend global edge delivery
- Auditability: full event tracking of privileged and transactional actions

## 6) Environments

- Staging: pre-production validation and UAT
- Production: controlled release with manual approval gate in GitHub environment protection

## 7) Deployment Model

- Infrastructure as Code: Bicep (subscription scope)
- CI/CD: GitHub Actions with OIDC federation (no long-lived cloud secrets)
- Release controls: mandatory scans, validation, and protected production deployment

## 8) Security Posture

- Zero-trust oriented access through identity + API policy enforcement
- Secret isolation in Key Vault
- Browser hardened with CSP, HSTS, frame denial
- Rate limit and abuse controls at API gateway

## 9) Operational Model

- Runbook-driven operations (health, incident handling, rollback)
- Monitor + alerts for exceptions, throttling, and gateway failures
- Structured logs to central analytics workspace

## 10) CTO Review Scope

The deployed solution demonstrates full role flow and lifecycle progression in demo mode immediately, and production integration path via Azure resources once environment secrets are configured.