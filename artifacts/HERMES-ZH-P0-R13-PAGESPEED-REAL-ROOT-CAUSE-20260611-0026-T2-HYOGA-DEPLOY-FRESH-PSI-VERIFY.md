# HERMES-ZH-P0-R13-PAGESPEED-REAL-ROOT-CAUSE-20260611-0026-T2-HYOGA-DEPLOY-FRESH-PSI-VERIFY

## Deployment proof
- approved non-main fix SHA: `a0f91926b4e4f0be1523edc14ff80fb538d39cf2`
- commit message: `fix(perf): defer ga4 loader beyond initial trace`
- pre-deploy `origin/main`: `93b9ac04db57aa9a424ae7d62c43b2c0c7005c97`
- pre-deploy production SHA: `93b9ac04db57aa9a424ae7d62c43b2c0c7005c97`
- containment gate: target SHA is **not** ancestor of `origin/main`
- production deploy method: throwaway worktree pinned to `origin/fix/pagespeed-ga4-idle-loader-20260611`
- production deploy id: `dpl_2khhPCGJVdE5q37zbwznEhrK7MBF`
- direct production URL: `https://hermeszh-74l5zq0fv-pascalteam.vercel.app`
- canonical aliases: `https://hermes-zh.com`, `https://www.hermes-zh.com`
- Vercel API deployed SHA proof: `meta.gitCommitSha=a0f91926b4e4f0be1523edc14ff80fb538d39cf2`

## Live route + marker proof
- `/` -> 200, `cf-cache-status=HIT`, `x-vercel-cache=HIT`
- `/docs/start` -> 200, `cf-cache-status=HIT`, `x-vercel-cache=HIT`
- `/solutions` -> 200 -> canonical `/docs/solutions`, `cf-cache-status=HIT`, `x-vercel-cache=PRERENDER`
- `/llms.txt` -> 200, `cf-cache-status=HIT`
- homepage DOM contains `G-N2Q0TXQDRZ`: true
- homepage DOM contains `nav_start_click`: true
- raw asset redirect: `/api/assets/raw?path=solution-twitter-read-vs-actions-v1.webp` -> `308` -> `https://hermes-zh.com/content-assets/solution-twitter-read-vs-actions-v1.webp`
- followed asset response: `200`, `cache-control=public, max-age=31536000, immutable`, `cf-cache-status=HIT`, `x-vercel-cache=HIT`
- visual regression check: browser screenshot showed no obvious broken layout / missing CSS / broken images
- screenshot path: `/root/.hermes/profiles/ops/cache/screenshots/browser_screenshot_084c9f2c4ef642b8a8c0603ff1d1f68f.png`

## Fresh PSI proof
### Mobile
- report URL: `https://pagespeed.web.dev/analysis/https-hermes-zh-com/nlrkq2ykvj?form_factor=mobile`
- report time: `Jun 11, 2026, 1:35:57 AM`
- performance: `82`
- FCP: `3.0s`
- LCP: `3.8s`
- TBT: `130ms`
- CLS: `0.001`
- Speed Index: `3.0s`
- render-blocking requests est savings: `2470ms`
- long tasks: `4`
- field data: `No Data`

### Desktop — This URL
- report URL: `https://pagespeed.web.dev/analysis/https-hermes-zh-com/nlrkq2ykvj?form_factor=desktop`
- report time: `Jun 11, 2026, 1:35:57 AM`
- URL CWV: `Passed`
- performance: `81`
- FCP: `0.6s`
- LCP: `0.8s`
- TBT: `20ms`
- CLS: `0.4`
- Speed Index: `0.8s`
- render-blocking requests: present in audit list
- long tasks: `2`

### Desktop — Origin
- same report after switching to `Origin`
- origin CWV: `Failed`
- origin FCP: `2.6s`
- origin LCP: `2.7s`
- origin CLS: `0.02`
- origin TTFB: `1.8s`

## Acceptance judgment
- Deploy identity: PASS
- Live routes 200: PASS
- GA4 + `nav_start_click`: PASS
- visual zero-change: PASS (browser proof)
- mobile render-blocking estimate vs baseline `2710ms`: IMPROVED to `2470ms`, but still the dominant blocker
- mobile FCP/LCP vs baseline `3.2s/3.9s`: IMPROVED to `3.0s/3.8s`
- score >= 90: FAIL (`82` mobile / `81` desktop)
- root-cause closure: NOT CLOSED
- next exact blocking audit: **mobile Render-blocking requests**

## Conclusion
R13 has been successfully promoted to production and the approved fix SHA is live on the canonical domain. However, fresh PSI does not justify claiming PageSpeed closure. The improvement is real but incomplete; the next blocking audit remains mobile render-blocking requests.