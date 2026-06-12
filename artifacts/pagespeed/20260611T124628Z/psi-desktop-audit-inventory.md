# Desktop PSI/Lighthouse Audit Inventory — 20260611T124628Z

- User supplied desktop PSI primary input: `https://pagespeed.web.dev/analysis/https-hermes-zh-com/uaun7lv4kg?utm_source=search_console&form_factor=desktop&hl=zh_CN`
- User observed desktop score: `81`
- Fresh local Lighthouse desktop score: `77.0`; mobile: `76.0`
- Raw desktop JSON: `/opt/projects/hermes-zh/artifacts/pagespeed/20260611T124628Z/lighthouse-desktop-raw.json`
- Raw mobile JSON: `/opt/projects/hermes-zh/artifacts/pagespeed/20260611T124628Z/lighthouse-mobile-raw.json`
- User supplied PSI page extract: `/opt/projects/hermes-zh/artifacts/pagespeed/20260611T124628Z/user-supplied-psi-desktop-page-extract.md`
- PSI API fresh request: HTTP 429; local Lighthouse 13.4.0 JSON used as PSI-equivalent artifact. User PSI page text was extracted with web_extract.

## Ordered issue inventory / fix order

| # | audit id/name | affected resource/file/component | estimated savings / impact | current value | proposed minimal fix | risk | scope |
|---:|---|---|---|---|---|---|---|
| 1 | `errors-in-console`<br>Browser errors were logged to the console | https://hermes-zh.com/cdn-cgi/rum/beacon.min.js (Cloudflare RUM beacon, deployment/edge config; not a source file in repo) | Best-practices/audit failure removal; no direct perf ms saving in Lighthouse, but removes 404 network console error. | desktop: 1 network 404 console error; mobile: same 404 console error | Disable/fix Cloudflare Web Analytics/RUM injection for this zone OR configure beacon path so /cdn-cgi/rum/beacon.min.js resolves 200. Do not touch GA4 idle loader. | Medium: likely Cloudflare/Vercel edge setting; source-code rewrite may not fix it. Must avoid reverting R13 GA4 marker/nav_start_click. | shared with mobile |
| 2 | `mainthread-work-breakdown`<br>Minimize main-thread work | Client runtime/page JS and layout on homepage; desktop top group Script Evaluation 3492.6ms; mobile top group Style & Layout 2721.9ms | desktop metricSavings TBT 500ms; mobile metricSavings TBT 100ms | desktop 6.2 s; mobile 5.2 s | Profile homepage client boundaries; convert non-interactive marketing sections/components to Server Components/static markup; defer non-critical interactive code only where localized. | High: broad/global rewrite risk; must not be implemented in R16 without PM approval beyond issue #1. | shared with mobile, but desktop impact is larger in this run |
| 3 | `bootup-time`<br>Reduce JavaScript execution time | https://hermes-zh.com/_next/static/chunks/255-1a68626ff4d024e4.js and framework chunk 4bd1b696-c023c6e3521b1417.js | desktop metricSavings TBT 150ms; mobile metricSavings TBT 100ms (mobile audit score already 1 but table still shows JS execution) | desktop 3.5 s; worst desktop chunk total 4033.2ms scripting 3009.8ms; mobile 1.1 s | Identify source modules inside chunk 255 via treemap/source maps/build analyzer; remove or server-render the responsible client dependency instead of changing global Next config. | Medium-high: chunk hash maps to build output; minimal fix needs source attribution before edit. | shared with mobile, desktop-only severity in score |
| 4 | `legacy-javascript-insight`<br>Legacy JavaScript | https://hermes-zh.com/_next/static/chunks/255-1a68626ff4d024e4.js | Estimated byte saving 12 KiB; Lighthouse metricSavings FCP/LCP 0 | desktop Est savings of 12 KiB; mobile Est savings of 12 KiB | Check browserslist/Next output target and dependency transforms; only adjust if safe for intended browser support. | Low-medium: may be framework/dependency emitted; changing browser support can break older browsers. | shared with mobile |
| 5 | `network-dependency-tree-insight`<br>Network dependency tree | Font requests: https://hermes-zh.com/fonts/noto-serif-sc.woff2, https://hermes-zh.com/fonts/noto-sans-sc.woff2 | Lighthouse metricSavings LCP 0 in both local runs; critical chain duration desktop 1215ms, mobile 1130ms | desktop chain root HTML -> noto-serif-sc.woff2/noto-sans-sc.woff2; no preconnected origins; total font bytes ~451 KiB | Keep no external stylesheet behavior. If optimizing later, consider preload/self-hosted font subset/font-display/local fallback after verifying visual impact. | Medium: font changes can alter Chinese typography/layout; R13 no-external-stylesheet behavior must be preserved. | shared with mobile |
| 6 | `total-byte-weight`<br>Avoids enormous network payloads / resource weight inventory | Top bytes: fonts/noto-serif-sc.woff2 262,994B; fonts/noto-sans-sc.woff2 188,333B; icon.png 86,609B; framework chunks 56,097B + 46,436B | No failing score (score 1); inventory-only potential transfer reduction if later optimized | desktop total Total size was 741 KiB; mobile Total size was 743 KiB | Do not prioritize in R16 unless later PSI shows payload as failing; possible minimal fixes: compress icon, subset fonts, but verify layout/branding. | Low-medium: payload edits are easy but can distract from desktop TBT root cause. | shared with mobile |
| 7 | `llms-txt`<br>llms.txt does not follow recommendations | /llms.txt content/config | SEO/LLM crawler hygiene; no Lighthouse performance saving | desktop audit score 0: File does not appear to contain any links; mobile same in candidate list | Add at least one Markdown H1 and relevant links in llms.txt when this non-performance issue is scheduled. | Low: content-only but outside desktop performance critical path. | shared with mobile |

## Exact selected Issue #1 for R16 implementation

`errors-in-console` — Browser errors were logged to the console: https://hermes-zh.com/cdn-cgi/rum/beacon.min.js (Cloudflare RUM beacon, deployment/edge config; not a source file in repo)

Minimal fix candidate: Disable/fix Cloudflare Web Analytics/RUM injection for this zone OR configure beacon path so /cdn-cgi/rum/beacon.min.js resolves 200. Do not touch GA4 idle loader.

## Non-regression constraints
- No code edited in T0 inventory task
- Production SHA a7ceaeaf7aca8bf8ee8d64df4c4cfc8c617cc6f2 observed locally
- R13 GA4 idle-loader, GA4 marker G-N2Q0TXQDRZ, nav_start_click, and no external stylesheet behavior must not be reverted by later fix
