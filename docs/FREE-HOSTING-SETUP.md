# Free Hosting Setup (No Azure, No Credit Card)

This guide gets your AIC portal live using free tiers.

## Best option right now: Vercel (fastest)

### What you need
- GitHub account
- Vercel account (free)

### Steps (non-technical)
1. Go to https://vercel.com and click **Sign up**.
2. Choose **Continue with GitHub**.
3. Click **Add New... -> Project**.
4. Select your repository: `muttonkodibiriyani/muttonkodibiriyani`.
5. In branch settings, choose: `cursor/build-aic-portal-7019`.
6. Framework preset: **Other** (or leave auto-detected).
7. Build command: leave empty.
8. Output directory: leave empty.
9. Click **Deploy**.
10. Wait 1-2 minutes; copy your URL:
   `https://<project-name>.vercel.app`

Your portal is now live from any network.

---

## Demo login credentials (for CTO/manager)
Open your live URL and choose **Continue as Demo User**.

- Khalid Al-Mansouri — Platform Admin
- Faisal Al-Tamimi — Investment Committee
- Sarah Al-Rashidi — Strategy Reviewer
- Dina Al-Saleh — Initiative Submitter
- Omar Al-Hassan — Portfolio Viewer

No password needed in demo mode.

---

## If Vercel asks for environment variables
Not required for demo mode. The app works without them.

(Production values are only needed for Azure/APIM mode.)

---

## Optional backup: Netlify (also free)
1. Go to https://app.netlify.com
2. Sign up with GitHub
3. **Add new site -> Import from Git**
4. Pick same repo and branch `cursor/build-aic-portal-7019`
5. Build command: none
6. Publish directory: `.`
7. Deploy site

---

## Optional backup: GitHub Pages (free)
This app can run on Pages, but Vercel is easier for custom headers and cleaner routing.

---

## Quick smoke test after deploy
1. Open `/index.html`
2. Login as Dina (submitter)
3. Create initiative via wizard
4. Login as Sarah, score it
5. Login as Faisal, approve vote
6. Login as Khalid, verify audit trail in Admin



## Optional: automatic deploy from GitHub Actions
A workflow is included at `.github/workflows/vercel-deploy.yml`.

If you want one-click deploy from GitHub Actions, add these repo secrets:
- `VERCEL_TOKEN`

Then run workflow **Vercel Deploy (Free Hosting)** from the Actions tab.

