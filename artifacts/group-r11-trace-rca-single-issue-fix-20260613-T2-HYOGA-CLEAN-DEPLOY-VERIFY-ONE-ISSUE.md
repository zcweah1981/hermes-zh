# group-r11-trace-rca-single-issue-fix-20260613-T2-HYOGA-CLEAN-DEPLOY-VERIFY-ONE-ISSUE

Repo-side artifact mirror for Dispatch repo-proof detection.

Canonical proof directory:
- `/root/.hermes/projects/hermes-zh/docs/audits/2026-06-13-r11-clean-deploy-verify/`

Production deployment proof:
- deployment id: `dpl_CqSVBkQwgzWHAovwM3xR1yxVX441`
- inspect: `https://vercel.com/pascalteam/hermeszh/CqSVBkQwgzWHAovwM3xR1yxVX441`
- production url: `https://hermeszh-9d7svfvq1-pascalteam.vercel.app`
- deployed commit sha: `17e25b687eeb954da5137fd34c8a15698bb4b3c2`
- deployed commit subject: `fix(perf): stabilize mobile header proof and desktop cls`
- clean-worktree proof: `/root/.hermes/projects/hermes-zh/docs/audits/2026-06-13-r11-clean-deploy-verify/worktree-proof.txt`

Verification artifacts:
- `/root/.hermes/projects/hermes-zh/docs/audits/2026-06-13-r11-clean-deploy-verify/deployments.production.latest.json`
- `/root/.hermes/projects/hermes-zh/docs/audits/2026-06-13-r11-clean-deploy-verify/vercel-deploy-prod.log`
- `/root/.hermes/projects/hermes-zh/docs/audits/2026-06-13-r11-clean-deploy-verify/live-headers.json`
- `/root/.hermes/projects/hermes-zh/docs/audits/2026-06-13-r11-clean-deploy-verify/live-dom-summary.json`
- `/root/.hermes/projects/hermes-zh/docs/audits/2026-06-13-r11-clean-deploy-verify/psi-home-desktop.browser.txt`
- `/root/.hermes/projects/hermes-zh/docs/audits/2026-06-13-r11-clean-deploy-verify/psi-home-desktop.url.txt`
- `/root/.hermes/projects/hermes-zh/docs/audits/2026-06-13-r11-clean-deploy-verify/psi-home-mobile.browser.txt`
- `/root/.hermes/projects/hermes-zh/docs/audits/2026-06-13-r11-clean-deploy-verify/psi-docs-start-mobile.browser.txt`
- `/root/.hermes/projects/hermes-zh/docs/audits/2026-06-13-r11-clean-deploy-verify/lh-home-desktop.report.json`
- `/root/.hermes/projects/hermes-zh/docs/audits/2026-06-13-r11-clean-deploy-verify/lh-home-desktop.report.html`
- `/root/.hermes/projects/hermes-zh/docs/audits/2026-06-13-r11-clean-deploy-verify/lh-home-mobile.report.json`
- `/root/.hermes/projects/hermes-zh/docs/audits/2026-06-13-r11-clean-deploy-verify/lh-home-mobile.report.html`
- `/root/.hermes/projects/hermes-zh/docs/audits/2026-06-13-r11-clean-deploy-verify/lh-docs-start-mobile.report.json`
- `/root/.hermes/projects/hermes-zh/docs/audits/2026-06-13-r11-clean-deploy-verify/lh-docs-start-mobile.report.html`
- `/root/.hermes/projects/hermes-zh/docs/audits/2026-06-13-r11-clean-deploy-verify/metric-compare.json`

Verdict:
- clean deploy + commit parity: PASS
- desktop PSI field CLS green: PASS (`0.02`, CWV Passed)
- desktop PSI lab CLS from 0.409 to green: FAIL (`0.409` persists)
- mobile home/docs-start FCP/LCP vs R9 local Lighthouse: PASS (both improved)
- single-issue fix fully closed by requested desktop lab CLS criterion: FAIL
