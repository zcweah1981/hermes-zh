# HERMES-ZH-P0-R21-PAGESPEED-DESKTOP-HERO-FONT-CLS-20260612-T2-HYOGA-CLEAN-DEPLOY-OFFICIAL-PSI

## 操作
1. 从 Dispatch SQLite SSoT 核验上游依赖：T0/T1 均已 completed；T1 批准提交为 `b0129fdbedd4f4f936afc20c468ca5f15b66e8ba`（`fix(perf): avoid hero font swap cls`）。
2. 确认 `/opt/projects/hermes-zh` 主工作区仍为 dirty，未从 dirty worktree 直接发版。
3. 创建 clean release worktree：`/tmp/hermes-zh-r21-t2-deploy-suLZ9k`，detached 到批准 SHA `b0129fdbedd4f4f936afc20c468ca5f15b66e8ba`。
4. 加载 Vercel 凭据并显式设置 `VERCEL_PROJECT_ID=prj_lo8U1vHY8wWWArTMdzxLvQXw0jFE`、`VERCEL_ORG_ID=team_9ECNkQmqAm2b6a8uD9G4excp`，执行 `vercel deploy --prod --yes --token "$VERCEL_TOKEN" --scope pascalteam`。
5. 通过 Vercel API 回收最新 production deployment / alias / deployed SHA。
6. 对生产路由 `/`、`/docs/start`、`/docs/solutions`、`/llms.txt` 执行 HTTP/HTML/canonical/marker 校验。
7. 通过官方 PSI 浏览器 UI 与 API 双路径采集：API 返回 429；UI 成功生成 fresh desktop/mobile 官方报告与指标。
8. 对首页 hero 与 `/docs/solutions` 做视觉 smoke。

## 状态
- 依赖 T1：PASS
- clean release worktree deploy：PASS
- production alias/SHA/关键路由/marker/visual smoke：PASS
- official PSI desktop/mobile：PASS（API 429，但 UI 成功）

## 结果
### 1) Clean worktree / deploy proof
- dirty 主工作区：`/opt/projects/hermes-zh`
- clean release worktree：`/tmp/hermes-zh-r21-t2-deploy-suLZ9k`
- approved target SHA：`b0129fdbedd4f4f936afc20c468ca5f15b66e8ba`
- clean worktree HEAD：`b0129fdbedd4f4f936afc20c468ca5f15b66e8ba`
- newest production deployment id：`dpl_2aGLZRkrEgsixzg9vwtkZ5kETCNx`
- production URL：`https://hermeszh-cykaz50mq-pascalteam.vercel.app`
- inspector：`https://vercel.com/pascalteam/hermeszh/2aGLZRkrEgsixzg9vwtkZ5kETCNx`
- canonical alias：`https://hermes-zh.com`
- production deployed SHA from Vercel API `meta.gitCommitSha`：`b0129fdbedd4f4f936afc20c468ca5f15b66e8ba`
- production commit message：`fix(perf): avoid hero font swap cls`
- 结论：`clean worktree HEAD == approved target SHA == production SHA`

### 2) Production route / canonical proof
- `/` → HTTP 200；canonical `https://hermes-zh.com`
- `/docs/start` → HTTP 200；canonical `https://hermes-zh.com/docs/start`
- `/docs/solutions` → HTTP 200；canonical `https://hermes-zh.com/docs/solutions`
- `/llms.txt` → HTTP 200
- `/` HEAD headers include: `cf-cache-status=HIT`, `x-vercel-cache=HIT`, `cache-control=public, max-age=1800, s-maxage=14400, stale-while-revalidate=7200`

### 3) Marker / stylesheet proof
- `GA4 G-N2Q0TXQDRZ`：PASS
- `ga4-idle-loader`：PASS
- `nav_start_click`：PASS
- Cloudflare official beacon：PASS
- `external stylesheet=[]`：PASS

### 4) Visual smoke
- 首页 hero：H1「Hermes Agent 中文站」完整，未见明显裁切、错位或塌陷；CTA 正常。
- `/docs/solutions`：三栏 docs 布局正常，未见明显布局异常、内容塌陷、标题裁切或错位。

### 5) Official PSI proof
#### API path
- `runPagespeed` desktop：`HTTP 429 Too Many Requests`
- `runPagespeed` mobile：`HTTP 429 Too Many Requests`

#### Browser UI path（official PSI）
- desktop report URL：`https://pagespeed.web.dev/analysis/https-hermes-zh-com/78g62dxj66?form_factor=desktop`
- mobile report URL：`https://pagespeed.web.dev/analysis/https-hermes-zh-com/78g62dxj66?form_factor=mobile`

#### Desktop metrics（official PSI UI）
- score：`81`
- FCP：`0.6 s`
- LCP：`0.7 s`
- TBT：`20 ms`
- CLS：`0.4`
- Speed Index：`0.6 s`
- Layout shift culprits：`present`

#### Mobile metrics（official PSI UI）
- score：`96`
- FCP：`2.3 s`
- LCP：`2.3 s`
- TBT：`40 ms`
- CLS：`0`
- Speed Index：`2.3 s`
- Layout shift culprits：`not present`

### 6) Verdict
- Desktop CLS 是否从 `0.4` 下降：**否**（仍为 `0.4`）
- Desktop score 是否提升到 `>=90`：**否**（仍为 `81`）
- Mobile 是否 non-regression：**是**（R20/R19 基线为 `83`；本轮 official mobile 为 `96`，CLS `0`，未见新 CLS 回归）

## 风险
1. Desktop exact issue 仍未关闭：官方 PSI desktop 继续显示 `CLS 0.4` 与 `Layout shift culprits`，说明此次 Hero font `font-display: optional` 修复未解决 desktop 80 分卡点。
2. PSI API 存在速率限制：官方 API 持续 429；本轮依靠官方 UI 成功补齐，不影响验收，但后续自动化采集仍有稳定性风险。
3. Vercel Hobby CPU 风险仍存在：生产已成功部署，但项目历史 CPU 小时风险未消除。

## 建议动作
1. PM 可将本任务判定为：**deploy/verification PASS；performance closure FAIL**。
2. 下一张卡应继续按 exact issue 收敛 desktop `Layout shift culprits`，禁止 broad rewrite。
3. 保持当前 production SHA `b0129fdbedd4f4f936afc20c468ca5f15b66e8ba`；不建议回滚，因为 mobile official PSI 已明显改善且功能/视觉/marker 均正常。
