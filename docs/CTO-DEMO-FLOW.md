# CTO Demonstration Flow (Role-Based End-to-End)

Use this script to demo the platform in 15–20 minutes.

## Demo URL
- Local: `http://localhost:3000/index.html`
- Hosted (after deployment): `<your-static-web-app-url>`

## 1) Initiator Flow (Dina Al-Saleh)
1. Login as **Dina Al-Saleh (Initiative_Submitter)**
2. Open **New Initiative**
3. Fill all 8 steps in the wizard
4. Submit and confirm generated initiative ID
5. Show initiative appears in dashboard as **Submitted**

## 2) Strategy Review Flow (Sarah Al-Rashidi)
1. Logout and login as **Sarah Al-Rashidi (Strategy_Reviewer)**
2. Open **Pending Review**
3. Select the submitted initiative
4. Score all 5 dimensions using sliders
5. Add justification + recommendation (PASS/CONDITIONAL)
6. Submit score -> initiative becomes **Validated / Awaiting Council**

## 3) Council Flow (Faisal Al-Tamimi)
1. Logout and login as **Faisal Al-Tamimi (Investment_Committee)**
2. Open **Council View**
3. Enter council score + recommendation (INVEST)
4. Submit verdict -> status moves to **Approved**
5. Verify Stage 0 release is reflected

## 4) Stage Gate Flow (Committee/Admin)
1. Open initiative detail -> **Stage Gates** tab
2. Approve next stage gate via confirmation modal
3. Verify stage status updates and audit event appears

## 5) Admin & Audit Flow (Khalid Al-Mansouri)
1. Login as **Khalid Al-Mansouri (Platform_Admin)**
2. Open **User Management** and create a new admin user
3. Open **Audit Log** and filter events for actions above
4. Export audit CSV and initiatives CSV

## 6) Additional Strategy Monitoring (Omar Al-Hassan)
1. Login as **Omar Al-Hassan (Strategy_Reviewer)**
2. Confirm strategy can monitor all initiative progress
3. Confirm no admin access (403 on `admin.html`)

## Evidence to capture for CTO sign-off
- Screenshots of each role landing page
- Initiative lifecycle status transitions
- Audit log entries for create/score/vote/approve
- `_test.html` result: all checks passing
