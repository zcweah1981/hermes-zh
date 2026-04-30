# 自动同步升级评估

更新时间：2026-04-30 11:19:17 CST

## 1. 结论

当前 Hermes 中文站同步链路已经具备“构建时稳定消费内容仓”的基础，但尚未形成“内容仓更新后自动上线”的闭环。

本轮建议采用渐进式升级：

1. **继续保留当前构建驱动链路作为主链路**：`prepare-build-content.ts` / `build:content` / `verify:content` / `verify:content:freshness` 不重写。
2. **第一阶段最小升级采用 Vercel Deploy Hook**：内容仓 `main` 有新提交后，触发 hermes-zh 生产部署；部署阶段继续读取内容仓并生成 manifest。
3. **第二阶段再升级为 repository_dispatch / workflow_dispatch 编排**：把部署前校验、部署后 smoke、失败告警、回滚记录纳入 GitHub Actions。
4. **revalidate 只做缓存兜底**：不把 `/api/revalidate` 表述或实现成内容同步器。

因此 R20 的最小可执行目标不是做运行时动态同步，而是打通：

```text
awesome-hermes-agent-zh@main push
  -> trigger hermes-zh deploy
  -> npm run build refreshes generated manifests
  -> Vercel promotes new deployment
  -> optional post-deploy revalidate/smoke
```

## 2. 当前链路核查

| 项目 | 当前状态 | 判断 |
|---|---|---|
| 内容真相源 | `zcweah1981/awesome-hermes-agent-zh` | 单一内容真相源成立 |
| 当前消费分支 | `main` | 本轮已对齐 CI/Preview checkout ref |
| 站点代码仓 | `zcweah1981/hermes-zh` | 只负责同步、构建、渲染 |
| 生产构建入口 | `npm run build` -> `tsx scripts/prepare-build-content.ts && next build` | 可继续复用 |
| generated manifest | `content-cache/generated/*.json` | 运行时消费对象成立 |
| build meta | `content-cache/generated/build-meta.json` | 已记录 `sourceBranch` / `sourceSha` / counts |
| freshness gate | `npm run verify:content:freshness` | 本地/CI 可用，生产部署需接入策略 |
| revalidate API | `app/api/revalidate/route.ts` | 只做缓存失效，不做内容同步 |
| 当前 CI 触发 | hermes-zh 自身 push / PR | 还不能由内容仓 push 自动触发 |

当前 `build-meta.json` 样例已具备上线后追溯所需字段：

```json
{
  "sourceBranch": "main",
  "sourceSha": "a752794e633d6338588892e9846c231a8c0b2cd2",
  "counts": {
    "pages": 87,
    "routes": 87,
    "packs": 8,
    "search": 95
  }
}
```

## 3. 升级方案对比

### 方案 A：内容仓 GitHub Actions -> Vercel Deploy Hook（推荐第一阶段）

**流程**

1. 在内容仓 `awesome-hermes-agent-zh` 增加一个只监听 `main` 的 workflow。
2. 当 `docs/**`、`packs/**`、`governance/site-route-map.yaml` 等内容相关路径发生变更时，调用 Vercel Deploy Hook。
3. Vercel 触发 hermes-zh 生产部署。
4. hermes-zh 构建阶段继续执行 `npm run build`，刷新 manifest 并构建站点。
5. 部署完成后由 Vercel 平台完成流量切换；必要时再调用 `/api/revalidate` 做缓存兜底。

**优点**

- 改造最小，不重写当前构建链路。
- 密钥面最小，只需要 Vercel Deploy Hook URL。
- 失败边界清晰：hook 触发成功但构建失败时，不会污染上一版线上部署。
- 最快可把对外口径升级为“内容仓提交会自动触发站点重建”。

**风险**

- Deploy Hook 本身只负责触发部署，部署前后的校验与告警需要额外补。
- 如果 Vercel 构建环境拿不到内容仓最新内容，仍可能 fallback 到旧 generated manifest。
- Deploy Hook URL 是敏感凭据，必须放 GitHub Secrets，不能写入仓库。

**适用阶段**

- R20 首轮最小实现。

### 方案 B：内容仓 -> repository_dispatch -> hermes-zh GitHub Actions -> Vercel 部署

**流程**

1. 内容仓 push 后调用 hermes-zh 的 `repository_dispatch` 或 `workflow_dispatch`。
2. hermes-zh workflow checkout 站点仓与内容仓。
3. 执行 `npm ci`、`npm run typecheck`、`npm test`、`npm run build`、`npm run smoke`、`npm run verify:content:freshness`。
4. 通过 Vercel CLI 或 Vercel Git 集成完成部署。
5. 部署后记录 site SHA、content SHA、deployment URL 与 smoke 结果。

**优点**

- 审计链更强，可以明确记录每次内容 SHA 对应的站点部署。
- 可以在部署前后插入质量门禁与 smoke test。
- 更适合后续做失败告警、回滚、日报统计。

**风险**

- 需要 GitHub token / Vercel token / org 权限，凭据面更大。
- 工作流编排复杂度高于 Deploy Hook。
- 若直接在 Actions 内部署，需要认真处理 Vercel 项目 link 与环境隔离。

**适用阶段**

- R20 第二阶段或 R21 运维治理深化。

### 方案 C：内容仓 webhook -> hermes-zh API -> revalidate

**判断**

不建议作为本轮主方案。

原因：当前 `/api/revalidate` 不能拉内容仓、不能生成 manifest、不能部署新版本。单独调用它最多刷新现有构建版本的缓存，无法让线上站点获得内容仓新提交。

**适用边界**

- 只能作为部署成功后的缓存兜底。
- 不能作为自动同步主链路。

## 4. 推荐最小实现

### 4.1 内容仓侧新增 workflow

建议文件：`awesome-hermes-agent-zh/.github/workflows/trigger-hermes-zh-deploy.yml`

```yaml
name: trigger-hermes-zh-deploy

on:
  push:
    branches: [main]
    paths:
      - 'docs/**'
      - 'packs/**'
      - 'governance/site-route-map.yaml'
      - 'governance/**'
      - 'assets/**'

concurrency:
  group: hermes-zh-content-deploy-main
  cancel-in-progress: true

jobs:
  trigger:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger hermes-zh Vercel deploy
        run: |
          curl -fsS -X POST "$VERCEL_DEPLOY_HOOK_URL"
        env:
          VERCEL_DEPLOY_HOOK_URL: ${{ secrets.HERMES_ZH_VERCEL_DEPLOY_HOOK_URL }}
```

治理要求：

- `HERMES_ZH_VERCEL_DEPLOY_HOOK_URL` 只配置为 GitHub Secret。
- workflow 文件只提交变量名，不提交真实 hook URL。
- 首轮只监听 `main`，不监听全部分支。
- 使用 `paths` 限制触发范围，避免无关 README / issue 模板变更引发生产部署。

### 4.2 hermes-zh 构建侧保持当前入口

Vercel Build Command 继续使用：

```bash
npm run build
```

必要环境变量：

| 变量 | 建议值 | 说明 |
|---|---|---|
| `CONTENT_REPO_BRANCH` | `main` | 明确消费内容仓主线 |
| `CONTENT_REPO_URL` | `https://github.com/zcweah1981/awesome-hermes-agent-zh.git` | 允许 CI/构建环境 clone fallback |
| `REVALIDATE_TOKEN` | 平台 Secret | 仅用于 revalidate API |

注意：如果生产 Vercel 环境没有本地 `/opt/projects/awesome-hermes-agent-zh`，`prepare-build-content.ts` 现在会走 `resolveContentRoot()` 的 clone fallback。只有 clone / 解析 fresh content root 失败且已有 generated manifest 时，才会复用 checked-in manifest 兜底；自动同步上线后应对这种 fallback 日志做告警。

### 4.3 部署后验证

最小 smoke 路由：

- `/`
- `/docs`
- `/docs/docs-overview`
- `/packs`
- `/search`
- `/robots.txt`
- `/sitemap.xml`

最小数据验证：

```bash
npm run verify:content
npm run verify:content:freshness
```

线上验收时必须能追溯：

- site repo commit SHA
- content repo commit SHA
- Vercel deployment URL
- `build-meta.json` 中 source SHA
- smoke 结果

## 5. 风险边界

| 风险 | 等级 | 边界与处理 |
|---|---:|---|
| Vercel 构建 fallback 到旧 generated manifest | 中 | 本轮已让 `prepare-build-content.ts` 复用 clone fallback；若 clone 失败仍会使用 checked-in generated manifest 兜底，需要日志告警 |
| Deploy Hook 泄露 | 高 | 只进 GitHub Secrets；泄露后立即轮换 hook |
| 内容仓频繁提交导致部署风暴 | 中 | workflow concurrency + paths 限制；必要时增加手动 dispatch 或合并窗口 |
| 内容结构错误触发生产构建失败 | 中 | 构建失败不会替换上一版生产；后续可加内容仓侧预检 workflow |
| revalidate 被误当同步器 | 中 | 文档与 README 已明确边界；实施时不得只接 revalidate |
| www/apex 或 canonical 缓存混乱 | 中 | 自动部署后继续以 apex 为 canonical；部署 smoke 覆盖 apex 路由 |
| 私有 token 写入仓库 | 高 | 所有 token / deploy hook / revalidate token 仅进入平台 Secrets |
| GitHub Actions 与 Vercel 构建分支不一致 | 中 | 已将 hermes-zh CI/Preview 内容 checkout ref 对齐到 `main` |

## 6. 分阶段验收标准

### R20-M1：评估完成（本文件）

- 明确当前仍是构建驱动半自动同步。
- 明确 webhook / deploy / revalidate 三者边界。
- 给出最小升级路线与风险边界。
- CI/Preview 内容仓 checkout 分支对齐 `main`。

### R20-M2：最小自动部署闭环

- 内容仓 `main` 内容相关路径 push 后自动触发 hermes-zh 新部署。
- 新部署的 `build-meta.json.sourceSha` 等于内容仓触发提交 SHA 或其最新 HEAD。
- 线上 docs / packs / sitemap 使用新 manifest。
- 无人工登录 Vercel 后台点击部署。

### R20-M3：带审计的自动同步

- 每次自动同步记录 site SHA / content SHA / deployment URL / smoke result。
- 失败自动通知 PM/Ops 渠道。
- 可快速回滚到上一版 Vercel deployment。

## 7. 当前不建议做

- 不建议让 Next.js 运行时直接 clone 内容仓并生成 manifest。
- 不建议把内容仓变更同步成站点仓自动提交，避免把 generated manifest 变成第二内容真相源。
- 不建议首轮做页面级增量 revalidate 路由推导，先做整站重建更稳。
- 不建议把 webhook secret、deploy hook URL、Vercel token 写进 README、治理文件或长期记忆。

## 8. Ops 建议动作

1. 创建 Vercel Deploy Hook，并把 URL 配到内容仓 GitHub Secret：`HERMES_ZH_VERCEL_DEPLOY_HOOK_URL`。
2. 在内容仓新增最小 trigger workflow，只监听 `main` + 内容相关路径。
3. 触发一次测试内容提交，核对 Vercel deployment 与 `build-meta.json.sourceSha`。
4. 为 `using checked-in generated manifests` 构建日志增加告警或部署后检查，避免静默发布旧内容。
5. 第二阶段再把 repository_dispatch、部署后 smoke、失败通知、rollback runbook 纳入自动化。
