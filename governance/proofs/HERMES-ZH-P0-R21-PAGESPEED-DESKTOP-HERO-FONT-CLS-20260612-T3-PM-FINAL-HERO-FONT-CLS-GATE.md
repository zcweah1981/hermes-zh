# HERMES-ZH-P0-R21-PAGESPEED-DESKTOP-HERO-FONT-CLS-20260612-T3-PM-FINAL-HERO-FONT-CLS-GATE

## Verdict

**PARTIAL / NO OVERALL PASS**

R21 Hero font CLS 单变量修复已完成部署并通过生产健康验证，但**没有解决 desktop 80/81 卡点**：官方 PSI desktop 仍为 `81`，CLS 仍为 `0.4`，top insight 仍是 `Layout shift culprits`，且 culprit 仍指向 hero section 与两项 web font 资源。

## SQLite SSoT 依赖核验

从 `/root/.hermes/projects/dispatch-system/dispatch_runtime.db` 按 `project_id='hermes-zh'` 与 task group `HERMES-ZH-P0-R21-PAGESPEED-DESKTOP-HERO-FONT-CLS-20260612` 拉取：

| Task | 状态 | 关键 proof |
|---|---:|---|
| T0 `LONG-FONT-CLS-RCA-ONLY` | completed | 只读确认 root cause：hero H1 使用 `font-serif -> Noto Serif SC`，`font-display: swap` late font swap 导致 PSI 将 CLS `0.400` 归因到 `section[data-home-section="hero"].site-hero-fullscreen`。 |
| T1 `LONG-FIX-FONT-CLS-ONLY` | completed | clean worktree 提交 `b0129fdbedd4f4f936afc20c468ca5f15b66e8ba`，只把自托管 CJK font-face 从 `font-display: swap` 改为 `font-display: optional`；测试/typecheck/build PASS。 |
| T2 `HYOGA-CLEAN-DEPLOY-OFFICIAL-PSI` | completed | clean worktree 部署 approved SHA `b0129fdbedd4f4f936afc20c468ca5f15b66e8ba` 到 production；route/marker/visual PASS；官方 PSI UI 采集 desktop/mobile 指标。 |

## Baseline vs After

### 用户验收基线

- desktop performance：`80`
- FCP：`0.6s`
- LCP：`0.8s`
- TBT：`20ms`
- Speed Index：`0.6s`
- CLS：`0.4`
- hero/font culprit：`0.400`

### R21 部署后官方 PSI（T2 fresh proof + PM 浏览器复核）

- desktop report URL：`https://pagespeed.web.dev/analysis/https-hermes-zh-com/78g62dxj66?form_factor=desktop`
- mobile report URL：`https://pagespeed.web.dev/analysis/https-hermes-zh-com/78g62dxj66?form_factor=mobile`
- report time：`Jun 12, 2026, 12:47:23 PM` / captured `Jun 12, 2026, 12:47 PM GMT+8`
- Lighthouse：`13.3.0`
- production SHA：`b0129fdbedd4f4f936afc20c468ca5f15b66e8ba`

| Metric | Baseline | After | 判定 |
|---|---:|---:|---|
| Desktop performance | 80 | 81 | 小幅 +1，但未达 `>=90` |
| Desktop FCP | 0.6s | 0.6s | 持平 |
| Desktop LCP | 0.8s | 0.7s | 小幅改善 |
| Desktop TBT | 20ms | 20ms | 持平 |
| Desktop SI | 0.6s | 0.6s | 持平 |
| Desktop CLS | 0.4 | 0.4 | **未下降 / FAIL** |
| Hero/font culprit | 0.400 | 0.400 | **未解决 / FAIL** |
| Mobile score | R20/R19 83 参考 | 96 | non-regression PASS |
| Mobile CLS | — | 0 | PASS |

## 官方 PSI 最新 top insight 复核

PM 通过浏览器打开官方 PSI desktop 报告并展开 `Layout shift culprits`，复核到：

```text
Layout shift culprits
Element                                      Layout shift score
Total                                        0.400
<section data-home-section="hero"
  class="site-hero-fullscreen relative overflow-hidden px-6 text-center">
                                             0.400
/fonts/noto-serif-sc.woff2 (hermes-zh.com)  Web font
/fonts/noto-sans-sc.woff2  (hermes-zh.com)  Web font
```

结论：T1 的 `font-display: optional` 单变量修复部署后，官方 PSI 仍将 desktop CLS `0.400` 归因到同一个 hero section 与两个 web font 资源；因此不能判定 Hero font CLS 已关闭。

## Gate 判断

- production deploy：PASS
- route/canonical/GA4/Cloudflare marker/external stylesheet/visual smoke：PASS
- mobile non-regression：PASS
- desktop CLS 显著下降：**FAIL**（`0.4 -> 0.4`）
- desktop performance `>=90`：**FAIL**（`81 < 90`）
- overall：**NO OVERALL PASS**

按验收规则，只有官方 desktop CLS 显著下降且 performance `>=90`，同时 mobile non-regression，才可 overall PASS。本轮未满足前两项。

## 下一 exact issue（禁止 broad rewrite）

下一张任务只能继续选官方 PSI 最新 top insight：

**Issue：`Layout shift culprits` / hero section CLS `0.400` post-optional re-profile**

边界：
1. 只读重新归因 `section[data-home-section="hero"].site-hero-fullscreen` 为什么在 `font-display: optional` 后仍出现 `0.400`。
2. 必须捕获 production CSS/font loading 实际行为、Lighthouse trace/layout-shift source node、字体加载时序与 fallback/webfont 替换证据。
3. 输出一个新的最小可逆修法建议；不得直接 broad rewrite hero、全站 CSS、JS bundle、缓存策略或 DOM 结构。
4. 继续保留 GA4 `G-N2Q0TXQDRZ`、`ga4-idle-loader`、`nav_start_click`、Cloudflare beacon、`external stylesheet=[]` 与 mobile non-regression 约束。

## 阻塞点

- 性能目标阻塞：官方 desktop PSI CLS 仍 `0.4`，score 仍 `81`，未达 `>=90`。
- 自动化采集风险：PSI API path 仍 429；本轮官方 UI proof 可用，但后续最好继续保留 UI/browser fallback。
