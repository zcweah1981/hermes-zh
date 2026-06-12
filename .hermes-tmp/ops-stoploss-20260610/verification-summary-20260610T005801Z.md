# HERMES-ZH-P0-PAGESPEED-CF-R9-LIVE-STOPLOSS-20260610-0610-NOGO-RECOVERY-T2-OPS-DEPLOY-VERIFY-LIVE-STOPLOSS

## SHA / Deploy Reconciliation
- local HEAD: `36b9680de2761e59a624bf4e44e7b8f34d28a434`
- `origin/main`: `36b9680de2761e59a624bf4e44e7b8f34d28a434`
- Vercel latest production deploy: `dpl_Bu5UyTJ8C5M3XtyyqZnVpgMSLAP9`
- Vercel deployed SHA: `36b9680de2761e59a624bf4e44e7b8f34d28a434`
- Result: `local HEAD == origin/main == deployed production SHA`; no redeploy required.
- Containment: `git merge-base --is-ancestor 36b9680... origin/main` => PASS.

## Live Endpoint Verification
### `/api/search?q=hermes`
- Canonical host manual redirect probe: `308`
- `Location`: `https://hermes-zh.com/search?q=hermes`
- Followed result: `200`, `finalUrl=https://hermes-zh.com/search?q=hermes`
- Headers on canonical redirect response: `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate`, `X-Vercel-Cache: HIT`, `Cf-Cache-Status: DYNAMIC`
- Verdict: redirect behavior PASS; cacheable-small-response expectation FAIL (still private/no-store, edge dynamic)

### `/cdn-cgi/rum/beacon.min.js`
- Canonical host: `404`, `Content-Type: text/html; charset=UTF-8`
- Production alias `https://hermeszh-5nzbvaho1-pascalteam.vercel.app/cdn-cgi/rum/beacon.min.js`: `200`, body begins with mirrored beacon JS, `X-Vercel-Cache: HIT`
- Browser DOM on production alias confirms script tag present: `<script id="cloudflare-web-analytics" src=".../cdn-cgi/rum/beacon.min.js">`
- Verdict: alias/origin deploy contains mirror, but canonical `hermes-zh.com` still serves Cloudflare-side 404. Acceptance FAIL on canonical endpoint.

### Canonical pages / leakage
- `/`: `200`, `cf-cache-status: HIT`, `x-vercel-cache: PRERENDER`, canonical `https://hermes-zh.com`, `/api/assets/raw` count `0`
- `/docs/start`: `200`, `cf-cache-status: HIT`, `x-vercel-cache: PRERENDER`, canonical `https://hermes-zh.com/docs/start`, `/api/assets/raw` count `0`, `/content-assets/` count `2`
- `/docs/solutions/x-twitter`: `200`, `cf-cache-status: HIT/EXPIRED→HIT`, `x-vercel-cache: PRERENDER`, canonical `https://hermes-zh.com/docs/solutions/x-twitter`, `/api/assets/raw` count `0`, `/content-assets/` count `4`
- Verdict: canonical pages healthy; no `/api/assets/raw` leakage observed in sampled rendered HTML.

## Performance Proof
### PSI
- Desktop PSI: blocked by `HTTP 429 Too Many Requests`
- Mobile PSI: blocked by `HTTP 429 Too Many Requests`
- Artifacts: `psi-desktop.err.txt`, `psi-mobile.err.txt`

### Lighthouse fallback
Artifacts under `.hermes-tmp/ops-stoploss-20260610/lh/`:
- `home-mobile.report.json`
- `home-mobile.report.html`
- `home-desktop.report.json`
- `home-desktop.report.html`

Metrics:
- Mobile: score `0.41`, FCP `2565.991ms`, LCP `5508.064ms`, Speed Index `5658.015ms`, TBT `8611.5ms`, CLS `0.0226`, Interactive `14759.767ms`, server response `30ms`, long tasks `20 display / 13 diagnostics`
- Desktop: score `0.43`, FCP `1318.166ms`, LCP `2651.793ms`, Speed Index `4066.844ms`, TBT `2922.056ms`, CLS `0.00129`, Interactive `6959.916ms`, server response `160ms`, long tasks `20 display / 22 diagnostics`

## Vercel Usage / Top Paths / Cloudflare Trend
- Browser path to Vercel Usage initially titled as project page, but settled DOM is Vercel login page. UI access blocked.
- `GET /v1/usage?...teamId=...` => `400 plan_upgrade_required`
- `npx vercel usage --format json` => `Costs not found (404)`
- Exact Vercel Usage / Top Paths unavailable from current auth+plan surface.

Cloudflare daily totals via GraphQL (`zoneTag=b51dda28eef3f57b6fbddd5f065151b2`):
- Baseline uncached bytes avg for 2026-06-01..04: `349,025,174.25`
- 2026-06-07 uncached bytes: `1,803,982,755` (`5.17x` baseline)
- 2026-06-08 uncached bytes: `2,231,060,040` (`6.39x` baseline)
- 2026-06-09 uncached bytes: `2,247,453,662` (`6.44x` baseline)
- 2026-06-10 partial so far: `7,471,141` (`0.021x` baseline`, partial day only`)
- Trend verdict: exact Vercel FOT/top-path attribution blocked, but Cloudflare uncachedBytes proxy shows elevated origin-pressure trend through 2026-06-09.

## Overall Acceptance Mapping
- Reconcile SHA and deployed production SHA including stoploss commit: PASS
- `/api/search?q=hermes` 308 redirect: PARTIAL PASS (redirect yes; small cacheable response no)
- `/cdn-cgi/rum/beacon.min.js` 200 immutable static cache headers on canonical host: FAIL
- Homepage/docs canonical pages 200 and no `/api/assets/raw` leakage: PASS
- PSI if quota allows else Lighthouse fallback with artifacts: PASS via Lighthouse fallback
- Vercel Usage/FOT/Top Paths if available else exact blocker + Cloudflare trend: PASS with blocker documented
