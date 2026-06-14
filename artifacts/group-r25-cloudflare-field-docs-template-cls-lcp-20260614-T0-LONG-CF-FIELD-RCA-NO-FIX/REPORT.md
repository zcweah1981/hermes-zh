# R25 只读 RCA — Cloudflare field CLS/LCP screenshots 映射到 docs 模板与图片热点

- Task ID: `group-r25-cloudflare-field-docs-template-cls-lcp-20260614-T0-LONG-CF-FIELD-RCA-NO-FIX`
- Repo: `/opt/projects/hermes-zh`
- Mode: **read-only RCA / no code / no deploy**
- Field input: user Cloudflare screenshots, sample count = 1 per listed field signal

## 1. Upstream hard-gate baseline（先读 R24 PASS proof）

已读取：`/opt/projects/hermes-zh/artifacts/group-r24-production-docs-start-canonical-cache-propagation-20260614-T1-HYOGA-CANONICAL-PURGE-REVERIFY-PRODUCTION-CLS/REPORT.md`

R24 关键结论：

| Gate | R24 result | Evidence |
|---|---:|---|
| `/` desktop Lighthouse CLS 5/5 `<0.1` | PASS | `0.03077 / 0.03077 / 0.03069 / 0.03077 / 0.03069` |
| `/docs/start` desktop Lighthouse CLS 5/5 `<0.1` | PASS | `0.0290047` x5 |
| canonical `/docs/start` H1 materialization | PASS | `contentVisibility=visible`, `minHeight=40px`, `lineHeight=40px` |
| mobile smoke home + docs/start | PASS | `CLS=0` for both |
| PSI/CWV API | PARTIAL | Google quota `HTTP 429 / RESOURCE_EXHAUSTED` |

**不可回退边界**：本次 R25 仅解释 Cloudflare field screenshots 的探索性信号，不得把 field sample count=1 当成 hard gate fail，也不得推翻 R24 已完成的 `/` 与 `/docs/start` Lighthouse hard-gate PASS。

## 2. Cloudflare field screenshot input mapping

### 2.1 Field CLS pages

Cloudflare screenshots 指向的 CLS pages：

| URL | Generated page slug | Source content | Route template/component | Key DOM selector |
|---|---|---|---|---|
| `/docs/start` | `/start` | `docs/01-从这开始/总览.md` | `app/docs/[...slug]/page.tsx` | `.site-doc-page-grid[data-doc-desktop-cls-stabilizer="start"]`, `.site-doc-header h1`, `.docs-start-markdown-shell`, `.site-doc-prose` |
| `/docs/docs-overview` | `/docs-overview` | `docs/00-文档总览.md` | `app/docs/[...slug]/page.tsx` | `.site-doc-page-grid`, `article.site-doc-article`, `.site-doc-header h1`, `.site-doc-prose` |
| `/docs/solutions/xiaohongshu` | `/solutions/xiaohongshu` | `docs/02-现成方案/01-内容创作与发布/02-小红书内容助手.md` | `app/docs/[...slug]/page.tsx` | `.site-doc-page-grid`, `article.site-doc-article`, `.site-doc-header h1`, `.site-doc-prose` |
| `/docs/solutions` | `/solutions` | `docs/02-现成方案/01-总览.md` | `app/docs/[...slug]/page.tsx` | `.site-doc-page-grid`, `article.site-doc-article`, `.site-doc-header h1`, `.site-doc-prose` |
| `/docs/china/entry/feishu` | `/china/entry/feishu` | `docs/03-国内落地/03-国内入口/05-飞书.md` | `app/docs/[...slug]/page.tsx` | `.site-doc-page-grid`, `article.site-doc-article`, `.site-doc-header h1`, `.site-doc-prose` |

Source proof came from `content-cache/generated/pages-manifest.json`; all five routes are published and share the same docs route template.

### 2.2 Field LCP image assets

Cloudflare screenshots 指向的 LCP image assets：

| Field image label | Public asset | Rendered page likely impacted | Source markdown reference | Current asset geometry / bytes | DOM selector |
|---|---|---|---|---:|---|
| `home-assistant/control-loop` | `/content-assets/solution-practical-10-home-assistant-control-loop-v1.webp` | `/docs/start/practical/home-assistant` | `docs/01-从这开始/05-实战应用/10-Home Assistant 智能家居.md:5` | `1360x765`, `39,036 bytes` in site public copy | `.site-doc-prose figure > img[src$="solution-practical-10-home-assistant-control-loop-v1.webp"]` |
| `rm2 holographic` | `/content-assets/rm2-5-memory-providers-02-holographic-first-route.webp` | `/docs/start/build/memory-providers/holographic` | `docs/01-从这开始/04-自己造东西/03-接入外部记忆系统/02-Holographic记忆.md:6` | `2752x1536`, `126,362 bytes` | `.site-doc-prose figure > img[src$="rm2-5-memory-providers-02-holographic-first-route.webp"]` |
| `tencent-buy-hermes-agent` | `/content-assets/tencent-buy-hermes-agent.webp` | `/docs/china/deploy/tencent-lite-server` | `docs/03-国内落地/01-国内部署/03-腾讯云轻量服务器部署教程.md:3` | `1239x1280`, `100,362 bytes` | `.site-doc-prose figure > img[src$="tencent-buy-hermes-agent.webp"]` |

Important implementation detail: `components/docs/markdown-body.tsx` renders **all markdown images** through raw `<img>` inside `<figure>` with default `loading="lazy"`, `fetchPriority="auto"`, `decoding="async"`, and no intrinsic `width/height`, except the special `/docs/start` learning-path image.

## 3. Root-cause hypotheses

### 3.1 CLS cluster: shared docs template geometry, not five independent content bugs

Strongest hypothesis: Cloudflare field CLS pages are a **shared docs template initial geometry issue** across `app/docs/[...slug]/page.tsx` rather than separate article/grid/footer defects.

Evidence:

1. All five URLs use the same static docs route template:
   - outer grid: `div.site-doc-page-grid ... xl:grid-cols-[280px_minmax(0,1fr)_250px]`
   - article: `article.site-panel-docs.site-doc-article`
   - article header: `.site-doc-header h1` + `[data-ai-summary="true"]`
   - markdown body: `.site-doc-prose`
   - rails: `DocSidebar` and `DocOutline`
2. `/docs/start` is the only route with route-scoped hard stabilizer:
   - `data-doc-desktop-cls-stabilizer="start"`
   - grid/main/header/article min-height/containment rules in `app/layout.tsx` and `app/globals.css`
   - R24 proves this is enough for Lighthouse hard gate on `/docs/start`.
3. The other Cloudflare CLS pages (`docs-overview`, `solutions/xiaohongshu`, `solutions`, `china/entry/feishu`) do **not** get the `/docs/start` stabilizer. They retain generic `.site-doc-page-grid { contain: layout }` and `.site-doc-header h1 { content-visibility:auto; contain-intrinsic-size:40px 100%; }` behavior.
4. Therefore field sample count=1 likely catches long-tail geometry variance from the generic docs template: font/application timing, header/rail first layout, markdown body height discovery, and content-visibility/intrinsic-size approximation.

Classification against requested categories:

| Candidate | Likelihood | Reason |
|---|---:|---|
| docs template initial geometry problem | **High** | Same route template + multiple docs pages + only `/docs/start` has hard stabilizer |
| article/grid column issue | Medium | Grid uses three columns and rails; initial width/height of article/rails can move content, but appears as part of template geometry |
| footer pushed by late content | Low/Medium | Possible if markdown images or long article lazy geometry pushes below-fold footer, but Cloudflare listed top-level docs URLs are more consistent with first-screen docs template than footer-only movement |
| per-page content issue | Low | Five pages from different modules share same renderer; not enough evidence for independent content bugs |

### 3.2 `/docs/start` special case: hard gate already fixed, field signal can be stale/long-tail

`/docs/start` appears in Cloudflare field CLS list, but R24 proves current canonical hard Lighthouse gate is PASS after Cloudflare purge and CSS materialization. Treat Cloudflare field signal as one of:

- stale field collection window before/around R24 propagation;
- sample count=1 exploratory long-tail;
- different device/network percentile not represented by R24 hard desktop lab gate.

Do **not** re-open `/docs/start` as failed unless fresh multi-sample evidence reproduces it after R24 canonical state.

### 3.3 LCP image cluster: markdown image asset issue + missing image-specific priority/geometry

Strongest hypothesis: field LCP image URLs are **asset/rendering issues in markdown image pipeline**, not homepage hero or generic docs article text LCP.

Evidence:

1. All three field LCP images are markdown images rendered by `components/docs/markdown-body.tsx`.
2. Generic markdown images do not specify intrinsic `width`/`height`; this creates both LCP render-delay risk and possible downstream layout reservation issues.
3. Generic markdown images use `loading="lazy"`, `fetchPriority="auto"`, `decoding="async"`; if an image is above the fold on an article page, it can become LCP but still be discovered/prioritized late.
4. Two assets are screenshot/diagram style and relatively large in dimensions:
   - holographic: `2752x1536`, `126KB`
   - tencent first screenshot: `1239x1280`, `100KB`
   - home assistant: `1360x765`, `39KB` but likely first visual block after page title.
5. `/docs/start` already has a one-off image LCP stoploss for `rm2-learning-path-gemini-final-v2.webp`: preload + eager/high/sync + intrinsic dimensions + replacement LCP derivative. The three Cloudflare image assets do **not** have equivalent route/asset-scoped treatment.

Classification:

| Candidate | Likelihood | Reason |
|---|---:|---|
| image LCP asset issue | **High** | Field explicitly lists image resources; generic markdown image renderer is lazy/auto/no dimensions |
| docs template initial geometry | Medium | Header/rails can delay image discovery/paint, but image pipeline is the direct LCP hotspot |
| footer pushed by late content | Low for LCP | Not a primary LCP mechanism |

## 4. Minimal fix package ranking（next task, not executed here）

### P0 — Preserve R24 hard gates before any change

- Re-run `/` and `/docs/start` desktop Lighthouse 5 samples before and after any patch.
- Keep `/docs/start` route-scoped stabilizer and R23/R24 H1 materialization untouched unless a fresh gate explicitly targets it.

### P1 — Generalize docs first-screen geometry stoploss narrowly

Goal: cover Cloudflare field CLS pages without destabilizing R24.

Minimal candidate:

1. Add a route/class/data hook for docs pages that share the generic template, e.g. `data-doc-template-stabilizer="generic"` or route-list scoped to:
   - `/docs-overview`
   - `/solutions`
   - `/solutions/xiaohongshu`
   - `/china/entry/feishu`
2. In both inline critical CSS (`app/layout.tsx`) and full CSS (`app/globals.css`), reserve first-screen geometry:
   - `.site-doc-page-grid` desktop min-height/containment
   - `article.site-doc-article` min-height/containment
   - `.site-doc-header h1` `content-visibility:visible` + explicit line box/min-height
   - `[data-ai-summary="true"]` line-height/margins
3. Avoid broad global docs rewrite; route-scoped first to protect R24.

### P2 — Markdown first-image LCP treatment for field assets

Goal: improve LCP image discovery/priority only where field data points.

Minimal candidate:

1. In `MarkdownBody`, detect the three exact resolved asset endings:
   - `solution-practical-10-home-assistant-control-loop-v1.webp`
   - `rm2-5-memory-providers-02-holographic-first-route.webp`
   - `tencent-buy-hermes-agent.webp`
2. For only those route+asset pairs:
   - add `loading="eager"`
   - `fetchPriority="high"`
   - `decoding="sync"`
   - intrinsic `width`/`height`
   - route-level `<link rel="preload" as="image">` if first-screen confirmed
3. Consider smaller LCP derivatives only if fresh lab/trace shows network/load time dominates rather than render delay.

### P3 — Asset derivative optimization

Only after P2 proof:

- `rm2-5-memory-providers-02-holographic-first-route.webp`: likely best candidate for a committed smaller derivative (current public copy `2752x1536`, `126KB`).
- `tencent-buy-hermes-agent.webp`: evaluate crop/resize because tall screenshot may dominate first viewport.
- `home-assistant/control-loop`: size already moderate (`39KB`); prioritize intrinsic dims/eager before recompressing.

## 5. Non-goals / do-not-touch list

- Do not modify code, content, CSS, assets, deployments, DNS, Cloudflare cache, Vercel settings in this RCA task.
- Do not regress R24 `/` and `/docs/start` hard-gate PASS.
- Do not treat Cloudflare field sample count=1 as a hard gate failure.
- Do not globally eager-load all markdown images.
- Do not redesign docs IA/sidebar/footer or change content SSoT.
- Do not remove GA4, Cloudflare beacon, `nav_start_click`, SEO/JSON-LD, sticky header/sidebar behaviors.

## 6. Acceptance probes for next implementation task

Recommended proof probes:

1. **No-diff baseline before patch**
   - `git status --short`
   - record existing unrelated dirty files separately.
2. **Route DOM probes** on `/docs/docs-overview`, `/docs/solutions`, `/docs/solutions/xiaohongshu`, `/docs/china/entry/feishu`, `/docs/start`:
   - selector presence: `.site-doc-page-grid`, `article.site-doc-article`, `.site-doc-header h1`, `.site-doc-prose`
   - computed: `contentVisibility`, `containIntrinsicSize`, `minHeight`, `lineHeight`, article/grid bounding rect before/after settled
   - horizontal overflow: `document.documentElement.scrollWidth <= clientWidth`
3. **CLS observer probe**
   - inject pre-navigation `PerformanceObserver` for `layout-shift`
   - capture `startTime`, `value`, `sources[].node`, `previousRect`, `currentRect`
4. **LCP observer probe** for three image routes:
   - verify LCP element `img[src$=...]`
   - record `currentSrc`, `naturalWidth/Height`, `loading`, `fetchPriority`, `decoding`, bounding rect, request priority if trace available
5. **Hard gate regression**
   - `/` desktop Lighthouse 5 samples CLS `<0.1`
   - `/docs/start` desktop Lighthouse 5 samples CLS `<0.1`
6. **Field-follow-up**
   - Cloudflare field data should be monitored over a window; do not expect same-day single sample to clear immediately.

## 7. Verification performed in this RCA

Commands/tools executed read-only except writing this proof artifact:

- Read governance: `FILE_INDEX.md`, `PRD.md`, `SSD.md`, `V3_PROJECT_RULES.md` from dispatch context, implementation plan.
- Read R24 proof report and extracted PASS baseline.
- Inspected docs template/source:
  - `app/docs/[...slug]/page.tsx`
  - `components/docs/markdown-body.tsx`
  - `app/layout.tsx`
  - `app/globals.css`
  - `content-cache/generated/pages-manifest.json`
- Inspected content source mappings in `/opt/projects/awesome-hermes-agent-zh`.
- Inspected public asset dimensions/bytes with PIL.
- Checked repo state: existing unrelated dirty worktree found before this task; this task only added artifact directory/report.

## 8. Blocking points

No execution blocker for RCA. Constraints/limits:

1. User provided Cloudflare screenshots as field input, but not raw Cloudflare JSON/trace; sample count is explicitly treated as exploratory.
2. Existing working tree already had unrelated modified/untracked files before R25; no source-code no-diff can be asserted globally, only that R25 did not intentionally alter source and wrote artifact proof.
3. No live Lighthouse/Cloudflare API re-measurement was required or performed; this was a source/template/asset mapping RCA.
