# 内容同步机制说明

更新时间：2026-04-29

## 一句话结论
当前 Hermes 中文站采用的是“构建驱动的半自动同步”，不是 webhook 级实时自动同步。

## 1. 当前真实机制

### 1.1 真相源
- 内容真相源仓：`awesome-hermes-agent-zh`
- 当前消费分支：`site-content-anchor`
- 站点代码仓：`hermes-zh`
- 站点运行时读取对象：`content-cache/generated/*.json`，而不是直接读取 Markdown 源文件

### 1.2 当前同步触发点
当前内容同步不会独立常驻运行，而是绑定在构建或显式内容构建动作上：

- 本地执行 `npm run build`
- 本地执行 `npm run build:content`
- hermes-zh 仓库自身触发的 CI verify/build
- Vercel/生产环境发生新一轮站点部署构建

也就是说：先有“构建/部署动作”，再有“内容读取与 manifest 刷新”。内容仓单独更新本身不会自动让线上站点刷新。

### 1.3 构建期间实际发生的事
1. `npm run build` 会先执行 `scripts/prepare-build-content.ts`，再执行 `next build`
2. `prepare-build-content.ts` 优先读取 `CONTENT_REPO_PATH` 指向的内容仓；未设置时默认读 `/opt/projects/awesome-hermes-agent-zh`
3. 如果找得到可用内容仓，就从内容仓加载页面、packs、route map，并生成：
   - `content-cache/generated/pages-manifest.json`
   - `content-cache/generated/routes-manifest.json`
   - `content-cache/generated/packs-manifest.json`
   - `content-cache/generated/search-index.json`
   - `content-cache/generated/build-meta.json`
4. Next.js 构建再消费这些生成结果
5. 如果运行环境没有可用内容仓，但仓库里已有已生成 manifest，则 `prepare-build-content.ts` 会直接复用这些生成文件完成构建；这是发布可用性 fallback，不应被表述为“已完成最新内容同步”

### 1.4 `sync:content` / `build:manifests` / `build` 的角色边界
- `sync:content`：通过 `resolveContentRoot()` 获取内容仓，生成页面 manifest 与基础 build meta
- `build:manifests`：通过 `resolveContentRoot()` 获取内容仓，生成页面、路由、packs、搜索索引等完整 manifest
- `build:content`：顺序执行 `sync:content` + `build:manifests`，适合本地或 CI 显式刷新 generated manifest
- `build`：执行 `prepare-build-content.ts` 后再 `next build`，是生产部署主入口
- `resolveContentRoot()` 在缺少本地内容仓时可以按 `CONTENT_REPO_URL` / `CONTENT_REPO_BRANCH` 克隆 fallback 内容仓；`prepare-build-content.ts` 当前不克隆，只在可用内容仓与已生成 manifest 之间二选一

从运行口径看，真正决定站点拿到哪一版内容的核心动作仍是“构建/部署”。

## 2. 为什么当前只能叫“半自动同步”

### 自动的部分
- 一旦有人触发构建，manifest 生成、校验、站点打包会自动完成
- CI 中可以自动校验 manifest 结构与 freshness

### 还不自动的部分
- 内容仓有新提交后，不会自动触发 hermes-zh 生产部署
- 线上站点不会因为内容仓变更而自己更新
- 当前没有“内容仓 push -> 站点 deploy”闭环
- 当前没有“部署成功 -> 自动 revalidate”的正式生产链路

所以它不是“实时同步”，而是“需要构建动作介入的同步”。

## 3. 为什么 `revalidate` 不能算同步
`app/api/revalidate/route.ts` 当前只负责：
- `revalidatePath`
- `revalidateTag`

它不负责：
- 拉取内容仓最新提交
- 重新生成 manifest
- 触发 `next build`
- 部署新版本

因此它只能算“缓存失效工具”，不能算“内容同步器”。

## 4. 当前 CI / 部署边界
- `.github/workflows/verify.yml` 只在 hermes-zh 仓库的 `push` / `pull_request` 上触发
- 该流程会 checkout 内容仓到 `_content_repo`，再执行 build 与 verify
- 这证明 hermes-zh 已具备“构建时消费内容仓”的能力
- 但它还不等于“内容仓更新就会自动把站点上线”

## 5. 当前正式对外口径
建议统一使用以下表述：

“当前 Hermes 中文站采用构建驱动的半自动同步。内容仓是唯一正式内容来源；当站点触发构建/部署时，会自动读取锚点分支内容并生成站点所需 manifest。内容仓更新后，暂时仍需要通过构建或部署动作把最新内容带到线上站点。”

### 5.1 口径边界表
| 问题 | 统一回答 |
|---|---|
| 内容仓是不是唯一真相源？ | 是，正式内容仍以 `awesome-hermes-agent-zh` 为准。 |
| 站点是否直接在线读 Markdown？ | 否，站点消费构建生成的 `content-cache/generated/*.json`。 |
| 内容仓提交后线上是否自动更新？ | 当前不会，需要触发 hermes-zh 构建/部署。 |
| `npm run build` 是否会准备内容？ | 会，先运行 `prepare-build-content.ts`，再运行 `next build`。 |
| `revalidate` 是否等于同步？ | 否，它只让已有构建版本的缓存失效，不拉内容、不生成 manifest、不部署。 |
| generated manifest fallback 是否代表最新？ | 否，它只是内容仓不可用时保证构建可继续的兜底。 |

避免使用以下容易误导的说法：
- “已经实时自动同步”
- “已经 webhook 全自动”
- “revalidate 就等于内容同步”
- “只要内容仓更新，线上站点就会自动更新”

## 6. 下一轮升级自动同步的最小方案
目标：先打通“内容仓更新后，站点自动重建并更新线上”的最小闭环，不在首轮就做复杂增量同步。

### 方案 A：内容仓 -> Vercel Deploy Hook（推荐最小落地）
1. 在内容仓 `site-content-anchor` 分支配置 GitHub Actions
2. 当该分支有新提交时，调用 hermes-zh 对应项目的 Vercel Deploy Hook
3. Vercel 收到 hook 后触发新一轮站点构建
4. 构建阶段继续使用现有逻辑读取内容仓并生成 manifest
5. 部署成功后，如需保险，再调用 `/api/revalidate` 刷新首页、docs、packs

优点：
- 改造最小
- 基本不需要重写现有内容构建逻辑
- 可以快速把口径升级为“内容仓提交可自动触发站点更新”

实施前置：
- Vercel 项目侧必须配置好可读取内容仓的构建环境，或确保构建阶段能拿到最新 generated manifest
- Deploy Hook URL 与 `REVALIDATE_TOKEN` 属于敏感信息，只能进入 GitHub/Vercel Secrets，不写入仓库与治理文件
- 首轮只监听 `site-content-anchor`，避免所有内容仓分支都触发生产部署

### 方案 B：内容仓 -> GitHub repository_dispatch -> hermes-zh workflow
1. 内容仓 push 后触发 workflow
2. workflow 调用 hermes-zh 的 `repository_dispatch` 或 `workflow_dispatch`
3. hermes-zh 在自己的 workflow 中 checkout 内容仓并构建
4. 再由 Vercel CLI / 平台完成部署

优点：
- 审计链路更完整
- 部署前后校验更容易放进同一工作流

代价：
- 比 Deploy Hook 多一层 workflow 编排

## 7. 下一轮最小验收标准
如果进入自动同步下一轮，建议以以下标准验收：

1. 内容仓 `site-content-anchor` 有新提交
2. hermes-zh 无需人工介入即可自动开始一次新部署
3. 新部署使用的是内容仓最新 SHA，并写入 `build-meta.json`
4. 线上首页 / docs / packs 能看到新内容
5. `revalidate` 只作为缓存兜底，不冒充同步主链路

## 8. 暂不纳入首轮的能力
以下能力可以后续再做，不必作为下一轮最小方案前置：
- 按页面差异做精准 path 级 revalidate
- 只重建受影响模块的增量内容管线
- 内容仓与站点仓双向状态看板
- 更细粒度的 webhook 安全签名与重试治理
- 在 Next.js 运行时动态拉取内容仓并现场生成 manifest

## 9. 运维检查命令
本地或 CI 可用以下命令确认当前同步链路是否健康：

```bash
npm run build:content
npm run verify:content
npm run verify:content:freshness
npm run build
```

关键检查点：
- `content-cache/generated/build-meta.json` 中的 `sourceSha` 应对应内容仓当前 HEAD
- `counts.pages` / `counts.routes` / `counts.packs` / `counts.search` 不应异常归零
- 如果执行的是生产构建，构建日志应出现 `[content-build] refreshed manifests ...`；若出现 `using checked-in generated manifests`，说明本次只是 fallback 构建，需要单独评估内容新鲜度

## 10. 当前结论
当前机制已经不是“手工复制内容”，但也还不是“内容仓一变线上立刻自动更新”。

最准确的说法就是：
- 现在：构建驱动的半自动同步
- 下一轮最小升级：内容仓提交自动触发站点部署，部署后按需 revalidate
