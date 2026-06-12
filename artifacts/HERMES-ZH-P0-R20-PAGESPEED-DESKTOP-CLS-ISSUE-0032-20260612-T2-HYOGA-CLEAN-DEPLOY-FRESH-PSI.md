# Artifact mirror

Repo-side mirror of governance proof for Runtime API repo-proof detection.

Source proof:
`/opt/projects/hermes-zh/governance/proofs/HERMES-ZH-P0-R20-PAGESPEED-DESKTOP-CLS-ISSUE-0032-20260612-T2-HYOGA-CLEAN-DEPLOY-FRESH-PSI.md`

Key facts:
- clean release worktree: `/tmp/hermes-zh-r20-t2-deploy-FgoETr`
- approved target SHA: `08768452a24e6206194bc01bac97ab51dde7dd27`
- production deployment id: `dpl_D4kihaQFr9GsPowZj2sdTUT5XaQL`
- production alias: `hermes-zh.com`
- deployed production SHA: `08768452a24e6206194bc01bac97ab51dde7dd27`
- routes `/`, `/docs/start`, `/docs/solutions`, `/llms.txt`: all HTTP 200
- markers PASS: `G-N2Q0TXQDRZ`, `ga4-idle-loader`, `nav_start_click`, Cloudflare official beacon, external stylesheet=[]
- visual smoke PASS
- official PSI fresh proof blocked by `429 Too Many Requests` + browser daemon failure
- fallback Lighthouse collected: desktop score 81 / mobile 85
- verdict: `NO OVERALL PASS`
