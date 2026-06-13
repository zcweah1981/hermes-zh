# R12 T1 Hyoga Deploy Verify Desktop CLS Only

## 操作
- 从 Dispatch Runtime / SQLite 确认同组上游任务状态：Long T0 已完成，目标提交为 `ff37c345333ee9f4a08159cf43c98c5562ecc8f6`。
- 检查主仓 `/opt/projects/hermes-zh`：`main` 领先 `origin/main` 5 个提交，且存在未跟踪噪音；为满足 clean worktree 部署要求，创建 detached clean worktree：`/tmp/hermes-zh-r12-prod-1781354445`。
- 在 clean worktree 内执行 `npm ci`、`npm run build`，随后恢复 `content-cache/generated/build-meta.json`，确保部署前工作树回到 clean 状态。
- 使用 Vercel CLI 生产部署，并显式设置：
  - `VERCEL_PROJECT_ID=prj_lo8U1vHY8wWWArTMdzxLvQXw0jFE`
  - `VERCEL_ORG_ID=team_9ECNkQmqAm2b6a8uD9G4excp`
- 用 Vercel API 校验最新 production deployment 的 `meta.gitCommitSha`。
- 对 `https://hermes-zh.com/` 执行 Lighthouse CLI：
  - desktop JSON + HTML
  - mobile JSON + HTML（仅记录，不作为阻断）
- 通过 PSI browser 采集 desktop 报告页面证据，显式区分 field/CrUX 与 lab/Lighthouse。

## 状态
- 任务状态：已完成执行与取证。
- 部署状态：PASS。
- Desktop CLS 目标状态：FAIL（field 绿，但 lab CLS 未回绿）。
- Mobile：仅记录，不纳入本组阻断判断。

## 结果
### 1. Clean worktree / production commit 证明
- Clean worktree：`/tmp/hermes-zh-r12-prod-1781354445`
- Clean deploy SHA：`ff37c345333ee9f4a08159cf43c98c5562ecc8f6`
- Vercel deployment id：`dpl_CWnr5FHU9PJZCG37MLrC4Zu1xrFm`
- Deployment URL：`https://hermeszh-iq1tujbtj-pascalteam.vercel.app`
- Inspect URL：`https://vercel.com/pascalteam/hermeszh/CWnr5FHU9PJZCG37MLrC4Zu1xrFm`
- Vercel API 校验：latest production `meta.gitCommitSha = ff37c345333ee9f4a08159cf43c98c5562ecc8f6`，与 Long T0 commit 完全一致。

### 2. Lighthouse CLI 证据
产物：
- `/root/.hermes/projects/hermes-zh/artifacts/r12-desktop-cls-verify-20260613/lighthouse-desktop-home.report.json`
- `/root/.hermes/projects/hermes-zh/artifacts/r12-desktop-cls-verify-20260613/lighthouse-desktop-home.report.html`
- `/root/.hermes/projects/hermes-zh/artifacts/r12-desktop-cls-verify-20260613/lighthouse-mobile-home.report.json`
- `/root/.hermes/projects/hermes-zh/artifacts/r12-desktop-cls-verify-20260613/lighthouse-mobile-home.report.html`

Desktop Lighthouse (`https://hermes-zh.com/`)：
- Performance: `87`
- FCP: `0.852s`
- LCP: `1.230s`
- TBT: `244.806ms`
- CLS: `0`
- Speed Index: `1.232s`
- `layout-shifts.details.items.length = 0`
- `cls-culprits-insight.details.items.length = 0`

Mobile Lighthouse（记录-only）：
- Performance: `58`
- FCP: `3.621s`
- LCP: `4.779s`
- TBT: `665.684ms`
- CLS: `0`
- Speed Index: `3.621s`
- `layout-shifts.details.items.length = 0`
- `cls-culprits-insight.details.items.length = 0`

### 3. PSI browser proof（Desktop）
PSI report URL：
- `https://pagespeed.web.dev/analysis/https-hermes-zh-com/fw25jdzrx0?form_factor=desktop`

PSI browser screenshot：
- `/root/.hermes/profiles/ops/cache/screenshots/browser_screenshot_e42945ef56cc46749fd1bb014aac7c70.png`

Desktop field / CrUX：
- Core Web Vitals Assessment: `Passed`
- LCP: `2.3 s`
- INP: `44 ms`
- CLS: `0.02`
- FCP: `2.4 s`
- TTFB: `1.4 s`

Desktop lab / Lighthouse（PSI 页面内）：
- Performance: `81`
- FCP: `0.6 s`
- LCP: `0.7 s`
- TBT: `0 ms`
- CLS: `0.409`
- Speed Index: `0.7 s`

## 验证结果
### 验收项 1
- 要求：Clean worktree 部署，production commit 必须等于 Long T0 commit。
- 结果：PASS。
- 证据：clean worktree 部署 + Vercel API `meta.gitCommitSha = ff37c345333ee9f4a08159cf43c98c5562ecc8f6`。

### 验收项 2
- 要求：复测 desktop 首页 PSI/Lighthouse；核心 PASS 是 lab CLS < 0.1，理想 < 0.01；同时记录 FCP/LCP/TBT 不明显劣化。
- Lighthouse CLI：PASS。
  - desktop lab CLS `0`
  - FCP/LCP/TBT 分别为 `0.852s / 1.230s / 244.806ms`
- PSI desktop field：PASS。
  - field CLS `0.02`
- PSI desktop lab：FAIL。
  - lab CLS `0.409`
- 边界结论：本任务按“desktop PSI/Lighthouse 的核心 PASS 是 lab CLS < 0.1”口径，不能宣告整体 PASS；因为 fresh PSI desktop lab CLS 仍为 `0.409`。

### 验收项 3
- 要求：Mobile 只记录数据，不作为本组阻断；不得混入 mobile/docs 修复判断。
- 结果：PASS。
- 处理：已记录 mobile Lighthouse 数据，但未将其纳入结论阻断。

### 验收项 4
- 要求：输出 deployment/inspect URL、Lighthouse JSON/HTML、PSI browser proof、PASS/FAIL 边界。
- 结果：PASS。
- 证据：本文件已完整列出 deployment URL、inspect URL、Lighthouse JSON/HTML 路径、PSI report URL、browser screenshot 路径与 PASS/FAIL 边界。

## 阻塞点
- 无部署阻塞。
- 当前唯一阻塞为验收事实本身：`fresh PSI desktop lab CLS = 0.409`，未达到 `< 0.1`。

## 风险
- 存在典型“field green / local Lighthouse green / PSI lab 仍红”分裂：
  - field CLS 已绿 (`0.02`)
  - local Lighthouse desktop CLS 已绿 (`0`)
  - 官方 PSI desktop lab 仍为 `0.409`
- 因此不能把 Vercel deploy PASS 或 local Lighthouse PASS 误报成“Desktop CLS 已整体回绿”。

## 建议动作
1. PM/Reviewer 应将本轮判定为：
   - `部署验证 PASS`
   - `Desktop PSI lab CLS 回绿 FAIL / NO OVERALL PASS`
2. 下一步只允许继续做 desktop PSI lab `0.409` 的 source-node / trace 级归因，不要混入 mobile/docs 范围。
3. 优先复查 PSI `Layout shift culprits` 对应的 live source node，确认为什么 local Lighthouse 已为 0，但 PSI lab 仍保持 0.409。