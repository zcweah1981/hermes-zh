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

当前实现先以本地仓库路径读取锚点分支内容，并在源仓规范未完全落地时使用最小样板数据保证站点可运行。
