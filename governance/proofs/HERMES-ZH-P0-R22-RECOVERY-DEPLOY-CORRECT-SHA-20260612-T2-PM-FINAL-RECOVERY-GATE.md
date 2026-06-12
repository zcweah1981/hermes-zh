# HERMES-ZH-P0-R22-RECOVERY-DEPLOY-CORRECT-SHA-20260612-T2-PM-FINAL-RECOVERY-GATE

## 目标
PM final gate：基于 SQLite SSoT 与生产复核，验收 R22 recovery 是否关闭“部署错误 SHA”问题，并给出下一步 issue。

## 当前阶段
- T0 Recovery deploy：completed
- T1 PSI diagnostics reverify：completed
- T2 PM final gate：finalized

## 输入
- SQLite SSoT：`/root/.hermes/projects/dispatch-system/dispatch_runtime.db`
- task_group：`HERMES-ZH-P0-R22-RECOVERY-DEPLOY-CORRECT-SHA-20260612`
- T0 artifact：`/opt/projects/hermes-zh/governance/proofs/HERMES-ZH-P0-R22-RECOVERY-DEPLOY-CORRECT-SHA-20260612-T0-HYOGA-DEPLOY-E135977-VERIFY.md`
- T1 worker_handoff_proof / completion report：SQLite artifact `6566` / report `2803`
- Live Vercel API production deployments
- Live route/marker HTML probe against `https://hermes-zh.com`

## PM Final Verdict
**PARTIAL / NO OVERALL PASS**

R22 recovery **已经关闭“部署错误 SHA”问题**：production 当前部署为正确目标 SHA `e135977dfa7b9768d405b5c03f9ff9204340ca0c`，并包含 T1 修复（`app/api/revalidate/route.ts` 移除 app-owned `flatMap` candidate）。

但 R22 recovery **不能整体 PASS**：官方 PSI UI fallback 显示 mobile score 从 R21 baseline `96`、错误 run `88` 进一步降至 `82`，mobile non-regression 明确 FAIL；同时 legacy JS audit 仍显示 `chunk 255 / 12 KiB`，说明 app-owned flatMap 清理未让该 audit 消失。

## 验收硬门
| 项 | 结论 | 证据 |
|---|---:|---|
| T0/T1 completed | PASS | SQLite tasks：T0/T1 status=`completed` |
| production SHA 包含 T1 `e135977` | PASS | Vercel API latest prod `dpl_UUpJnPaRcqwC4YBEFLzohuHXX9JW`，`meta.gitCommitSha=e135977dfa7b9768d405b5c03f9ff9204340ca0c` |
| T1 修复存在 | PASS | T0 proof diff：`app/api/revalidate/route.ts` 中 `.flatMap(...)` 改为 `for...of + Set` 去重 |
| route health | PASS | Live probe：`/`、`/docs/start`、`/docs/solutions`、`/llms.txt` 均 HTTP 200 |
| GA4 / nav_start_click / Cloudflare beacon | PASS | Live HTML：`G-N2Q0TXQDRZ`、`ga4-idle-loader`、`nav_start_click`、`static.cloudflareinsights.com/beacon.min.js` present；stylesheet links `[]` |
| visual smoke | PASS | T0/T1 proof：home hero/header/CTA 正常，docs 三栏正常，未见明显视觉塌陷 |
| mobile non-regression | FAIL | T1 official PSI UI fallback：R21 `96` -> failed run `88` -> recovery `82` |

## 生产身份复核
Live Vercel API 当前 production：

```json
{
  "uid": "dpl_UUpJnPaRcqwC4YBEFLzohuHXX9JW",
  "readyState": "READY",
  "readySubstate": "PROMOTED",
  "target": "production",
  "gitCommitSha": "e135977dfa7b9768d405b5c03f9ff9204340ca0c",
  "gitCommitMessage": "fix(perf): remove app-owned legacy flatMap candidate"
}
```

上一错误 production：`dpl_4sT3URd6t1CYP8CDNYtKJKCPCwMR` / `c80c97717bf2b2993cb69a0a278dada233d5c645`。因此本 recovery 已纠正部署身份。

## PSI / Diagnostics 结果
T1 采集方式：官方 PSI API mobile/desktop 均 `429`，按规则使用官方 PageSpeed UI fallback。

- mobile report：`https://pagespeed.web.dev/analysis/https-hermes-zh-com/bmj8tx9dp5?form_factor=mobile`
- desktop report：`https://pagespeed.web.dev/analysis/https-hermes-zh-com/bmj8tx9dp5?form_factor=desktop`
- report time：`Jun 12, 2026, 10:18:30 PM`

### Desktop
- Performance：`100`
- FCP：`0.6 s`
- LCP：`0.6 s`
- TBT：`40 ms`
- CLS：`0`
- Speed Index：`0.6 s`
- Main-thread work：`1.1 s`
- JS execution：`0.2 s`
- Long tasks：`3`

### Mobile
- Performance：`82`
- FCP：`3.0 s`
- LCP：`3.9 s`
- TBT：`30 ms`
- CLS：`0`
- Speed Index：`3.0 s`
- Main-thread work：`0.9 s`
- JS execution：`0.2 s`
- Long tasks：`3`

## 逐项诊断改善判断
| 诊断项 | 结论 | 说明 |
|---|---:|---|
| Legacy JavaScript | NOT IMPROVED / unresolved | 仍显示 `Legacy JavaScript — Est savings of 12 KiB`，仍指向 `/_next/static/chunks/255-1a68626ff4d024e4.js`，signals 仍含 `Array.prototype.at/flat/flatMap/Object.fromEntries/Object.hasOwn/trimStart/trimEnd`。T1 app-owned flatMap 清理未改变该 audit，剩余更像 runtime/polyfills/framework/dependency output。 |
| Main-thread work | PARTIAL / not blocking desktop | desktop `1.1s`，mobile `0.9s`；数值不高，但 mobile score 仍差，不能作为 closure。 |
| JS execution | STABLE / low | desktop/mobile 均 `0.2s`；不是当前 mobile regression 主因。 |
| Long tasks | UNRESOLVED | desktop/mobile 均仍有 `3 long tasks found`。 |
| Forced reflow | UNRESOLVED on desktop visible diagnostics | desktop visible diagnostics 仍有 `Forced reflow`；T1 未证明消失。 |
| Cache TTL | UNRESOLVED but small | `Use efficient cache lifetimes — Est savings of 5 KiB` 仍可见；T0 route headers显示页面缓存健康，但 PSI 仍提示小额资源 TTL。 |
| DOM | UNRESOLVED | `Optimize DOM size` 仍可见。 |
| Third-party | PRESENT / monitored | `3rd parties` 仍可见；GA4 与 Cloudflare beacon 按验收必须保留，不能为性能分数直接删除。 |
| Network dependency tree / LCP breakdown | NEXT ISSUE CANDIDATE | mobile LCP `3.9s`、FCP/SI `3.0s`，下一步应优先解释移动端首屏链路，而不是继续猜 legacy JS 单点改动。 |

## 下一步 exact issue
**建议新开 P0 read-only profiling issue：R23 Mobile LCP/FCP regression attribution after e135977 production deploy**

边界：
1. 只读 profiling，不改代码、不部署。
2. 固定生产 SHA：`e135977dfa7b9768d405b5c03f9ff9204340ca0c` / deployment `dpl_UUpJnPaRcqwC4YBEFLzohuHXX9JW`。
3. 采集官方 PSI UI/API（API 429 时 UI fallback）、Lighthouse trace 或等价 trace：明确 mobile `82` 的 LCP `3.9s`、FCP/SI `3.0s` 主因。
4. 必须输出 ordered culprit list：LCP element、critical request chain、font/CSS/JS/third-party/cache/DOM 对 mobile 的贡献。
5. 只允许推荐一个最小、可逆、视觉零变化修复；禁止 broad/global performance rewrite；禁止删除 GA4/nav_start_click/Cloudflare beacon。
6. legacy JS chunk `255 / 12KiB` 继续作为 P1 并行候选，但不得在 mobile LCP/FCP 根因未明确前继续猜测性改 polyfill/runtime。

## 输出
- PM final proof：`/opt/projects/hermes-zh/governance/proofs/HERMES-ZH-P0-R22-RECOVERY-DEPLOY-CORRECT-SHA-20260612-T2-PM-FINAL-RECOVERY-GATE.md`
- SQLite artifact_type：`pm_final_gate`

## 验收标准
- 部署错误 SHA 是否关闭：**PASS**
- R22 recovery 是否整体完成：**FAIL / NO OVERALL PASS**
- 下一步是否明确：**PASS**（R23 mobile LCP/FCP read-only attribution）

## 优先级
P0：先解释 mobile `96 -> 88 -> 82` 回归，再决定是否修 legacy JS chunk。

## 状态
Completed by PM final gate.
