# 内容仓自动同步 Runbook

## 目标

当内容仓 `zcweah1981/awesome-hermes-agent-zh` 的 `main` 分支出现 docs、packs、assets 或治理映射变更时，自动触发站点仓 `zcweah1981/hermes-zh` 的 `repository_dispatch` workflow，站点仓锁定具体内容 SHA、重新生成 manifests，并由 Vercel 的 GitHub 集成发布新版本。

## 链路

1. 内容仓 `main` push 命中内容路径过滤。
2. 内容仓 `trigger-hermes-zh-content-sync` workflow 先执行内容结构校验。
3. 校验通过后，内容仓使用 GitHub Secret `SITE_REPO_DISPATCH_TOKEN` 调用站点仓 `repository_dispatch`。
4. 站点仓 `content-auto-sync` workflow 接收 `content-updated` 事件。
5. 站点仓 checkout 内容仓到 payload 中的 `content_sha`。
6. 站点仓执行 typecheck、lint、test、build、smoke、content verify 与 freshness 校验。
7. 校验通过后写入 `content-cache/content-lock.json`，并提交 `content-cache/generated/*.json`。
8. 站点仓 workflow 使用 `VERCEL_TOKEN` / `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` 执行 Vercel CLI 生产部署，避免 GitHub Actions bot commit 不触发后续 GitHub/Vercel 自动部署的问题。

## 必需 Secret

内容仓需要配置：

- `SITE_REPO_DISPATCH_TOKEN`

权限要求：该 token 只需要能对 `zcweah1981/hermes-zh` 调用 `repository_dispatch`。建议使用 fine-grained token，限定目标仓库，并只给 Contents read/write 或 Actions 触发所需最小权限。不要把 token 写入仓库、治理文件或聊天记录。

站点仓还需要配置生产部署 Secret：

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

这些值只用于 `content-auto-sync` workflow 在内容锁定成功后执行 Vercel CLI 生产部署；不要写入仓库、治理文件或聊天记录。

站点仓可选配置：

- `TELEGRAM_BOT_TOKEN`（GitHub Secret）
- `TELEGRAM_CHAT_ID`（优先 GitHub Secret，也可用 GitHub Actions Variable）

这两个值只用于失败通知；未配置时不影响主链路。

## 内容锁文件

站点仓锁文件：`content-cache/content-lock.json`。

字段：

- `contentRepo`：内容仓 owner/repo。
- `contentRef`：内容 ref 标签，默认 `main`。
- `contentSha`：本次站点构建锁定的内容仓完整 40 位 SHA。
- `lockedAt`：锁定时间。
- `sourceWorkflowRun`：上游内容仓 workflow run id 或手动回放 run id。
- `sourceActor`：触发人。

验收时必须确认 `content-cache/content-lock.json.contentSha` 与 `content-cache/generated/build-meta.json.sourceSha` 一致。

## 同 SHA 跳过

站点 workflow 会先读取当前 `content-cache/content-lock.json`。如果收到的 `content_sha` 与当前锁文件一致，workflow 会在 summary 记录 “同 SHA 已锁定”，然后跳过 rebuild 和 commit，避免重复部署风暴。

## 手动回放

在站点仓 GitHub Actions 中打开 `content-auto-sync` workflow，使用 `workflow_dispatch` 输入：

- `content_sha`：要回放的内容仓完整 SHA。
- `content_ref`：通常填 `main`。
- `source_actor`：可填触发人或 `manual`。

适用场景：

- 自动 dispatch 因外部 token 缺失失败后补跑。
- 回滚到旧内容 SHA。
- 验证某个历史内容版本是否仍可构建。

## 回滚

推荐两种回滚方式：

1. **revert 站点仓自动同步 commit**
   - 回滚 `content-cache/content-lock.json` 和 `content-cache/generated/*.json` 到上一版。
   - 由站点仓 main 新 commit 触发 Vercel 重新部署。

2. **workflow_dispatch 指定旧内容 SHA**
   - 在站点仓手动运行 `content-auto-sync`。
   - 输入旧的 `content_sha`。
   - 校验通过后生成新的锁定 commit。

两种方式都必须在部署后验证首页、六大入口、Packs、sitemap、robots 和 llms/ai-index。

## 失败处理

- 内容仓校验失败：不会触发站点仓 dispatch；先修内容仓 docs、packs、route map 或治理文件。
- 缺少 `SITE_REPO_DISPATCH_TOKEN`：内容仓 workflow 明确失败，不会打印 secret。
- 站点仓构建失败：不会提交新 lock，线上保留上一版成功部署。
- Vercel 部署失败：回看站点仓自动同步 commit 和 Vercel build log；必要时 revert。

## 验收命令

```bash
# 本地 YAML 解析
python3 - <<'PY'
from pathlib import Path
import yaml
for path in [
  Path('/opt/projects/awesome-hermes-agent-zh/.github/workflows/trigger-hermes-zh-content-sync.yml'),
  Path('/opt/projects/hermes-zh/.github/workflows/content-auto-sync.yml'),
]:
    data = yaml.safe_load(path.read_text())
    assert data.get('name')
    assert data.get(True) or data.get('on')
    print('ok', path)
PY

# 站点仓验证
cd /opt/projects/hermes-zh
npm run typecheck
npm test -- --runInBand
npm run build
```

## 注意

- `repository_dispatch` 是自动同步主链路；`/api/revalidate` 只能作为缓存失效兜底，不能替代内容同步与 manifest 重建。
- 不要把站点代码仓当作第二内容后台；正式内容仍以内容仓为真相源。
