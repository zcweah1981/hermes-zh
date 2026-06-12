# Repo Artifact — HERMES-ZH-P0-R12-PRODUCTION-RELEASE-AUTH-20260610-2324-T2-HYOGA-PROD-DEPLOY-VERIFY

- Task ID: `HERMES-ZH-P0-R12-PRODUCTION-RELEASE-AUTH-20260610-2324-T2-HYOGA-PROD-DEPLOY-VERIFY`
- Collected at: `2026-06-10T23:52:36+08:00`
- Repo target: `/opt/projects/hermes-zh`

## Deploy identity
- Local HEAD: `93b9ac04db57aa9a424ae7d62c43b2c0c7005c97`
- `origin/main`: `93b9ac04db57aa9a424ae7d62c43b2c0c7005c97`
- Production deployment ID: `dpl_2tvyvPh63KC5UpZvVMp5LHV6YEhs`
- Production deployment URL: `https://hermeszh-k38mnd2uy-pascalteam.vercel.app`
- Production SHA: `93b9ac04db57aa9a424ae7d62c43b2c0c7005c97`
- Result: requested SHA already live in production; no redeploy executed.

## Route verification
- `/` → `200` / `CF HIT` / `Vercel HIT`
- `/docs/start` → `200` / `CF HIT` / `Vercel HIT`
- `/search` → `200` / `CF DYNAMIC` / `Vercel PRERENDER`
- `/packs` → `200` / `CF HIT` / `Vercel PRERENDER`
- `/robots.txt` → `200`
- `/llms.txt` → `200`
- `/docs/solutions/x-twitter` → `200`

## Marker verification
- GA4 `G-N2Q0TXQDRZ` present on `/`, `/docs/start`, `/docs/solutions/x-twitter`
- `nav_start_click` present on `/`, `/docs/start`, `/docs/solutions/x-twitter`

## Raw asset verification
- `/api/assets/raw?path=solution-twitter-read-vs-actions-v1.webp` → `308`
- redirect target: `/content-assets/solution-twitter-read-vs-actions-v1.webp`
- final asset: `200`, `image/webp`, `cache-control: public, max-age=31536000, immutable`, `CF HIT`, `Vercel HIT`

## PSI evidence
- mobile: `https://pagespeed.web.dev/analysis/https-hermes-zh-com/103jwq71nc?form_factor=mobile`
- desktop: `https://pagespeed.web.dev/analysis/https-hermes-zh-com/103jwq71nc?form_factor=desktop`
- mobile lab: perf `83`, FCP `3.0s`, LCP `3.8s`, TBT `90ms`, CLS `0.001`, SI `3.2s`
- desktop URL field: `Passed`, LCP `2.4s`, INP `44ms`, CLS `0.02`, FCP `2.3s`, TTFB `1.5s`
- desktop origin field: `Failed`, LCP `2.7s`, INP `47ms`, CLS `0.02`, FCP `2.6s`, TTFB `1.8s`

## Usage evidence / blocker
- Vercel `/v1/usage`: `plan_upgrade_required` on supported-looking ISO format; alternate formats returned `invalid_from_date`
- Vercel `/v1/billing/charges`: `costs_not_found`
- Cloudflare fallback trend: 2026-06-10 uncached bytes `130,627,336` vs `2,247,453,662` on 2026-06-09 (trend only)

## External proof path
- `/root/.hermes/projects/hermes-zh/governance/proofs/HERMES-ZH-P0-R12-PRODUCTION-RELEASE-AUTH-20260610-2324-T2-HYOGA-PROD-DEPLOY-VERIFY.md`
