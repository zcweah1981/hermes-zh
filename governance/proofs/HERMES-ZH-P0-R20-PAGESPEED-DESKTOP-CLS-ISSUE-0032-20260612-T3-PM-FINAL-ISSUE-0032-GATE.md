# HERMES-ZH-P0-R20-PAGESPEED-DESKTOP-CLS-ISSUE-0032-20260612-T3-PM-FINAL-ISSUE-0032-GATE

## Verdict
- **Final status**: `PARTIAL / NO OVERALL PASS`
- **Overall PASS?** `NO`
- **Reason**: Issue #3.2 production deployment and smoke proof passed, but the required official fresh PSI desktop/mobile report URLs and metrics were not obtained due to Google PSI `429 Too Many Requests` plus browser daemon fallback failure. The available same-batch fallback Lighthouse does **not** prove desktop `>=90`, so the gate cannot close as overall pass.

## SQLite SSoT scope
- DB: `/root/.hermes/projects/dispatch-system/dispatch_runtime.db`
- Project filter used on all reads/writes: `project_id = 'hermes-zh'`
- Task group: `HERMES-ZH-P0-R20-PAGESPEED-DESKTOP-CLS-ISSUE-0032-20260612`
- Dependency status from SQLite:
  - T0 read-only RCA: `completed`
  - T1 Issue #3.2 implementation: `completed`
  - T2 clean deploy + verify: `completed`

## Baseline vs after
| Metric | Baseline / contract | After evidence | PM decision |
|---|---:|---:|---|
| Desktop user observation | `80` | fallback Lighthouse `81`; no fresh official PSI | Not enough for PASS |
| Desktop R19 official fresh | `81 / CLS 0.4` | official fresh PSI blocked; fallback `81 / CLS 0` | No proven desktop lift to `>=90` |
| Mobile R17 | `97` | fallback `85`; no fresh official PSI | Still below R17; official non-regression unproven |
| Mobile R19 official fresh | `83 / CLS 0.001` | fallback `85 / CLS 0.002094` | not worse than R19 by fallback, but official proof blocked |

## Production / route / marker / visual proof
From T2 SQLite artifact + proof file:
- Clean release worktree: `/tmp/hermes-zh-r20-t2-deploy-FgoETr`
- Approved/deployed SHA: `08768452a24e6206194bc01bac97ab51dde7dd27`
- Vercel production deployment: `dpl_D4kihaQFr9GsPowZj2sdTUT5XaQL`
- Canonical alias: `hermes-zh.com`
- Routes: `/`, `/docs/start`, `/docs/solutions`, `/llms.txt` all HTTP `200`
- Markers: GA4 `G-N2Q0TXQDRZ` present; `ga4-idle-loader` present; `nav_start_click` present; Cloudflare official beacon present; `external_stylesheets=[]`
- Visual smoke: home hero H1 not clipped; header/logo/title normal; docs three-column semantic signals normal; no obvious layout collapse

## Issue #3.2 implementation result
- T0 selected minimal fix: single-variable local CSS baseline/line-box guard for `.site-hero-title`; preserve existing `min-height`, avoid broad font/network rewrites.
- T1 implemented commit: `08768452a24e6206194bc01bac97ab51dde7dd27` (`fix(perf): stabilize hero h1 font swap baseline`)
- Modified files: `app/globals.css`, `tests/performance/pagespeed-minimal-fix.test.ts`
- T1 verification: typecheck pass, performance tests pass, unit tests pass, build pass.
- T2 deployed the same SHA and confirmed live markers/routes/visual smoke.

## Fresh PSI evidence boundary
- Official PSI API desktop/mobile: each retried 3 times and blocked by `429 Too Many Requests`.
- Browser UI fallback: blocked by browser daemon startup failure.
- Therefore no new official PageSpeed report URL exists for this gate.
- Same-batch fallback Lighthouse:
  - desktop: score `81`, FCP `0.9s`, LCP `1.3s`, TBT `320ms`, CLS `0`, SI `1.3s`, TTFB `30ms`
  - mobile: score `85`, FCP `1.6s`, LCP `1.6s`, TBT `540ms`, CLS `0.0020943415`, SI `1.7s`, TTFB `40ms`
- PM interpretation: fallback Lighthouse is useful auxiliary proof, but it does not replace official PSI acceptance. Desktop remains far below the `>=90` contract by available score evidence.

## Next exact issue
**Selected next exact issue**: `Issue #3.2-official-psi-reproof-and-top-insight-capture`

### Boundary
- Owner lane: `OPS` / read-only verification first.
- Scope: collect official PageSpeed desktop + mobile fresh report URLs, metrics, and top failing insights after deployed SHA `08768452a24e6206194bc01bac97ab51dde7dd27`.
- Required output:
  1. desktop official report URL + score/FCP/LCP/TBT/CLS/SI/TTFB/top failing insights;
  2. mobile official report URL + score/FCP/LCP/TBT/CLS/SI/TTFB/top failing insights;
  3. explicit comparison to R19 desktop `81/0.4`, user observation `80`, R19 mobile `83`, R17 mobile `97`;
  4. if official data still fails, select exactly one trace-backed next culprit.
- No code, no deployment, no broad rewrite.

### Fallback next culprit if official PSI succeeds but target still fails
From T0 trace RCA, the next trace-backed culprit after the H1 guard is: `header brand title font-swap small shift` (small desktop/mobile header title y-shift). This remains a candidate only after official PSI top insights confirm the page is still failing and no broader PSI insight supersedes it.

## Blockers
1. Official PSI quota/rate-limit (`429`) prevented required fresh report URL collection.
2. Browser daemon fallback failed, so PageSpeed UI report capture was also unavailable.
3. Without official fresh PSI, desktop `>=90` and official mobile non-regression cannot be proven.

## PM gate record
- Artifact type to DB: `pm_final_gate`
- Report status: `completed`
- Created at UTC: `2026-06-12T03:36:38Z`
