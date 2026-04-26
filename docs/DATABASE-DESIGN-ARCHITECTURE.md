# AIC Database Design Architecture (Cosmos SQL API)

## 1) Design Goals

- Governance workflow integrity
- Query efficiency by role dashboards
- Auditability and retention control
- Horizontal scalability with partition-aligned access patterns

## 2) Container Design


| Container           | Partition Key | Purpose                             |
| ------------------- | ------------- | ----------------------------------- |
| investment_briefs   | /domain       | Core initiative records             |
| council_evaluations | /initiativeId | Council scoring/verdicts            |
| shark_verdicts      | /initiativeId | Shark panel assessments             |
| measurement_plans   | /initiativeId | KPI plans and ownership             |
| stage_gates         | /initiativeId | Stage criteria and approvals        |
| benefits_actuals    | /initiativeId | Realized performance metrics        |
| portfolio_snapshots | /snapshotDate | Aggregated snapshots (TTL 90d)      |
| market_intelligence | /domain       | External/internal benchmark context |
| audit_log           | /sessionId    | Security/business events (TTL 90d)  |
| portal_users        | /role         | User metadata (unique email)        |


## 3) Entity Patterns

- Initiative document: rich aggregate for dashboard speed in demo mode
- Production separation supports write isolation and independent retention policies

## 4) Consistency and Durability

- Session consistency (default)
- Continuous backup (30-day) in production
- Multi-region failover (uaenorth + uaecentral)

## 5) Query Patterns

- By submitter: initiator dashboard
- By status/domain: strategy/council pipeline views
- By initiativeId: detail tabs, stage progression, evaluations
- Time-windowed audit query: admin compliance operations

## 6) Data Lifecycle

- Soft-delete strategy for initiatives
- TTL-enforced cleanup for snapshot and audit containers
- Export pipeline to blob storage for audit archives

## 7) Data Security

- Access via APIM only (no direct browser credentials)
- Master key in Key Vault reference
- Least privilege with role-claim based API control