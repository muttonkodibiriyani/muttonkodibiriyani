## Summary

<!-- One sentence describing what this PR does and why. -->

## Type of change

- [ ] Bug fix
- [ ] New feature
- [ ] Refactor / cleanup
- [ ] Security fix
- [ ] Infrastructure change
- [ ] Documentation only

## Pages or modules affected

<!-- e.g. js/security.js, admin.html, infra/modules/cosmos-db.bicep -->

## Security checklist

- [ ] No secrets committed (verify Gitleaks step passes)
- [ ] All `innerHTML` writes are wrapped in `AIC_SEC.sanitize()`
- [ ] Input validation via `AIC_SEC.validate.*`
- [ ] Audit log emitted for state-changing actions
- [ ] CSP / SWA route protection updated if new pages/routes added
- [ ] No Cosmos master key shipped to client

## Testing

- [ ] `_test.html` self-tests pass locally
- [ ] Manual smoke test of affected pages
- [ ] Tested all relevant role views (Submitter / Strategy / Committee / Viewer / Admin)

## Deployment notes

<!-- Any infra params, secrets, or runbook changes a reviewer must apply. -->
