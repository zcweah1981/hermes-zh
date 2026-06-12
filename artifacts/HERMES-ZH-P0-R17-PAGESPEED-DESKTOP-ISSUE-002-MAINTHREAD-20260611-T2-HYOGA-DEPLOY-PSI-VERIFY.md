# HERMES-ZH-P0-R17-PAGESPEED-DESKTOP-ISSUE-002-MAINTHREAD-20260611-T2-HYOGA-DEPLOY-PSI-VERIFY

## 操作
- 核对 dispatch / runtime / T1 交付，确认上游任务 `HERMES-ZH-P0-R17-PAGESPEED-DESKTOP-ISSUE-002-MAINTHREAD-20260611-T1-LONG-FIX-MAINTHREAD-ISSUE-0021-ONLY` 已完成，且 repo 当前未提交 diff 与 T1 证明一致。
- 在干净 worktree `/opt/projects/hermes-zh/.hermes-tmp/r17-issue0021-deploy-20260612002356` 仅应用批准范围内的 R17 Issue #2.1 改动：
  - `app/(marketing)/page.tsx`
  - `tests/marketing/homepage-structure.test.ts`
  - `tests/performance/pagespeed-minimal-fix.test.ts`
  - `tests/performance/homepage-static-capability-connectors.test.ts`
  - 删除 `components/marketing/capability-connectors.tsx`
  - 删除 `components/marketing/lazy-capability-connectors.tsx`
- 在该 worktree 重新执行验证：
  - `npm run test:perf -- --test-name-pattern='homepage|pagespeed'`
  - `npx tsx --test tests/marketing/homepage-structure.test.ts tests/performance/pagespeed-minimal-fix.test.ts tests/performance/homepage-static-capability-connectors.test.ts`
  - `npm run build`
- 生成并推送批准 commit：
  - branch: `deploy/r17-issue0021-approved`
  - commit: `c0e20b91163461bc58999f02f4416a83b853dcd2`
  - message: `fix(perf): remove homepage connector client runtime`
- 执行生产部署：
  - deploy id: `dpl_27i1ytijhfu3bDqUqEZVdfVe3DrX`
  - production url: `https://hermeszh-17719fzdj-pascalteam.vercel.app`
  - canonical alias: `https://hermes-zh.com`
- 对生产域名执行 route/header/HTML/visual/PSI 复核。

## 状态
### 1. 上游依赖 / 批准边界
- T1 task status: `completed`
- T1 reviewed scope: 仅修 homepage capability connector client boundary；不碰 CLS / Cloudflare / legacy-js / fonts / payload / external stylesheet。
- 本次部署 commit 仅包含上述 Issue #2.1 变更，没有混入其他 repo 改动。

### 2. 生产部署身份
- Vercel latest production deploy id: `dpl_27i1ytijhfu3bDqUqEZVdfVe3DrX`
- `readyState`: `READY`
- `readySubstate`: `PROMOTED`
- `gitCommitSha`: `c0e20b91163461bc58999f02f4416a83b853dcd2`
- `gitCommitMessage`: `fix(perf): remove homepage connector client runtime`
- `gitCommitRef`: `deploy/r17-issue0021-20260612002356`
- 结论：**生产已切到本次批准 SHA**。

### 3. 关键路由 / marker / HTML proof
| Route | HTTP | CF Cache | Vercel Cache | 结果 |
|---|---:|---|---|---|
| `/` | 200 | `EXPIRED` | `PRERENDER` | `G-N2Q0TXQDRZ` / `ga4-idle-loader` / `nav_start_click` 均存在；无 external stylesheet |
| `/docs/start` | 200 | `EXPIRED` | `PRERENDER` | docs shell 正常；`/content-assets/` 命中 2；无 `/api/assets/raw` leak |
| `/docs/solutions` | 200 | `HIT` | `HIT` | marker 正常 |
| `/llms.txt` | 200 | `HIT` | `MISS` | 文本路由健康 |

Homepage 关键 HTML 检查：
- `https://static.cloudflareinsights.com/beacon.min.js`: present
- `/cdn-cgi/rum/beacon.min.js`: absent
- `data-connector-layer="static-svg"`: present
- `LazyCapabilityConnectorLayer` / `lazy-capability-connectors`: absent
- external stylesheet links: none detected

### 4. 视觉 smoke
- Homepage screenshot: `/root/.hermes/profiles/ops/cache/screenshots/browser_screenshot_29215263d480457ab97e2e8f100a77ce.png`
  - 结论：hero / cards / infographic connector area / footer 正常，无明显 CSS/layout break。
- `/docs/start` screenshot: `/root/.hermes/profiles/ops/cache/screenshots/browser_screenshot_301ae64c5b1d431f9e000523879954d2.png`
  - 结论：sidebar / heading / article / docs shell 正常，无明显 CSS/layout break。

### 5. Fresh PSI 证据
Report family:
- report timestamp: `Jun 12, 2026, 12:29:56 AM`
- desktop report URL: `https://pagespeed.web.dev/analysis/https-hermes-zh-com/o86o0ffyje?form_factor=desktop`
- mobile report URL: `https://pagespeed.web.dev/analysis/https-hermes-zh-com/o86o0ffyje?form_factor=mobile`
- desktop PSI screenshot: `/root/.hermes/profiles/ops/cache/screenshots/browser_screenshot_341aba603a894f72ae5387dd3d64bbfc.png`

#### Desktop PSI
Field / URL data visible in PSI:
- score: `81`
- CWV assessment: `Passed`
- FCP: `2.3 s`
- LCP: `2.3 s`
- INP: `41 ms`
- CLS: `0.02`
- TTFB: `1.4 s`

Lab panel visible in PSI:
- FCP: `0.6 s`
- LCP: `0.7 s`
- TBT: `20 ms`
- CLS: `0.4`
- Speed Index: `0.7 s`
- Captured at: `Jun 12, 2026, 12:30 AM GMT+8`

Top visible failing insights / diagnostics:
- `Layout shift culprits`
- `Forced reflow`
- `Network dependency tree`
- `Use efficient cache lifetimes` (est savings `5 KiB`)
- `Legacy JavaScript` (est savings `12 KiB`)
- `Optimize DOM size`
- `LCP breakdown`
- `3rd parties`
- diagnostics: `Avoid long main-thread tasks — 3 long tasks found`

#### Mobile PSI
- score: `97`
- FCP: `0.9 s`
- LCP: `1.7 s`
- TBT: `180 ms`
- CLS: `0.001`
- Speed Index: `1.1 s`
- field data: `No Data`
- Captured at: `Jun 12, 2026, 12:30 AM GMT+8`

Top visible failing insights / diagnostics:
- `Forced reflow`
- `Network dependency tree`
- `Use efficient cache lifetimes` (est savings `5 KiB`)
- `Legacy JavaScript` (est savings `12 KiB`)
- `Layout shift culprits`
- `Optimize DOM size`
- `LCP breakdown`
- `3rd parties`
- diagnostics: `Avoid long main-thread tasks — 3 long tasks found`

## 结果
- **Deploy approved commit**: PASS
- **Production SHA proof**: PASS (`c0e20b91163461bc58999f02f4416a83b853dcd2` live)
- **Critical routes / markers / no external stylesheet / visual smoke**: PASS
- **Desktop target >= 90**: **FAIL**
  - fresh desktop PSI remains `81`
  - therefore **no overall pass** for desktop closure
- **Mobile non-regression**: PASS
  - fresh mobile PSI `97`
  - no material regression vs recent 90+ UI baseline
- **Issue #2.1 deployment effect**: PARTIAL PASS
  - live homepage now serves static connector contract and removes homepage-specific connector client runtime
  - but desktop PSI overall score did not rise above the `81` acceptance threshold

## 风险
- Desktop PSI still blocked by non-Issue-2.1 factors, especially visible `CLS` / layout-shift and remaining render/main-thread related diagnostics.
- 本次属于“批准修复已上线，但整体 desktop PageSpeed closure 未达标”。不能把部署完成误报为整体验收通过。
- Vercel deployment metadata contains `gitDirty: 1`; although deployed commit SHA and diff scope are verified, this reflects CLI deployment context and应在后续保持最小化部署输入面更严谨。

## 建议动作
1. 将本卡判定为：**deploy + verification complete, but no overall desktop pass**。
2. 下一轮应继续按 desktop top audits 精确拆 issue，而不是 broad rewrite；优先聚焦：
   - `Layout shift culprits` / desktop CLS `0.4`
   - `Forced reflow`
   - `Network dependency tree`
   - `Avoid long main-thread tasks`
3. PM/Reviewer 在组级验收中应明确记录：R17 Issue #2.1 只证明单变量上线与局部 runtime boundary 收敛，不证明 desktop PSI 已过 90。
