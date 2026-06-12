# HERMES-ZH-P0-R22-PAGESPEED-NONSCORING-DIAGNOSTICS-CLEANUP-20260612-T3-PM-FINAL-NONSCORING-GATE

## Verdict

**PARTIAL / NO FINAL PASS（生产健康通过；本轮 non-scoring 优化不能关闭）**

本轮验收重点不是 desktop `>=90`，而是 PageSpeed 不计分诊断项是否可控减少且 route / marker / visual / mobile / CLS / GA4 / `nav_start_click` 无回归。按 SQLite SSoT proof 核验后，结论如下：

- **生产健康/路由/标记/视觉：PASS**
- **CLS：PASS（未见本轮引入新 CLS；mobile CLS=0，desktop field CLS=0.02）**
- **GA4 / ga4-idle-loader / nav_start_click / Cloudflare official beacon：PASS**
- **mobile non-regression：FAIL / 至少不能判 PASS**（R21 mobile score `96`，T2 UI fallback mobile score `88`，下降 8 分；虽然 mobile CLS 仍为 `0`）
- **T1 低风险 legacy JS 修复上线状态：FAIL / 未证明上线**（T1 目标 commit `e135977...`，T2 实际生产 SHA `c80c977...`；`e135977` 不是 `c80c977` 的祖先，T2 未部署 T1 修复）
- **desktop lab 诊断：INCOMPLETE**（PSI API 429；desktop UI 只拿到 field data，未完整展开 lab diagnostics）

因此，本轮只能验收“生产未崩、关键标记未丢、部分已有优化链仍在线”，不能验收为“不计分诊断项优化成果已完成”。

## SQLite SSoT 依赖核验

从 `/root/.hermes/projects/dispatch-system/dispatch_runtime.db` 按 `project_id='hermes-zh'` 与 task group `HERMES-ZH-P0-R22-PAGESPEED-NONSCORING-DIAGNOSTICS-CLEANUP-20260612` 拉取：

| Task | 状态 | 关键 proof |
|---|---:|---|
| T0 `LONG-INVENTORY-FEASIBILITY-ONLY` | completed | 只读盘点 forced reflow、network/fonts、Cloudflare beacon TTL、legacy JS、DOM size、third-party、long tasks；建议只做 legacy JS 最小验证/低风险包，不修 Cloudflare TTL、fonts/CLS、DOM 429。 |
| T1 `LONG-FIX-LOW-RISK-DIAGNOSTICS-ONLY` | completed | 在 clean worktree 基于 `b0129fdb...` 生成 commit `e135977dfa7b9768d405b5c03f9ff9204340ca0c`，将 `app/api/revalidate/route.ts` 中 app-owned `flatMap` 改为显式循环，并新增 `tests/performance/legacy-js-minimal-verification.test.ts`；typecheck / npm test / test:perf / build / smoke PASS。 |
| T2 `HYOGA-CLEAN-DEPLOY-DIAGNOSTICS-VERIFY` | completed | clean worktree 部署 production SHA `c80c97717bf2b2993cb69a0a278dada233d5c645`；route/marker/visual PASS；PSI API 429；mobile UI fallback 成功，desktop UI fallback 部分成功。 |

PM 额外 git 关系复核：

```text
T1 target commit: e135977dfa7b9768d405b5c03f9ff9204340ca0c
T2 deployed SHA:  c80c97717bf2b2993cb69a0a278dada233d5c645

e135977 parent: b0129fdbedd4f4f936afc20c468ca5f15b66e8ba
b0129fdb parent: c80c97717bf2b2993cb69a0a278dada233d5c645

merge-base --is-ancestor e135977 c80c977 => false
merge-base --is-ancestor c80c977 e135977 => true
```

解释：`e135977` 是 `c80c977 -> b0129fdb -> e135977` 链路上的后续提交；T2 实际部署 `c80c977`，没有包含 T1 的 legacy JS 最小修复，也没有包含 R21 的 `b0129fdb` hero font optional commit。

## Gate 检查结果

| Gate | 结果 | 依据 |
|---|---:|---|
| T0/T1/T2 completed | PASS | SQLite SSoT 均为 completed。 |
| clean worktree deploy | PASS | T2 proof：`/tmp/hermes-zh-r22-clean-20260612203652`，worktree clean。 |
| production SHA 身份 | FAIL for this group | T2 deployed `c80c977...`，但 T1 要求下游部署 `e135977...`。 |
| route health | PASS | `/`、`/docs/start`、`/docs/solutions`、`/llms.txt` 全部 HTTP 200。 |
| GA4 ID | PASS | T2 proof：`G-N2Q0TXQDRZ` present。 |
| ga4-idle-loader | PASS | T2 proof：present。 |
| nav_start_click | PASS | T2 proof：present。 |
| Cloudflare official beacon | PASS | T2 proof：`https://static.cloudflareinsights.com/beacon.min.js` present。 |
| external stylesheet | PASS | T2 proof：`external stylesheet=[]`。 |
| visual smoke | PASS | T2 proof：首页 hero/header/CTA 正常，docs 三栏正常；截图已归档在 ops profile cache。 |
| mobile CLS | PASS | T2 mobile UI：CLS `0`。 |
| desktop field CLS | PASS / auxiliary | T2 desktop UI field data：CLS `0.02`；但 desktop lab diagnostics 未完整展开。 |
| mobile score non-regression | FAIL / cannot pass | R21 mobile score `96`；T2 mobile UI score `88`，下降 8 分。 |
| official API evidence | PARTIAL | mobile/desktop API 均 429；UI fallback mobile 成功、desktop 只拿到 field data。 |
| desktop lab diagnostics | INCOMPLETE | desktop “Diagnose performance issues” 未完整展开，不能逐项确认 desktop 侧不计分项减少。 |

## 不计分诊断项逐项验收

| 项 | 本轮状态 | PM 判定 |
|---|---|---|
| forced reflow | T0 判定未归因，不纳入低风险包；T2 mobile UI 可见列表未再显式出现，但 desktop lab 未完整展开。 | **不能关闭**。只能说 mobile 可见证据未出现；缺 desktop lab proof。 |
| network dependency tree / fonts | T0 判定可控但与 desktop CLS/font 主线强耦合，不纳入本轮；T2 mobile UI 仍出现。 | **未优化，合理排除**。应回到 CLS 主线做只读 RCA。 |
| Cloudflare beacon cache TTL | T0 判定官方 external TTL 不可控，不得伪装可修；T2 mobile UI 仍 `Use efficient cache lifetimes — Est savings of 5 KiB`。 | **不可控残留**。保留 official beacon 是正确约束。 |
| legacy JavaScript | T1 做了 app-owned `flatMap` 最小修复并通过测试，但 T2 未部署 T1 commit；T2 mobile UI 仍 `Legacy JavaScript — Est savings of 12 KiB`。 | **未完成上线 / 不能算已优化**。需要先纠正部署 SHA 或重跑部署验证。 |
| DOM size | T0 判定 DOM 429 低优先级，删除结构会影响视觉；T2 mobile UI 仍出现。 | **未优化，合理排除**。不建议为 429 做视觉/结构删改。 |
| third-party | T2 证明 GA4 idle loader、Cloudflare official beacon、external stylesheet=[] 均在线；mobile UI 仍显示 3rd parties。 | **部分收敛但不能清零**。第三方项受 GA4/Cloudflare marker 约束，不能以移除换分。 |
| long tasks | T0 判定缺 attribution，不纳入；T2 mobile UI 从此前 2 项变为 `1 long task found`。 | **可能改善但证据不足**。可记录为 mobile 可见项减少，但缺 API/desktop lab 结构化证据。 |

## 已优化 / 未优化 / 不可控项

### 已优化或已保持的部分

1. 生产侧关键 marker 保持：GA4、idle loader、`nav_start_click`、Cloudflare official beacon 均 PASS。
2. 外链 stylesheet 仍为 `[]`，没有回退。
3. mobile CLS `0`，desktop field CLS `0.02`，本轮未见新增 CLS 回归。
4. long task 在 mobile UI 可见口径下为 `1 long task found`，相对 T0 输入的 `2 项 101ms+71ms` 可能减少；但因 API 429、desktop lab 缺失，只能作为弱证据。

### 未优化 / 未能关闭的部分

1. T1 的 app-owned legacy JS 修复未被 T2 部署到生产，不能算完成。
2. mobile UI 仍出现 `Legacy JavaScript — Est savings of 12 KiB`。
3. mobile UI 仍出现 `Network dependency tree`、`Optimize DOM size`、`3rd parties`、`Use efficient cache lifetimes`。
4. desktop lab diagnostics 未完整展开，不能做 desktop 侧逐项减少结论。
5. mobile score 从 R21 `96` 到 T2 `88`，不能判 mobile non-regression PASS。

### 不可控或本轮正确不修的部分

1. Cloudflare official beacon TTL：外部官方域缓存策略不可由本站控制；不能 self-host 冒充修复。
2. network/fonts：与 desktop CLS `0.4` 主线耦合，不能混入 non-scoring cleanup。
3. DOM 429：低于常见问题阈值，删结构收益小且视觉风险高。
4. forced reflow / long tasks：缺 trace attribution，不应 broad rewrite。

## 剩余风险

1. **部署链路风险**：T2 部署 SHA 与 T1 target SHA 不一致，导致本轮唯一代码修复未证明上线。
2. **mobile 回归风险**：mobile UI fallback score `88` vs R21 `96`，虽然 CLS=0，但不能判 mobile non-regression。
3. **证据完整性风险**：官方 PSI API 持续 429，desktop UI fallback 没有完整 lab diagnostics。
4. **主线性能风险**：desktop CLS `0.4` 主线仍未关闭；R22 不应掩盖 R21 的核心阻塞。
5. **仓库状态风险**：`/opt/projects/hermes-zh` 当前工作区 dirty，后续任何部署仍必须使用 clean worktree。

## 下一步建议

### 立即纠偏（优先级 P0）

开一个只做部署链路纠偏/复验的短卡：

- 输入：T1 target commit `e135977dfa7b9768d405b5c03f9ff9204340ca0c`。
- 动作：用 clean worktree 部署包含 `e135977` 的目标 SHA，或如果 PM 选择不部署，则明确 R22 T1 作为 no-prod-change 关闭。
- 验证：production SHA 必须等于/包含 `e135977`；route/marker/visual/GA4/nav_start_click/Cloudflare beacon PASS；mobile/desktop PSI UI/API 重新归档。
- 禁止：不得混入 hero/CSS/fonts/DOM broad rewrite。

### 主线回归

在部署纠偏或明确放弃 R22 代码修复后，建议回到 **desktop CLS `0.4` 主线**：

- 下一 exact issue：`Layout shift culprits / hero section CLS 0.400 post-optional re-profile`。
- 先只读 RCA：捕获 Lighthouse trace/layout-shift source node、production CSS/font loading 实际行为、字体加载时序、fallback/webfont 替换证据。
- 再选一个最小可逆修复；继续保留 GA4、idle loader、`nav_start_click`、Cloudflare official beacon、external stylesheet=[]、mobile non-regression 约束。

## Final status

**PM final gate：PARTIAL / NO FINAL PASS。**

本轮可以确认生产没有明显破坏、关键标记和视觉通过；但由于 T2 未部署 T1 目标修复、mobile score 下降、desktop lab diagnostics 不完整，不能验收为 non-scoring diagnostics cleanup 已完成。下一步先纠正部署 proof，再回到 desktop CLS `0.4` 主线。