# R13 T1 Clean 部署并复测首页与 /docs/start Mobile LCP

- Task ID: `group-r13-mobile-lcp-two-pages-single-issue-20260614-T1-HYOGA-CLEAN-DEPLOY-VERIFY-MOBILE-LCP`
- Project: `hermes-zh`
- Executor: `hyoga-ops-1`
- Time: `2026-06-14`

## 上游输入确认
- Dispatch SQLite 读取的上游 Long T0 任务：`group-r13-mobile-lcp-two-pages-single-issue-20260614-T0-LONG-RCA-FIX-MOBILE-LCP-ONLY`
- T0 状态：`completed`
- T0 commit：`aaa6b38fac7e787e82537a0b667417aab2dbb91e`

## Clean worktree 部署证明
- Dirty 主工作树：`/opt/projects/hermes-zh` 含未跟踪文件，未直接发版
- Clean detached worktree：`/tmp/hermes-zh-r13-clean-deploy-aaa6b38fac7e787e82537a0b667417aab2dbb91e-1781372602`
- Detached HEAD：`aaa6b38fac7e787e82537a0b667417aab2dbb91e`

## Vercel 生产部署证明
- Deployment ID: `dpl_Hz8Z14EHNpCJRZa2PADxQSi8BVNa`
- Inspect URL: `https://vercel.com/pascalteam/hermeszh/Hz8Z14EHNpCJRZa2PADxQSi8BVNa`
- Production URL: `https://hermeszh-qc0e3gor5-pascalteam.vercel.app`
- Alias: `https://hermes-zh.com`
- readyState: `READY`
- target: `production`
- Vercel API `meta.gitCommitSha`: `aaa6b38fac7e787e82537a0b667417aab2dbb91e`
- 结论：生产部署 commit 与 Long T0 commit 一致：`PASS`

## Fresh Lighthouse mobile 原始证据
- `/root/.hermes/projects/hermes-zh/artifacts/r13-mobile-lcp-verify-20260614/lighthouse-mobile-home.report.json`
- `/root/.hermes/projects/hermes-zh/artifacts/r13-mobile-lcp-verify-20260614/lighthouse-mobile-home.report.html`
- `/root/.hermes/projects/hermes-zh/artifacts/r13-mobile-lcp-verify-20260614/lighthouse-mobile-docs-start.report.json`
- `/root/.hermes/projects/hermes-zh/artifacts/r13-mobile-lcp-verify-20260614/lighthouse-mobile-docs-start.report.html`

## Lighthouse mobile 指标
### Home `/`
- Performance score: `0.51`
- FCP: `2091.318 ms`
- LCP: `4812.910 ms`
- TBT: `2566.138 ms`
- CLS: `0`
- Server response: `27 ms`
- 验收边界：`LCP < 2500ms` => `FAIL`
- 验收边界：`CLS < 0.1` => `PASS`

### Docs `/docs/start`
- Performance score: `0.63`
- FCP: `2028.108 ms`
- LCP: `3658.583 ms`
- TBT: `1200.234 ms`
- CLS: `0.0002343729159913926`
- Server response: `599 ms`
- 验收边界：`LCP < 2500ms` => `FAIL`
- 验收边界：`CLS < 0.1` => `PASS`

## PSI 补充
- PSI API 对 `https://hermes-zh.com/` 返回：`HTTP 429 Too Many Requests`
- PSI API 对 `https://hermes-zh.com/docs/start` 返回：`HTTP 429 Too Many Requests`
- 本次未取得 fresh PSI report URL，使用 Lighthouse CLI 作为 fallback 证据

## Mobile 视觉 / DOM smoke
DOM metrics 文件：
- `/root/.hermes/projects/hermes-zh/docs/audits/2026-06-13-r10-clean-deploy-verify/dom/home-iphone12.metrics.json`
- `/root/.hermes/projects/hermes-zh/docs/audits/2026-06-13-r10-clean-deploy-verify/dom/docs-start-iphone12.metrics.json`

截图：
- `/root/.hermes/projects/hermes-zh/docs/audits/2026-06-13-r10-clean-deploy-verify/dom/home-iphone12-full.png`
- `/root/.hermes/projects/hermes-zh/docs/audits/2026-06-13-r10-clean-deploy-verify/dom/docs-start-iphone12-full.png`

检查结果：
- Home `scrollWidth == clientWidth == 390`：`PASS`
- Docs-start `scrollWidth == clientWidth == 390`：`PASS`
- Home `overflowFree=true`：`PASS`
- Docs-start `overflowFree=true`：`PASS`
- Home `headerHeight=73`，存在 `mobileNavExists=true` / `summaryExists=true`：`PASS`
- Docs-start `headerHeight=73`，存在 `mobileNavExists=true` / `summaryExists=true`：`PASS`
- Live HTML 含 `nav_start_click` marker：home/docs-start 均 `PASS`
- Live HTML 同时保留 `G-N2Q0TXQDRZ`、`ga4-idle-loader`、Cloudflare official beacon：`PASS`

## 总结
- Clean detached worktree 部署：`PASS`
- Vercel 生产 commit 对齐 Long T0：`PASS`
- Mobile 视觉/DOM smoke：`PASS`
- Lighthouse mobile CLS 双页：`PASS`
- Lighthouse mobile LCP 双页：`FAIL`
- 本任务总体验收：`FAIL`（原因：`/` 与 `/docs/start` 的 fresh mobile LCP 均未达到 `<2500ms`）

## 阻塞/说明
- 不是部署阻塞；是 fresh 线上 mobile Lighthouse 指标未达标。
- PSI 官方 API 本轮被 429 限流，无法补充 fresh 官方 PSI 报告链接。
