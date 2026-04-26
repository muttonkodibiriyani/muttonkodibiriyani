# Role Model and Workflow (Enterprise)

## Final Role Model (4 roles)

1. **Initiative_Submitter (Initiator)**
   - Can create and submit initiatives
   - Can save/edit drafts before submission
   - Cannot council vote
   - Cannot admin actions

2. **Strategy_Reviewer (Gatekeeper)**
   - **This role is the Gatekeeper**
   - Reviews submitted initiatives
   - Adds validation score + feedback + conditions
   - Moves status to Validated / Awaiting Council (or returns/rejects)
   - Monitors progress of all initiatives

3. **Investment_Committee (CXO Council)**
   - Reviews only validated initiatives
   - Applies council score and investment recommendation
   - Can approve stage gates
   - Has **veto override power** to overturn approved/rejected outcome
   - Cannot create new initiatives

4. **Platform_Admin**
   - Full access across all modules
   - User/role create-edit-delete
   - Access controls and security oversight
   - Audit/analytics monitoring
   - Administrative reset/export and health checks

## Workflow

```text
Initiator submits
  -> Strategy Reviewer (Gatekeeper) validates and scores
    -> if validated, send to CXO Council
      -> CXO scores + decision
        -> stage-gate progression
          -> completion tracking

Gatekeeper = Strategy_Reviewer
Council Shark scoring starts ONLY after status = Validated/Awaiting Council
```

## Status progression

- Draft -> Submitted
- Submitted -> Gatekeeper Review
- Gatekeeper Review -> Validated (or Returned/Rejected)
- Validated -> Council Vote
- Council Vote -> Approved / Conditional / Rejected
- Approved -> Stage 0 -> Stage 1 -> Stage 2 -> Stage 3 -> Completed

