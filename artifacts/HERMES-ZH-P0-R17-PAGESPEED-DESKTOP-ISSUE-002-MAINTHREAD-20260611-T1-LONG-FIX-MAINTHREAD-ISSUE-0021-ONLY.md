# HERMES-ZH-P0-R17 Issue #2.1 main-thread 单变量修复证明

## 范围
- 只处理 T0 选定 main-thread Issue #2.1：homepage capability infographic connector client boundary。
- 不处理 CLS / Cloudflare / legacy-js / fonts / payload / external stylesheet。
- 不执行 GitHub push。

## 改动
- `app/(marketing)/page.tsx`
  - 移除 `LazyCapabilityConnectorLayer` import/render。
  - 用同一位置的 static inline SVG connector layer 保留 6 条连线与 6 个 dot anchor。
- 删除 homepage 专用运行时测量组件：
  - `components/marketing/capability-connectors.tsx`
  - `components/marketing/lazy-capability-connectors.tsx`
- 更新契约测试：
  - `tests/performance/homepage-static-capability-connectors.test.ts` 新增 fail-first Issue #2.1 守卫。
  - `tests/performance/pagespeed-minimal-fix.test.ts` 改为断言 static-svg + GA4/SEO 保持。
  - `tests/marketing/homepage-structure.test.ts` 改为断言 static connector contract。

## RED proof
在 clean worktree HEAD(c80c977) 注入新测试后运行：

```bash
npx tsx --test tests/performance/homepage-static-capability-connectors.test.ts
```

结果：FAIL 2/2，失败点：
- homepage 仍 import/render `LazyCapabilityConnectorLayer` / `lazy-capability-connectors`
- obsolete connector modules still exist

## GREEN / verification
- `npx tsx --test tests/performance/homepage-static-capability-connectors.test.ts` -> PASS 2/2
- `npm run test:perf` -> PASS 46/46
- `npm run typecheck` -> PASS
- `npm run lint` -> PASS
- `npx tsx --test tests/marketing/homepage-structure.test.ts tests/performance/pagespeed-minimal-fix.test.ts tests/performance/homepage-static-capability-connectors.test.ts` -> PASS 15/15
- `npm test` -> PASS 146/146
- `npm run build` -> PASS
  - `/` route: 164 B / 106 kB First Load JS
  - Shared First Load JS: 102 kB
- `npm run smoke` -> PASS
  - `/`, `/docs/start`, `/search`, `/packs/miniapp-lab`, `/sitemap.xml`, `/robots.txt` all 200
- `git diff --check` -> PASS

## Lighthouse-equivalent before/after
After artifact: `.hermes-tmp/issue-0021-mainthread/after-desktop-live.json`

Baseline used for same repo previous deployed proof: `.hermes-tmp/r16-lighthouse-postpurge/desktop.json`

| Metric | Before R16 postpurge desktop | After local desktop |
|---|---:|---:|
| Performance score | 96 | 96 |
| FCP | 686 ms | 701 ms |
| LCP | 926 ms | 1141 ms |
| Speed Index | 1231 ms | 1178 ms |
| TBT | 121 ms | 83 ms |
| TTI | 1023 ms | 1141 ms |
| Main-thread work | 1596 ms | 1526 ms |
| Bootup time | 404 ms | 410 ms |
| Long tasks | 3 | 2 |
| Diagnostics numTasks | 587 | 469 |

Interpretation: the single-variable fix removes the homepage connector runtime measurement/hydration path; local Lighthouse shows reduced main-thread work, TBT, long tasks, and total tasks. This is not a production PSI proof because this task did not deploy.

## Guarded invariants
- GA4 preserved: `ga4-idle-loader`, `GA_MEASUREMENT_ID` / `G-N2Q0TXQDRZ` source markers still covered by tests.
- Header analytics preserved: `nav_start_click` marker still covered by tests.
- No external stylesheet link introduced; no font / Cloudflare / legacy-js changes made.
- Connector visual contract preserved via `site-capability-connectors`, `data-connector-layer="static-svg"`, six `data-connector-line`, six `data-connector-dot`, existing `data-connector-node` anchors.

## Notes
- `npm run build` regenerated `content-cache/generated/*`; reverted generated drift after build proof to keep final diff scoped.
- Background Next server on port 3100 was stopped after Lighthouse verification.
