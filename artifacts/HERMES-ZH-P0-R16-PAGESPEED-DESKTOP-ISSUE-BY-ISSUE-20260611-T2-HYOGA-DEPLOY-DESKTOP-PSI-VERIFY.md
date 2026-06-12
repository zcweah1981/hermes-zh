# HERMES-ZH-P0-R16-PAGESPEED-DESKTOP-ISSUE-BY-ISSUE-20260611-T2-HYOGA-DEPLOY-DESKTOP-PSI-VERIFY

## 操作
- 核对 Dispatch / Runtime / T0 / T1 边界，确认 R16 reviewed Issue #1 不是已上线状态，而是本地未提交 diff：
  - `app/layout.tsx`
  - `tests/seo/cloudflare-web-analytics.test.ts`
- 确认 T0 选定 Issue #1：`errors-in-console`，目标 404 资源为 `https://hermes-zh.com/cdn-cgi/rum/beacon.min.js`。
- 将 reviewed Issue #1 diff 单独提交并推送到批准分支：
  - commit: `c80c97717bf2b2993cb69a0a278dada233d5c645`
  - message: `fix(perf): load Cloudflare analytics beacon from official host`
- 从 clean throwaway worktree `/opt/projects/hermes-zh/.hermes-tmp/r16-deploy-c80c977` 执行 `vercel deploy --prod --token ... --scope pascalteam --yes`。
- 通过 Vercel API、生产 headers、浏览器 DOM、视觉截图、Cloudflare purge、PSI UI、Lighthouse CLI 采集部署与性能证据。

## 状态
### 1. reviewed branch / deploy identity
- local HEAD: `c80c97717bf2b2993cb69a0a278dada233d5c645`
- `origin/fix/pagespeed-ga4-idle-loader-20260611`: `c80c97717bf2b2993cb69a0a278dada233d5c645`
- `origin/main`: `93b9ac04db57aa9a424ae7d62c43b2c0c7005c97`
- Production deploy id: `dpl_FJNjt6LYJJ5EfH3WYSvdF52JASoo`
- Production alias URL: `https://hermeszh-jwj5oofi6-pascalteam.vercel.app`
- Canonical alias: `https://hermes-zh.com`
- Vercel production metadata proves deploy SHA = `c80c97717bf2b2993cb69a0a278dada233d5c645`
- Classification: **authorized non-main production deploy boundary**

### 2. live route health
Fresh canonical route probes after deploy + Cloudflare purge:

| Route | HTTP | CF Cache | Vercel Cache | Notes |
|---|---:|---|---|---|
| `/` | 200 | MISS | HIT | HTML contains `G-N2Q0TXQDRZ`, `ga4-idle-loader`, `nav_start_click`; no external stylesheet link |
| `/docs/start` | 200 | MISS | HIT | `/content-assets/` count=2; no `/api/assets/raw` leak |
| `/docs/solutions` | 200 | MISS | HIT | same marker set healthy |
| `/llms.txt` | 200 | MISS | MISS | plain text route healthy |

### 3. marker / HTML regression proof
Homepage full-body probes after deploy:
- `G-N2Q0TXQDRZ`: present
- `ga4-idle-loader`: present
- `nav_start_click`: present
- external stylesheet links: none detected in live DOM / HTML
- new Cloudflare analytics beacon host: `https://static.cloudflareinsights.com/beacon.min.js` present
- old same-origin beacon ref `/cdn-cgi/rum/beacon.min.js`: absent from live homepage HTML after deploy

Docs `/docs/start` live DOM proof:
- `G-N2Q0TXQDRZ`: present
- `ga4-idle-loader`: present
- `nav_start_click`: present
- external stylesheet links: none
- `https://static.cloudflareinsights.com/beacon.min.js`: present
- `/cdn-cgi/rum/beacon.min.js`: absent

### 4. visual smoke
- Homepage screenshot: `/root/.hermes/profiles/ops/cache/screenshots/browser_screenshot_49ca7c4541cf4f39a76d548b7228e959.png`
  - visual verdict: hero, cards, footer all normal; no missing CSS or obvious layout break.
- `/docs/start` screenshot: `/root/.hermes/profiles/ops/cache/screenshots/browser_screenshot_7667e7b8fb9d43eb9b2d112a0383a71c.png`
  - visual verdict: sidebar / heading / article content normal; no docs-shell regression.

### 5. desktop/mobile PSI + Lighthouse evidence
#### PSI UI report currently returned by pagespeed.web.dev
- Desktop report URL: `https://pagespeed.web.dev/analysis/https-hermes-zh-com/cjp1baxkon?form_factor=desktop`
- Mobile report URL: `https://pagespeed.web.dev/analysis/https-hermes-zh-com/cjp1baxkon?form_factor=mobile`
- PSI report timestamp shown in UI: `Jun 11, 2026, 9:23:22 PM GMT+8`

Desktop PSI UI (This URL field data + lab panel visible in UI):
- score: `81`
- FCP: `0.6 s`
- LCP: `0.6 s`
- TBT: `20 ms`
- CLS: `0.4`
- Speed Index: `0.6 s`
- TTFB (field): `1.4 s`
- This URL CWV: `Passed`
- top visible failing opportunities / diagnostics:
  - `Layout shift culprits`
  - `Forced reflow`
  - `Network dependency tree`
  - `Legacy JavaScript` (est savings `12 KiB`)
  - `Optimize DOM size`
  - `LCP breakdown`
  - diagnostics: `Avoid long main-thread tasks — 2 long tasks found`
  - best-practices failing audit still listed: `Browser errors were logged to the console`

Mobile PSI UI (same report family surfaced in UI):
- score: `92`
- FCP: `0.9 s`
- LCP: `3.2 s`
- TBT: `130 ms`
- CLS: `0.001`
- Speed Index: `1.1 s`
- This URL field data: `No Data`
- visible top opportunities / diagnostics:
  - `Forced reflow`
  - `Network dependency tree`
  - `Legacy JavaScript` (est savings `12 KiB`)
  - `Layout shift culprits`
  - `Optimize DOM size`
  - `LCP breakdown`
  - diagnostics: `Avoid long main-thread tasks — 2 long tasks found`
  - best-practices failing audit still listed: `Browser errors were logged to the console`

#### Fresh post-deploy Lighthouse CLI fallback / measurable effect
Artifacts:
- pre-purge run:
  - `/opt/projects/hermes-zh/.hermes-tmp/r16-lighthouse/desktop.json`
  - `/opt/projects/hermes-zh/.hermes-tmp/r16-lighthouse/mobile.json`
- post-purge run:
  - `/opt/projects/hermes-zh/.hermes-tmp/r16-lighthouse-postpurge/desktop.json`
  - `/opt/projects/hermes-zh/.hermes-tmp/r16-lighthouse-postpurge/mobile.json`

Post-purge desktop Lighthouse (`fetchTime 2026-06-11T13:27:46.546Z`):
- score: `96`
- FCP: `686 ms`
- LCP: `926 ms`
- TBT: `121 ms`
- CLS: `0.0013`
- Speed Index: `1231 ms`
- TTFB (`server-response-time`): `192 ms`
- `errors-in-console.score`: `0` (failing)
- error item still reported by Lighthouse: `https://hermes-zh.com/cdn-cgi/rum/beacon.min.js` 404

Post-purge mobile Lighthouse (`fetchTime 2026-06-11T13:28:27.498Z`):
- score: `68`
- FCP: `1978 ms`
- LCP: `3021 ms`
- TBT: `1236 ms`
- CLS: `0.0018`
- Speed Index: `2327 ms`
- TTFB (`server-response-time`): `18 ms`
- `errors-in-console.score`: `0` (failing)
- same remaining error item: `https://hermes-zh.com/cdn-cgi/rum/beacon.min.js` 404

### 6. measurable effect vs R16 Issue #1
Before T2:
- live homepage HTML still referenced `/cdn-cgi/rum/beacon.min.js`
- direct probe `https://hermes-zh.com/cdn-cgi/rum/beacon.min.js` => `404`
- T0/T1 issue definition: console-error audit failed because page requested the Cloudflare-reserved `/cdn-cgi/rum/beacon.min.js`

After T2 deploy:
- live homepage and `/docs/start` HTML no longer reference `/cdn-cgi/rum/beacon.min.js`
- live HTML references `https://static.cloudflareinsights.com/beacon.min.js`
- direct canonical homepage proof: `contains_static_cf=true`, `contains_old_cf=false`
- therefore **code-level and live-HTML-level Issue #1 fix is deployed**
- however Lighthouse / PSI best-practices still reports the same `/cdn-cgi/rum/beacon.min.js` 404, which indicates a remaining edge/runtime path outside the rendered HTML source of truth (likely Cloudflare-side injection, stale tool path, or another runtime source)

## 结果
- **Deploy identity**: PASS
- **Production route health**: PASS
- **GA4 / idle loader / nav marker / no external stylesheet regression**: PASS
- **Visual zero-change smoke**: PASS
- **Issue #1 measurable effect**: PARTIAL PASS
  - PASS: reviewed Issue #1 commit is live; rendered live HTML no longer contains `/cdn-cgi/rum/beacon.min.js`
  - FAIL to fully close audit: PSI/Lighthouse still records `Browser errors were logged to the console` for the same `/cdn-cgi/rum/beacon.min.js` 404
- **Desktop baseline comparison**:
  - baseline in user/T0 context: desktop PSI `81`
  - current visible PSI UI desktop remains `81`
  - fresh post-deploy Lighthouse desktop improved strongly to `96`, but PSI UI did not yet show a fresh post-deploy higher desktop result
- **Mobile non-regression**:
  - current visible PSI UI mobile remains `92` (non-regression vs recent R15/R16 UI baseline)
  - local fresh mobile Lighthouse is weaker (`68`), so only UI-side non-regression can currently be claimed; root-cause closure is not complete

## 风险
- Remaining console-error audit likely no longer comes from app source HTML. It may be Cloudflare edge/runtime injection or PSI/Lighthouse cached/runtime behavior.
- Because visible PSI UI still points to `Jun 11, 2026, 9:23:22 PM` report family, **fresh post-deploy PSI proof is not fully closed** even though fresh post-deploy Lighthouse artifacts exist.
- Mobile Lighthouse remains well below recent PSI UI score; do not over-claim mobile recovery from local Lighthouse alone.

## 建议动作
1. Treat this card as **deploy proof complete, but Issue #1 audit closure still partial**.
2. Next exact investigation boundary should target: **who still requests `/cdn-cgi/rum/beacon.min.js` after rendered HTML switched to the official Cloudflare beacon host**.
3. PM should classify the next issue as either:
   - Cloudflare edge / Web Analytics injection RCA, or
   - browser-errors / runtime-side audit cleanup, not another broad frontend perf rewrite.
4. If PM needs strict fresh PSI closeout, rerun PSI after a longer propagation window and compare whether report URL/timestamp advances beyond `cjp1baxkon` / `9:23:22 PM`.
