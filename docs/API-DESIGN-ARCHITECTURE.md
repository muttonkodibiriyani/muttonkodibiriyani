# AIC API Design Architecture

## 1) API Principles
- Resource-oriented REST surface
- Consistent JSON contracts
- Explicit status transitions for governance workflow
- Backward-compatible evolution strategy

## 2) Resource Groups
- Initiatives: create/read/update/list/soft-delete
- Users: CRUD + role assignment metadata
- Evaluations: gatekeeper/council submissions
- Stage Gates: progression approvals
- Audit: event ingest + query
- Portfolio: computed summary/snapshot endpoints

## 3) Contract Example

### POST `/initiatives`
Request:
```json
{
  "title": "AI Inventory Optimization",
  "domain": "Retail Supply Chain",
  "budgetRequested": 1250000,
  "submittedById": "usr-006"
}
```

Response:
```json
{
  "id": "INV-2026-0100",
  "status": "Submitted",
  "stage": "Gatekeeper Review",
  "createdAt": "2026-04-25T21:00:00Z"
}
```

## 4) Status Transition Rules (logical)
- Draft -> Submitted (submitter)
- Submitted -> Validated/Returned/Rejected (strategy reviewer)
- Validated -> Approved/Conditional/Rejected (committee/admin)
- Approved -> Stage gate progression by authorized role

## 5) Error Contract
Standardized error shape:
```json
{
  "code": "VALIDATION_ERROR",
  "message": "Payback exceeds threshold",
  "requestId": "req-...",
  "details": []
}
```

## 6) Reliability Pattern
- Retry on 429/5xx with exponential backoff
- Optional optimistic concurrency via ETag for updates
- Idempotent operations where possible

## 7) Security Contract
- `Authorization: Bearer <JWT>` required
- `X-Request-ID` for traceability
- `X-CSRF-Token` for mutation requests

## 8) Versioning Strategy
- Path versioning (`/aic/v1`)
- Additive field evolution for non-breaking changes
- Introduce `/v2` for breaking changes only
