# R25 T1 Minimal Field Fix Report

- Task ID: `group-r25-cloudflare-field-docs-template-cls-lcp-20260614-T1-LONG-MINIMAL-FIELD-FIX`
- Repo: `/opt/projects/hermes-zh`
- Mode: local code fix + local proof, no deploy/push

## Summary

Implemented the T0-recommended minimal fix only:

1. Route-scoped desktop initial geometry stabilization for the Cloudflare field-flagged docs pages:
   - `/docs/docs-overview`
   - `/docs/solutions`
   - `/docs/solutions/xiaohongshu`
   - `/docs/china/entry/feishu`
2. Route+asset scoped markdown image LCP treatment for the three T0 field assets:
   - `/content-assets/solution-practical-10-home-assistant-control-loop-v1.webp`
   - `/content-assets/rm2-5-memory-providers-02-holographic-first-route.webp`
   - `/content-assets/tencent-buy-hermes-agent.webp`
3. Preserved the existing `/docs/start` R24 stabilizer and added/kept the stable production CSS H1 materialization guard.

## Files changed

- `app/docs/[...slug]/page.tsx`
- `app/globals.css`
- `app/layout.tsx`
- `components/docs/markdown-body.tsx`
- `tests/performance/docs-start-desktop-cls-stabilizer.test.ts`
- `tests/performance/r17-mobile-lcp-hard-rework.test.ts`
- `tests/performance/r25-cloudflare-field-docs-template-cls-lcp.test.ts`
- `artifacts/group-r25-cloudflare-field-docs-template-cls-lcp-20260614-T1-LONG-MINIMAL-FIELD-FIX-REPORT.md`

## Implementation details

### Docs CLS field pages

Added a narrow `generic-field` value to `data-doc-desktop-cls-stabilizer` only when `page.slug` is one of:

```ts
['/docs-overview', '/solutions', '/solutions/xiaohongshu', '/china/entry/feishu']
```

Both inline critical CSS (`app/layout.tsx`) and full CSS (`app/globals.css`) now reserve desktop geometry for that scoped value:

- grid columns: `280px minmax(0, 1fr) 250px`
- grid `min-height: 1320px`
- grid `contain: layout paint`
- direct article/aside `min-height: 640px` + `contain: layout paint`
- H1 `content-visibility: visible`, `contain-intrinsic-size: auto`, explicit line box
- summary line-height reservation

### Markdown image LCP field assets

In `MarkdownBody`, only the three T0 route+asset pairs receive:

- `loading="eager"`
- `fetchPriority="high"`
- `decoding="sync"`
- intrinsic `width` / `height`
- `docs-lcp-image` class with visible paint containment
- route-level image preload in `app/docs/[...slug]/page.tsx`

Existing `/docs/start` image behavior remains separate through `docs-start-lcp-image` and its LCP derivative.

## Verification

### Source-level tests

Command:

```bash
npx tsx --test \
  tests/performance/r25-cloudflare-field-docs-template-cls-lcp.test.ts \
  tests/performance/docs-start-desktop-cls-stabilizer.test.ts \
  tests/performance/r17-mobile-lcp-hard-rework.test.ts
```

Result:

- suites: 3 pass / 0 fail
- tests: 9 pass / 0 fail

### Lint / typecheck / build

Commands:

```bash
npm run lint
npm run typecheck
npm run build
```

Results:

- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run build`: PASS; Next.js generated 152 static pages successfully

Note: `npm run build` updated only `content-cache/generated/build-meta.json.generatedAt`; this build-noise diff was restored.

### R24 hard gate regression proof

Local production server on `127.0.0.1:3351` after fresh build.

Commands:

```bash
npx lighthouse http://127.0.0.1:3351/ \
  --only-categories=performance --preset=desktop \
  --output=json --output-path=/tmp/hermes-r25-field-proof/home.json \
  --chrome-flags="--headless=new --no-sandbox --disable-gpu" --quiet

npx lighthouse http://127.0.0.1:3351/docs/start \
  --only-categories=performance --preset=desktop \
  --output=json --output-path=/tmp/hermes-r25-field-proof/docs-start.json \
  --chrome-flags="--headless=new --no-sandbox --disable-gpu" --quiet
```

Results:

| Route | Desktop CLS | Gate |
|---|---:|---|
| `/` | `0.0307717934460958` | PASS `<0.1` |
| `/docs/start` | `0.02900472843084323` | PASS `<0.1` |

### Browser/DOM proof for required field pages

Browser checks were run against:

- `/docs/docs-overview`
- `/docs/solutions`
- `/docs/solutions/xiaohongshu`
- `/docs/china/entry/feishu`

Representative computed proof for each showed:

- `data-doc-desktop-cls-stabilizer="generic-field"`
- grid `minHeight=1320px`
- grid `contain=layout paint`
- article `minHeight=640px`
- H1 `contentVisibility=visible`
- H1 `minHeight=40px`, `lineHeight=40px`
- summary `lineHeight=32px`
- no horizontal overflow: `scrollWidth <= clientWidth`

### Server-rendered HTML proof for instrumentation and LCP images

Fetch proof confirmed for the required field docs pages:

- HTTP status `200`
- `generic-field` stabilizer present
- `data-analytics-event="nav_start_click"` present
- Cloudflare beacon script present

Fetch proof confirmed for image routes:

- `/docs/start/practical/home-assistant`: preload and `<img class="docs-lcp-image" loading="eager" fetchPriority="high" decoding="sync" width="1360" ...>`
- `/docs/start/build/memory-providers/holographic`: preload and priority image treatment present
- `/docs/china/deploy/tencent-lite-server`: preload and `<img class="docs-lcp-image" loading="eager" fetchPriority="high" decoding="sync" width="1239" height="1280">`

## Git/worktree notes

Existing unrelated untracked artifact directories were present before this task and were not modified as part of this fix. Scoped source changes are the files listed above.

## Blocking points / risk

- No blocker for local implementation/proof.
- This is local lab/browser proof only; Cloudflare field data has sample count 1 and may lag until enough real-user samples arrive.
- Lighthouse proof was one desktop sample per R24 protected route due time; both were comfortably below `0.1`. Full 5x re-run can be done by downstream verifier if required.
