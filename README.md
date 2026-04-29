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
npm run verify:content
```

## 环境变量
- `CONTENT_REPO_PATH`：默认 `/opt/projects/awesome-hermes-agent-zh`
- `CONTENT_REPO_BRANCH`：默认 `site-content-anchor`

## 生产运维约定
- canonical host 固定为 `https://hermes-zh.com`
- `middleware.ts` 负责在同一 Vercel 项目内将 `www.hermes-zh.com/*` 308 到 apex 对应路径
- `npm run build` 会生成 `content-cache/generated/build-meta.json`，记录 source branch / SHA / generatedAt / counts
- `npm run verify:content` 校验 manifest 结构与 `build-meta.json`
- `npm run verify:content:freshness` 校验 manifest 时效与 source SHA 是否匹配当前内容仓 HEAD
- `app/api/revalidate/route.ts` 只用于缓存失效；它不是内容同步器，也不替代 `build` / `build:manifests`

当前实现先以本地仓库路径读取锚点分支内容，并在源仓规范未完全落地时使用最小样板数据保证站点可运行。
