# HERMES-ZH-P0-R20-PAGESPEED-DESKTOP-CLS-ISSUE-0032-20260612-T2-HYOGA-CLEAN-DEPLOY-FRESH-PSI

## 操作
1. 从 Dispatch SQLite SSoT 核验 T1 已 completed，并读取其完成证明：T1 在 clean/controlled worktree `/tmp/hermes-zh-r20-issue0032-ktebgT` 产出批准提交 `08768452a24e6206194bc01bac97ab51dde7dd27`（`fix(perf): stabilize hero h1 font swap baseline`）。
2. 核验当前主工作区 `/opt/projects/hermes-zh` 仍为 dirty，未直接从 dirty worktree 发版。
3. 使用 clean release worktree `/tmp/hermes-zh-r20-t2-deploy-FgoETr`，detached 到 approved target SHA `08768452a24e6206194bc01bac97ab51dde7dd27`。
4. 在 clean release worktree 中加载 Vercel 凭据并显式设置：
   - `VERCEL_PROJECT_ID=prj_lo8U1vHY8wWWArTMdzxLvQXw0jFE`
   - `VERCEL_ORG_ID=team_9ECNkQmqAm2b6a8uD9G4excp`
   - `--scope pascalteam`
5. 执行 `vercel deploy --prod --yes --token "$VERCEL_TOKEN" --scope pascalteam`，完成新的 production deploy。
6. 通过 Vercel API (`/v6/deployments`, `/v9/projects`) 回收最新 production deployment id / alias / deployed SHA 证据。
7. 对生产路由 `/`、`/docs/start`、`/docs/solutions`、`/llms.txt` 做 HTTP 200 / cache header 核验。
8. 抓取生产首页 HTML，核验 GA4 / idle loader / nav marker / Cloudflare beacon / external stylesheet=[]。
9. 进行 fresh PSI 尝试：
   - Google PSI API desktop/mobile 各重试 3 次；
   - 因官方 API 持续 `429 Too Many Requests`，未获得新的官方 report URL；
   - 同批补充本地 fresh Lighthouse desktop/mobile 结果作为 fallback 辅助证据；
   - browser daemon 启动失败，无法用 PageSpeed UI 浏览器路径补抓新的官方报告页。
10. 从 Lighthouse final screenshot 提取 desktop/mobile 截图，并做视觉 smoke 分析。

## 状态
- 任务类型：`deploy + verify + fresh PSI retry`。
- 依赖 T1：`completed`，非 no-op。
- 发布路径：`clean release worktree`，符合验收，不从 dirty `/opt/projects/hermes-zh` 直接发版。
- Vercel author seat：**本轮未触发新的 seat block**；因此未走等价重签 author SHA 流程。

## 结果

### 1) Clean release worktree / approved SHA
- dirty 主工作区：`/opt/projects/hermes-zh`
- clean release worktree：`/tmp/hermes-zh-r20-t2-deploy-FgoETr`
- approved target SHA：`08768452a24e6206194bc01bac97ab51dde7dd27`
- clean worktree HEAD：`08768452a24e6206194bc01bac97ab51dde7dd27`
- worktree 状态：`## HEAD (no branch)`，无脏改

### 2) Production deploy proof
- deploy time: `2026-06-12 11:31:19 CST`
- newest production deployment id: `dpl_D4kihaQFr9GsPowZj2sdTUT5XaQL`
- production URL: `https://hermeszh-r2lpe54d2-pascalteam.vercel.app`
- inspector: `https://vercel.com/pascalteam/hermeszh/D4kihaQFr9GsPowZj2sdTUT5XaQL`
- canonical alias: `hermes-zh.com`
- aliases from Vercel project API:
  - `hermes-zh.com`
  - `www.hermes-zh.com`
  - `project-80jfc.vercel.app`
  - `hermeszh-pascalteam.vercel.app`
  - `hermeszh-pascalai-pascalteam.vercel.app`
- production deployed SHA from API `meta.gitCommitSha`:
  - `08768452a24e6206194bc01bac97ab51dde7dd27`
- production commit message:
  - `fix(perf): stabilize hero h1 font swap baseline`

结论：
- `clean worktree HEAD == approved target SHA == deployed production SHA`
- 本轮不是 no-op，且无需 author-seat 等价重签。

### 3) Live route / canonical / header proof
```json
[
  {
    "url": "https://hermes-zh.com/",
    "status": 200,
    "final_url": "https://hermes-zh.com/",
    "content_type": "text/html; charset=utf-8",
    "cf_cache_status": "HIT",
    "x_vercel_cache": "HIT",
    "cache_control": "public, max-age=1800, s-maxage=14400, stale-while-revalidate=7200",
    "age": "6657"
  },
  {
    "url": "https://hermes-zh.com/docs/start",
    "status": 200,
    "final_url": "https://hermes-zh.com/docs/start",
    "content_type": "text/html; charset=utf-8",
    "cf_cache_status": "HIT",
    "x_vercel_cache": "PRERENDER",
    "cache_control": "public, max-age=1800, s-maxage=14400, stale-while-revalidate=7200",
    "age": "6857"
  },
  {
    "url": "https://hermes-zh.com/docs/solutions",
    "status": 200,
    "final_url": "https://hermes-zh.com/docs/solutions",
    "content_type": "text/html; charset=utf-8",
    "cf_cache_status": "HIT",
    "x_vercel_cache": "PRERENDER",
    "cache_control": "public, max-age=1800, s-maxage=14400, stale-while-revalidate=7200",
    "age": "6856"
  },
  {
    "url": "https://hermes-zh.com/llms.txt",
    "status": 200,
    "final_url": "https://hermes-zh.com/llms.txt",
    "content_type": "text/plain; charset=utf-8",
    "cf_cache_status": "HIT",
    "x_vercel_cache": "MISS",
    "cache_control": "public, max-age=1800, s-maxage=14400, stale-while-revalidate=7200",
    "age": "10256"
  }
]
```

### 4) Marker / stylesheet proof
```json
{
  "ga4_id": true,
  "ga4_idle_loader": true,
  "nav_start_click": true,
  "cloudflare_official_beacon": true,
  "external_stylesheets": [],
  "site_hero_title_count": 4,
  "min_height_256_present": true,
  "h1_text_present": true
}
```

说明：直接在 live HTML 中确认 `min-height:2.56em` 已存在；`desktop flex` 规则未能通过简单 HTML 字符串探针稳定匹配到压缩后的 CSS 片段，但 production SHA 与 deploy target SHA 已由 Vercel API 对齐，且视觉 smoke 与 desktop Lighthouse fallback 正常。

### 5) Visual smoke
Vision 对 Lighthouse final screenshot 的结论：
- desktop：首页 hero H1「Hermes Agent 中文站」显示完整，未见明显裁切；header / logo / title 正常；未见明显布局塌陷。
- mobile：hero H1 未见裁切；header / logo / title 正常；未见明显布局塌陷。
- docs route 文本探针：`/docs/start`、`/docs/solutions` 均存在 docs/toc/三栏布局语义信号，未见异常。

### 6) fresh PSI proof
#### 6.1 官方 PSI API 尝试
```json
[
  {"strategy": "desktop", "error": "<HTTPError 429: 'Too Many Requests'>"},
  {"strategy": "mobile", "error": "<HTTPError 429: 'Too Many Requests'>"}
]
```
- desktop/mobile 各已重试 3 次，仍被 429 阻断。
- browser daemon 启动失败，无法改走 PageSpeed UI 自动化抓取新的 report URL。
- 因此：**本轮没有拿到新的官方 PSI report URL**。

#### 6.2 同批 fallback Lighthouse（辅助证据，不替代官方 PSI 对外口径）
Desktop fallback:
```json
{
  "fetchTime": "2026-06-12T03:28:43.226Z",
  "score": 81,
  "fcp": "0.9 s",
  "lcp": "1.3 s",
  "tbt": "320 ms",
  "cls": 0,
  "speedIndex": "1.3 s",
  "ttfb": "Root document took 30 ms"
}
```

Mobile fallback:
```json
{
  "fetchTime": "2026-06-12T03:29:11.513Z",
  "score": 85,
  "fcp": "1.6 s",
  "lcp": "1.6 s",
  "tbt": "540 ms",
  "cls": 0.0020943415274219538,
  "speedIndex": "1.7 s",
  "ttfb": "Root document took 40 ms"
}
```

#### 6.3 官方 baseline（仅 carry-forward，对比口径）
由于本轮 fresh 官方 PSI 被 429 阻断，只能保留上轮官方 fresh 基线用于验收对照：
- R19 desktop official fresh：score `81` / CLS `0.4`
- R19 mobile official fresh：score `83` / CLS `0.001`

### 7) Verdict
- Production proof：`PASS`
- Clean release worktree deploy：`PASS`
- Route / marker / stylesheet / visual smoke：`PASS`
- Official fresh PSI URL + metrics：`BLOCKED BY PSI 429 + browser daemon failure`
- Fallback desktop/mobile Lighthouse：`COLLECTED`
- Overall verdict：`NO OVERALL PASS`

原因：
1. 虽然 production 已成功切到 approved target SHA `0876845...`；
2. 但本轮未拿到新的官方 PSI report URL，无法按验收要求给出“desktop + mobile 同批新官方报告 URL 与指标”；
3. 因此不能宣称 desktop 已达到 `>=90`，也不能用新官方数据证明 mobile 相对 R19 `83` 的非回归或接近 R17 `97`。

## 风险
1. **官方 PSI 取证阻塞**：Google PSI API 持续 `429 Too Many Requests`，browser daemon 也失败，导致无法获得新的官方 report URL。
2. **性能结论边界**：fallback Lighthouse 仅作辅助，不可替代官方 PSI 对外验收口径。
3. **Hobby 计划 CPU 风险仍在**：production build 成功，但项目仍处于历史已知 CPU 小时风险环境。
4. **后续验证需要再跑官方 PSI**：一旦 quota 恢复，应立即补抓同批 desktop/mobile 官方报告，才能最终判断 Issue #3.2 是否关闭。

## 建议动作
1. 维持当前 production SHA `08768452a24e6206194bc01bac97ab51dde7dd27`，因为 clean deploy / live smoke 已通过。
2. 待 PSI quota 恢复后，重新派一个 read-only OPS proof 卡，仅补抓：
   - desktop official report URL + score/FCP/LCP/TBT/CLS/SI/TTFB
   - mobile official report URL + score/FCP/LCP/TBT/CLS/SI/TTFB
3. 若官方 fresh PSI 仍显示 desktop `81/0.4` 或 mobile 未改善，再由 PM 按治理继续拆下一 exact issue；当前不能 broad rewrite。
