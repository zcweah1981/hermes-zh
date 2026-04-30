# hermes-zh

Hermes Agent 中文站独立站第一轮可运行骨架。

## 已包含
- Next.js 15 + TypeScript + Tailwind 基础结构
- App Router 路由占位：首页、文档页、packs 页
- 内容接入脚手架：sync-content / build-manifests / verify-content
- `lib/content/loaders/*` 最小加载器
- `content-cache/generated/*.json` 构建输入样板

## 本地启动
```bash
npm install
npm run dev
```

## 内容脚本
```bash
npm run sync:content
npm run build:manifests
npm run build:content
npm run verify:content
```

## 环境变量
- `CONTENT_REPO_PATH`：默认 `/opt/projects/awesome-hermes-agent-zh`
- `CONTENT_REPO_BRANCH`：默认 `main`

## 生产运维约定
- canonical host 固定为 `https://hermes-zh.com`
- `middleware.ts` 负责在同一 Vercel 项目内将 `www.hermes-zh.com/*` 308 到 apex 对应路径
- `npm run build` 会生成 `content-cache/generated/build-meta.json`，记录 source branch / SHA / generatedAt / counts
- `npm run build` 的实际前置动作是 `tsx scripts/prepare-build-content.ts && next build`，也就是“先准备内容 manifest，再执行站点构建”
- `npm run verify:content` 校验 manifest 结构与 `build-meta.json`
- `npm run verify:content:freshness` 校验 manifest 时效与 source SHA 是否匹配当前内容仓 HEAD
- `app/api/revalidate/route.ts` 只用于缓存失效；它不是内容同步器，也不替代 `build` / `build:manifests`

## 当前同步机制口径

一句话：当前是“构建驱动的半自动同步”，不是实时自动同步。

### 现在到底怎么同步
1. 内容真相源仍是 `awesome-hermes-agent-zh` 的默认分支 `main`
2. 站点在 `npm run build`、`npm run build:content`、CI verify/build、Vercel 部署构建这类显式构建动作里读取内容仓
3. 构建脚本会把内容仓页面与 packs 转成 `content-cache/generated/*.json` manifest，再由 Next.js 消费这些构建产物；站点运行时不直接读取 Markdown 源文件
4. `npm run build` 使用 `scripts/prepare-build-content.ts`：有可用内容仓时刷新 manifest；没有可用内容仓但已有 generated manifest 时复用兜底产物
5. 兜底产物只保证构建可继续，不代表已经同步到内容仓最新提交

### 为什么它是“半自动”
- 自动的部分：一旦有人触发构建，manifest 生成、构建校验、站点打包是自动完成的
- 半自动的部分：内容仓有新提交后，不会自己触发 hermes-zh 的生产构建，也不会自己让线上站点立刻刷新

### 为什么现在还不是实时自动同步
- 还没有“内容仓变更 -> 站点自动部署”的 webhook / deploy hook 闭环
- `app/api/revalidate/route.ts` 只能做缓存失效，不能拉取内容仓、不能重建 manifest、不能替代部署
- 当前 CI 的 `verify.yml` 只在 hermes-zh 自身仓库的 push / PR 时运行，不会因为内容仓更新而自动执行
- 线上是否更新，仍取决于有人手动触发站点构建 / 部署，或站点仓本身发生新的提交

### 下一轮若升级自动同步，最小方案建议
目标不是一步做到复杂增量同步，而是先打通“内容仓更新后，站点自动重建并刷新”的最小闭环。

最小方案：
1. 在内容仓 `awesome-hermes-agent-zh` 的 `main` 分支配置 GitHub Actions 或 webhook
2. 当该分支有新提交时，自动触发 hermes-zh 的部署动作（推荐用 Vercel Deploy Hook，或 GitHub repository_dispatch/workflow_dispatch）
3. hermes-zh 在这次部署里继续沿用现有构建逻辑：checkout / clone 内容仓 -> 生成 manifest -> `next build`
4. 部署成功后，再按需要调用 `/api/revalidate` 做兜底缓存失效；首轮可先粗粒度刷新首页、docs、packs
5. Deploy Hook、GitHub token、`REVALIDATE_TOKEN` 只进入平台 Secrets，不写入仓库、治理文件或长期记忆

这样升级后，口径可变为：
- “内容仓提交可自动触发站点重建，线上内容按部署完成自动更新”

但在做这一步之前，当前对外口径仍应保持：
- “Hermes 中文站目前采用构建驱动的半自动同步；内容更新后需要由构建/部署动作把最新内容带到站点。”

更多细节见：`docs/governance/content-sync-mechanism.md`
