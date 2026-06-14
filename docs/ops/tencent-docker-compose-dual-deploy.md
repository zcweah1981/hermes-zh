# Hermes 中文站双部署与腾讯云 Docker Compose 运行指南

更新时间：2026-06-15

## 1. 文档目标

本文是 `hermes-zh` 代码仓的部署指导文档，用于约束后续把 Hermes 中文站从单一 Vercel 部署，扩展为：

- Vercel 继续保留并持续部署；
- 腾讯云轻量服务器通过 Docker Compose 部署；
- 更新代码并要求部署时，必须同时完成 Vercel 与腾讯云两条部署链验证；
- 内容仓和代码仓继续保持 GitHub 双仓架构；
- 百度、Bing、IndexNow 能力继续支持；
- 腾讯云侧先使用二级测试域名或 `www.leleaiai.com` 灰度部署，不直接切 `hermes-zh.com` 主域名。

本文不包含任何运行时凭据、密钥、服务器密码或私有凭据。

---

## 2. 项目仓库与真相源

### 2.1 内容仓

- GitHub：`zcweah1981/awesome-hermes-agent-zh`
- 本地常用路径：`/opt/projects/awesome-hermes-agent-zh`
- 职责：正式中文内容、packs 元数据、route map、图片和下载资源。
- 原则：正式页面内容必须先进入内容仓，代码仓不得成为第二套内容后台。

### 2.2 代码仓

- GitHub：`zcweah1981/hermes-zh`
- 本地常用路径：`/opt/projects/hermes-zh`
- 职责：Next.js 渲染、内容同步、manifest 构建、搜索索引、SEO/GEO 输出、Docker 镜像构建、部署配置。

### 2.3 双部署结论

`main` 分支是统一发布入口。以后凡是“更新代码并要求部署”，必须同时满足：

1. GitHub `main` 已更新；
2. Vercel 部署链保持可用；
3. GHCR Docker 镜像已构建并可拉取；
4. 腾讯云 `/opt/hermes-zh` 已通过 `docker compose pull && docker compose up -d` 更新；
5. Vercel 与腾讯云测试域名都完成基础访问与 SEO 入口验证。

---

## 3. 当前推荐架构

```text
内容仓 zcweah1981/awesome-hermes-agent-zh
  ↓
代码仓 zcweah1981/hermes-zh
  ↓
GitHub Actions verify / content sync / docker image
  ├─ Vercel 部署 hermes-zh.com（暂时保留）
  └─ GHCR 镜像 ghcr.io/zcweah1981/hermes-zh
        ↓
      腾讯云轻量服务器 /opt/hermes-zh
        ↓
      docker compose pull && docker compose up -d
        ↓
      已有 Caddy Docker Compose 专用网络
        ↓
      测试二级域名或 www.leleaiai.com
```

---

## 4. 本地开发运行方式

### 4.1 安装依赖

```bash
cd /opt/projects/hermes-zh
npm ci
```

### 4.2 同步内容并构建 manifest

如果内容仓在本机：

```bash
cd /opt/projects/hermes-zh
CONTENT_REPO_PATH=/opt/projects/awesome-hermes-agent-zh npm run build:content
```

如果只想使用代码仓内已提交的 `content-cache/generated`，可以不手动同步。

### 4.3 启动开发服务

```bash
cd /opt/projects/hermes-zh
npm run dev
```

默认访问：

```text
http://127.0.0.1:3000
```

### 4.4 本地质量门禁

代码修改后至少运行：

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run smoke
npm run verify:content
```

如果改动涉及内容 freshness：

```bash
CONTENT_REPO_PATH=/opt/projects/awesome-hermes-agent-zh npm run verify:content:freshness
```

---

## 5. Vercel 部署链

### 5.1 保留原则

腾讯云 Docker 部署上线前后，Vercel 暂时继续保留。不得因为 Docker 改造破坏现有 Vercel 部署。

当前生产主站仍按既有策略可由 Vercel 承载：

```text
https://hermes-zh.com
```

### 5.2 Vercel 相关验收

每次代码更新并要求部署时，Vercel 链路必须确认：

- GitHub Actions `verify` 通过；
- Vercel 最新部署成功；
- `hermes-zh.com` 首页可访问；
- `/docs/start` 可访问；
- `/sitemap.xml` 可访问；
- `/robots.txt` 可访问；
- `/llms.txt` 可访问；
- `/ai-index` 可访问。

建议验证命令：

```bash
curl -I https://hermes-zh.com/
curl -I https://hermes-zh.com/docs/start
curl -I https://hermes-zh.com/sitemap.xml
curl -I https://hermes-zh.com/robots.txt
curl -I https://hermes-zh.com/llms.txt
curl -I https://hermes-zh.com/ai-index
```

### 5.3 不允许事项

- 不允许移除现有 Vercel workflow 或影响 Vercel 构建；
- 不允许把 Vercel / Cloudflare / SEO 运行时凭据写入仓库；
- 不允许在未确认前把 `hermes-zh.com` DNS 切到腾讯云；
- 不允许让测试域名抢占正式 canonical。

---

## 6. 腾讯云 Docker Compose 部署链

### 6.1 部署模式

采用方案 A：镜像拉取更新。

服务器不构建源码，不 clone 内容仓，不在生产机执行 Next.js build。生产机只做：

```bash
docker compose pull
docker compose up -d
```

### 6.2 服务器目录

腾讯云轻量服务器固定目录：

```text
/opt/hermes-zh/
  docker-compose.yml
  runtime-env
  deploy.sh
  README.md
```

### 6.3 Caddy 前置条件

服务器上已经存在 Caddy，并且 Caddy 也是 Docker Compose 部署。Hermes 容器需要加入 Caddy 使用的 external Docker network。

必须先确认 Caddy 网络名：

```bash
docker network ls
```

示例网络名：

```text
caddy_net
caddy_default
proxy
```

实际部署时以服务器真实网络名为准。

### 6.4 `/opt/hermes-zh/docker-compose.yml` 示例

```yaml
services:
  hermes-zh:
    image: ghcr.io/zcweah1981/hermes-zh:latest
    container_name: hermes-zh
    restart: unless-stopped
    env_file:
      - runtime-env
    expose:
      - "3018"
    networks:
      - caddy_net
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://127.0.0.1:3018/"]
      interval: 30s
      timeout: 5s
      retries: 5
      start_period: 30s

networks:
  caddy_net:
    external: true
```

说明：

- `image` 初期用 `latest`，方便灰度阶段拉取更新；
- 正式切主域名前建议改用 commit SHA tag；
- `expose` 只暴露给 Docker 网络，不直接开放公网 3018；
- `caddy_net` 必须替换为服务器上 Caddy 的真实 external network。

### 6.5 `/opt/hermes-zh/runtime-env` 示例

```text
NODE_ENV=production
PORT=3018
HOSTNAME=0.0.0.0
NEXT_PUBLIC_GA_MEASUREMENT_ID=<GA_MEASUREMENT_ID>
SITE_URL=https://hermes-zh.com
```

灰度阶段建议 `SITE_URL` 仍保持 `https://hermes-zh.com`，避免测试域名生成自己的 canonical 与 sitemap 主体。

如果未来确认 `www.leleaiai.com` 成为阶段性正式收录域名，才允许调整为：

```env
SITE_URL=https://www.leleaiai.com
INDEXNOW_HOST=www.leleaiai.com
```

这个切换必须单独确认，不能在灰度测试时擅自修改。

### 6.6 `/opt/hermes-zh/deploy.sh` 示例

```bash
#!/usr/bin/env bash
set -euo pipefail

cd /opt/hermes-zh

docker compose pull
docker compose up -d
docker image prune -f

docker compose ps
```

授权：

```bash
chmod +x /opt/hermes-zh/deploy.sh
```

更新：

```bash
cd /opt/hermes-zh
./deploy.sh
```

### 6.7 Caddyfile 示例

如果使用 `www.leleaiai.com`：

```caddyfile
www.leleaiai.com {
  encode gzip zstd
  reverse_proxy hermes-zh:3018
}
```

如果使用测试子域名，例如 `hermes.leleaiai.com`：

```caddyfile
hermes.leleaiai.com {
  encode gzip zstd
  reverse_proxy hermes-zh:3018
}
```

Caddy 与 Hermes 必须在同一个 Docker network 中，否则 `reverse_proxy hermes-zh:3018` 无法解析。

---

## 7. Docker 镜像构建要求

### 7.1 镜像仓库

推荐使用 GHCR：

```text
ghcr.io/zcweah1981/hermes-zh:latest
ghcr.io/zcweah1981/hermes-zh:<git-sha>
```

### 7.2 Tag 策略

灰度阶段：

```text
latest
```

正式阶段：

```text
<git-sha>
```

推荐正式阶段 `docker-compose.yml` 使用 SHA tag，例如：

```yaml
image: ghcr.io/zcweah1981/hermes-zh:cf7eb5b
```

这样便于精确回滚。

### 7.3 Dockerfile 要求

代码仓需要支持多阶段构建：

1. `deps`：`npm ci`
2. `builder`：`npm run build`
3. `runner`：只复制生产运行所需文件

Next.js 推荐启用：

```ts
output: 'standalone'
```

Docker 镜像不得包含：

- 本地运行时环境文件
- 运行时凭据或密钥；
- `.git`；
- 本地 artifacts；
- Lighthouse trace 大文件；
- node_modules 开发缓存。

### 7.4 `.dockerignore` 要求

至少排除：

```text
.git
node_modules
.next
out
coverage
runtime-env
.vercel
artifacts
npm-debug.log*
```

注意不要排除必要的生产资源：

```text
public
content-cache/generated
content-cache/content-lock.json
package.json
package-lock.json
```

---

## 8. GitHub Actions 要求

### 8.1 保留现有 workflow

以下 workflow 不得删除或破坏：

```text
.github/workflows/verify.yml
.github/workflows/content-auto-sync.yml
.github/workflows/indexnow-submit.yml
.github/workflows/preview.yml
```

### 8.2 新增 Docker 镜像 workflow

建议新增：

```text
.github/workflows/docker-image.yml
```

触发：

```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:
```

必须先跑完整质量门禁，再 build/push 镜像：

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm run smoke
npm run verify:content
npm run verify:content:freshness
```

然后：

```bash
docker build
docker push ghcr.io/zcweah1981/hermes-zh:latest
docker push ghcr.io/zcweah1981/hermes-zh:<git-sha>
```

### 8.3 内容仓参与构建

Docker image workflow 必须 checkout 内容仓：

```text
zcweah1981/awesome-hermes-agent-zh
```

并设置：

```bash
CONTENT_REPO_PATH=${{ github.workspace }}/_content_repo
```

确保镜像内使用的是与 GitHub Actions 验证一致的内容快照。

---

## 9. 百度、Bing、IndexNow 支持

### 9.1 站点必须继续输出 SEO/GEO 入口

无论 Vercel 还是腾讯云部署，都必须保证：

```text
/sitemap.xml
/robots.txt
/llms.txt
/ai-index
/docs/*
/packs
```

访问正常。

### 9.2 提交任务不放入容器启动流程

不建议在 Next.js 容器启动时自动提交百度、Bing、IndexNow。

原因：

- 容器重启会重复提交；
- 运行时凭据不应进入生产容器;
- 搜索提交应由 GitHub Actions 或受控运维任务执行；
- 灰度测试域名不应误提交。

### 9.3 IndexNow 域名策略

当前正式 SEO 主体仍建议保持：

```text
hermes-zh.com
```

因此灰度部署到 `www.leleaiai.com` 或二级测试域名时，默认：

- 不主动提交测试域名到 IndexNow；
- 不主动提交测试域名到百度；
- 不主动提交测试域名到 Bing；
- canonical 仍指向 `hermes-zh.com`。

只有当用户明确确认 `www.leleaiai.com` 作为阶段性正式收录域名时，才可调整：

```text
SITE_URL=https://www.leleaiai.com
INDEXNOW_HOST=www.leleaiai.com
```

并同步调整百度 / Bing 站点平台配置。

---

## 10. 腾讯云测试域名策略

### 10.1 推荐灰度域名

优先使用：

```text
hermes.leleaiai.com
```

或：

```text
www.leleaiai.com
```

具体以腾讯云备案、DNS 与 Caddy 当前配置为准。

### 10.2 灰度阶段 SEO 规则

灰度阶段默认不要抢 SEO：

- 不提交测试域名 sitemap；
- 不让测试域名成为 canonical 主体；
- 不修改正式 `hermes-zh.com` 的搜索资产；
- 可以考虑由 Caddy 对灰度域名加 `X-Robots-Tag: noindex`，但如果要验证真实 SEO headers，需要先明确测试目标。

### 10.3 Caddy noindex 示例

如果决定灰度域名不收录：

```caddyfile
hermes.leleaiai.com {
  encode gzip zstd
  header X-Robots-Tag "noindex, nofollow"
  reverse_proxy hermes-zh:3018
}
```

如果要验证完整 SEO 输出，则不要加 noindex，但也不要主动提交搜索引擎。

---

## 11. 每次“更新代码并要求部署”的标准流程

### 11.1 代码阶段

```bash
cd /opt/projects/hermes-zh
git status --short --branch
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm run smoke
npm run verify:content
npm run verify:content:freshness
```

确认无异常后提交并推送：

```bash
git add <changed-files>
git commit -m "type(scope): message"
git push origin main
```

### 11.2 GitHub 阶段

必须检查：

- `verify` workflow 通过；
- `docker-image` workflow 通过；
- 如内容变化触发 `content-auto-sync`，也必须检查其结果；
- 如涉及 IndexNow，检查 `indexnow-submit` 结果。

### 11.3 Vercel 阶段

确认 Vercel 最新部署成功，并验证：

```bash
curl -I https://hermes-zh.com/
curl -I https://hermes-zh.com/docs/start
curl -I https://hermes-zh.com/sitemap.xml
curl -I https://hermes-zh.com/robots.txt
curl -I https://hermes-zh.com/llms.txt
curl -I https://hermes-zh.com/ai-index
```

### 11.4 腾讯云阶段

服务器执行：

```bash
cd /opt/hermes-zh
./deploy.sh
```

或手动：

```bash
cd /opt/hermes-zh
docker compose pull
docker compose up -d
docker compose ps
```

### 11.5 腾讯云域名验证

替换 `TEST_HOST` 为实际测试域名：

```bash
TEST_HOST=https://www.leleaiai.com

curl -I $TEST_HOST/
curl -I $TEST_HOST/docs/start
curl -I $TEST_HOST/sitemap.xml
curl -I $TEST_HOST/robots.txt
curl -I $TEST_HOST/llms.txt
curl -I $TEST_HOST/ai-index
```

还要检查旧 URL redirect：

```bash
curl -I $TEST_HOST/quick-start.html
curl -I $TEST_HOST/docs/quick-start
curl -I $TEST_HOST/solutions/xiaohongshu
```

### 11.6 完成汇报必须包含

每次部署完成必须汇报：

- commit SHA；
- GitHub Actions `verify` run id 与 conclusion；
- Docker image workflow run id 与 pushed tag；
- Vercel deployment URL / 状态；
- 腾讯云部署时间；
- 腾讯云容器状态；
- 测试域名；
- 关键 URL 验证结果；
- 是否触发百度 / Bing / IndexNow；
- 是否有阻塞和回滚建议。

---

## 12. 回滚方案

### 12.1 Vercel 回滚

Vercel 仍保留时，可以在 Vercel 控制台回滚到上一个成功 deployment。

也可以通过 Git 回退后重新 push，但生产紧急回滚优先使用 Vercel deployment rollback。

### 12.2 腾讯云回滚

如果使用 SHA tag，回滚最稳：

```yaml
image: ghcr.io/zcweah1981/hermes-zh:<previous-good-sha>
```

然后：

```bash
cd /opt/hermes-zh
docker compose pull
docker compose up -d
```

如果仍使用 `latest`，需要先确认旧镜像是否还在本地：

```bash
docker images ghcr.io/zcweah1981/hermes-zh
```

正式切主域名前，建议不要只依赖 `latest`。

### 12.3 DNS 回滚

在未完成备案与正式切换前，`hermes-zh.com` 不应指向腾讯云。

如果未来切换主域名，必须保留：

- 原 Vercel 回滚入口；
- Cloudflare DNS 回滚记录；
- 腾讯云 Caddy 配置回滚版本；
- 搜索提交暂停开关。

---

## 13. 首次腾讯云上线验收清单

### 13.1 服务器

- [ ] `/opt/hermes-zh/docker-compose.yml` 存在；
- [ ] `/opt/hermes-zh/runtime-env` 存在且不入仓；
- [ ] `/opt/hermes-zh/deploy.sh` 可执行；
- [ ] `docker compose pull` 成功；
- [ ] `docker compose up -d` 成功；
- [ ] 容器加入 Caddy external network；
- [ ] 不暴露公网 3000；
- [ ] `docker compose ps` healthy；
- [ ] 服务器重启后容器自动恢复。

### 13.2 Caddy

- [ ] Caddyfile 有对应测试域名；
- [ ] Caddy 与 Hermes 容器在同一 network；
- [ ] `reverse_proxy hermes-zh:3018` 可解析；
- [ ] HTTPS 正常；
- [ ] gzip/zstd 正常；
- [ ] 如灰度 noindex，则 header 正确。

### 13.3 页面

- [ ] `/` 200；
- [ ] `/docs/start` 200；
- [ ] `/docs/solutions` 200；
- [ ] `/docs/china` 200；
- [ ] `/packs` 200；
- [ ] `/sitemap.xml` 200；
- [ ] `/robots.txt` 200；
- [ ] `/llms.txt` 200；
- [ ] `/ai-index` 200；
- [ ] 旧路径 redirect 正常；
- [ ] 页面视觉与 Vercel 对齐。

### 13.4 SEO / IndexNow

- [ ] 灰度域名未误提交；
- [ ] canonical 未误切；
- [ ] sitemap host 符合当前阶段策略；
- [ ] 百度 / Bing / IndexNow 运行时凭据未进入镜像；
- [ ] 只有正式确认后才切换 `SITE_URL` 和 `INDEXNOW_HOST`。

---

## 14. 后续启用 CDN / 主域名切换前置条件

未来是否启用 CDN、是否从 Vercel 切到腾讯云，需要另行确认。正式切换前必须满足：

1. 腾讯云测试域名稳定运行至少一个观察周期；
2. Docker 镜像支持 SHA tag 回滚；
3. Caddy headers 与缓存策略验收通过；
4. Lighthouse / PSI 指标不明显退化；
5. 百度 / Bing / IndexNow 策略明确；
6. `hermes-zh.com` 备案 / 接入条件明确；
7. Cloudflare / DNS 回滚路径明确；
8. 用户确认切换窗口。

---

## 15. 当前阶段建议

当前阶段只做三件事：

1. 代码仓支持 Dockerfile、Compose 示例、GHCR 镜像发布；
2. 腾讯云 `/opt/hermes-zh` 用测试域名灰度跑通；
3. 每次更新代码并要求部署时，Vercel 与腾讯云同时验证。

暂不做：

- 不切 `hermes-zh.com` 主域名；
- 不关闭 Vercel；
- 不让测试域名主动提交百度 / Bing / IndexNow；
- 不把密钥写进镜像、仓库或文档。
