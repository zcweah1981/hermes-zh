# HERMES-ZH-P0-R22-RECOVERY-DEPLOY-CORRECT-SHA-20260612-T0-HYOGA-DEPLOY-E135977-VERIFY

## 操作
1. 读取 `web-production-ops` 与 `dispatch-system-runtime-api` 技能，按 clean release worktree 流程执行生产恢复。
2. 在 `/opt/projects/hermes-zh` 确认主工作区 dirty，避免从 dirty worktree 直接发版。
3. 验证目标提交 `e135977dfa7b9768d405b5c03f9ff9204340ca0c`：
   - `git cat-file -t e135977...` = `commit`
   - `git merge-base --is-ancestor b0129fdb e135977...` = `YES`
   - `git diff b0129fdb..e135977 -- app/api/revalidate/route.ts` 证明 T1 变更确实移除了 app-owned `flatMap` candidate。
4. 创建 clean release worktree：`/tmp/hermes-zh-r22-t0-deploy-o49HhY`，detached 到 `e135977dfa7b9768d405b5c03f9ff9204340ca0c`，`git status --short` = 空。
5. 在 clean worktree 运行 `npm ci`，随后执行 `npm test -- --runInBand tests/performance/legacy-js-minimal-verification.test.ts`，R22 legacy JS minimal verification 通过。
6. 加载 `/root/.hermes/secrets/hermes-zh-v3.env`，显式设置：
   - `VERCEL_PROJECT_ID=prj_lo8U1vHY8wWWArTMdzxLvQXw0jFE`
   - `VERCEL_ORG_ID=team_9ECNkQmqAm2b6a8uD9G4excp`
   - `--scope pascalteam`
7. 执行 `vercel deploy --prod --yes --token "$VERCEL_TOKEN" --scope pascalteam`，完成 production deploy。
8. 通过 Vercel API (`/v6/deployments`) 回收最新 production deployment 证据。
9. 对 `https://hermes-zh.com` 生产路由 `/`、`/docs/start`、`/docs/solutions`、`/llms.txt` 执行 HTTP/HTML 标记校验。
10. 通过浏览器快照 + vision 对首页和 docs/solutions 做 visual smoke。

## 状态
- clean worktree recovery deploy：PASS
- target SHA ancestry / code proof：PASS
- Vercel production identity proof：PASS
- route / marker / visual smoke：PASS
- author seat block fallback：N/A（本次未触发）

## 结果
### 1) 目标 SHA 与 T1 修复证明
- target SHA：`e135977dfa7b9768d405b5c03f9ff9204340ca0c`
- commit message：`fix(perf): remove app-owned legacy flatMap candidate`
- `git cat-file -t e135977...`：`commit`
- `git merge-base --is-ancestor b0129fdb e135977...`：`YES`
- 目标提交相对 `b0129fdb` 的关键 diff：

```diff
function uniqueStrings(values: Array<string | undefined>) {
-  return Array.from(
-    new Set(
-      values
-        .flatMap((value) => (value ? [value] : []))
-        .map((value) => value.trim())
-        .filter(Boolean),
-    ),
-  )
+  const seen = new Set<string>()
+  const strings: string[] = []
+
+  for (const value of values) {
+    const normalized = value?.trim()
+    if (!normalized || seen.has(normalized)) continue
+
+    seen.add(normalized)
+    strings.push(normalized)
+  }
+
+  return strings
}
```

- 结论：T1 所要求的 `app/api/revalidate/route.ts` flatMap 移除已包含在目标 SHA 中。

### 2) Clean release worktree 证明
- dirty 主工作区：`/opt/projects/hermes-zh`
- clean release worktree：`/tmp/hermes-zh-r22-t0-deploy-o49HhY`
- clean worktree HEAD：`e135977dfa7b9768d405b5c03f9ff9204340ca0c`
- clean worktree status lines：`0`

### 3) 测试证明
- `npm ci`：PASS
- `npm test -- --runInBand tests/performance/legacy-js-minimal-verification.test.ts`：PASS
- 关键套件：`R22 PageSpeed non-scoring legacy JavaScript minimal verification`
- 关键断言：
  - `removes the only app-owned flatMap candidate from the revalidate route without changing runtime scope`
  - `preserves analytics and official beacon markers while avoiding broad build-target changes`
- 汇总：`tests 147 / pass 147 / fail 0`

### 4) Vercel production 身份证明
- newest production deployment id：`dpl_UUpJnPaRcqwC4YBEFLzohuHXX9JW`
- production URL：`https://hermeszh-6yktfh035-pascalteam.vercel.app`
- canonical alias：`https://hermes-zh.com`
- production deployed SHA from Vercel API `meta.gitCommitSha`：`e135977dfa7b9768d405b5c03f9ff9204340ca0c`
- production commit message：`fix(perf): remove app-owned legacy flatMap candidate`
- previous wrong production deployment id / SHA：
  - `dpl_4sT3URd6t1CYP8CDNYtKJKCPCwMR`
  - `c80c97717bf2b2993cb69a0a278dada233d5c645`
- 结论：`newest production deployment SHA == approved target SHA e135977...`，已完成从错误 SHA `c80c977...` 到正确 SHA `e135977...` 的恢复。

### 5) 路由与标记核验
- `/` → HTTP `200`；canonical `https://hermes-zh.com`
- `/docs/start` → HTTP `200`；canonical `https://hermes-zh.com/docs/start`
- `/docs/solutions` → HTTP `200`；canonical `https://hermes-zh.com/docs/solutions`
- `/llms.txt` → HTTP `200`

#### 首页标记
- `GA4 G-N2Q0TXQDRZ`：PASS
- `ga4-idle-loader`：PASS
- `nav_start_click`：PASS
- Cloudflare official beacon (`static.cloudflareinsights.com/beacon.min.js`)：PASS
- `external stylesheet=[]`：PASS

#### 代表性缓存头
- `/` headers：
  - `Cache-Control: public, max-age=1800, s-maxage=14400, stale-while-revalidate=7200`
  - `X-Vercel-Cache: HIT`
  - `Cf-Cache-Status: HIT`

### 6) Visual smoke
- 首页：header 完整；H1「Hermes Agent 中文站」与副标题正常；CTA `快速上手 / 浏览文档 / GitHub` 均可见，未见明显裁切、错位、塌陷。
- `/docs/solutions`：左侧导航 / 中间正文 / 右侧目录三栏布局正常，未见样式缺失、内容塌陷或严重错位。
- browser vision screenshot paths：
  - 首页：`/root/.hermes/profiles/ops/cache/screenshots/browser_screenshot_5d495bc04958420fb6bd9dc12fbcd4df.png`
  - docs/solutions：`/root/.hermes/profiles/ops/cache/screenshots/browser_screenshot_1b988f4be2ea4a00b41fe53c490ae886.png`

## 风险
1. 主工作区 `/opt/projects/hermes-zh` 当前仍是 dirty 状态，因此后续发版必须继续沿用 clean worktree 流程，不能直接在主工作区 deploy。
2. clean worktree 首次运行测试前 `tsx` 缺失，需先 `npm ci`；该问题已在 clean worktree 内补齐并验证通过，不构成当前验收阻塞。
3. Vercel Hobby CPU 风险仍是站点长期运行风险，但不影响本次“正确 SHA 恢复部署 + 生产身份核验”结论。

## 建议动作
1. 将本任务判定为：**PASS**（正确 SHA 已部署，生产身份已核验，关键路由/标记/视觉 smoke 正常）。
2. 将 `dpl_UUpJnPaRcqwC4YBEFLzohuHXX9JW` 记录为当前恢复后的 production baseline deployment。
3. 若后续继续做 PSI/mobile regression 采样，建议直接基于当前 production SHA `e135977...` 进行，避免再次混入 dirty worktree 或错误旧 SHA。