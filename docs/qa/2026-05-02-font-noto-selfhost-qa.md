# 2026-05-02 Noto 字体 self-host QA Proof

任务ID：`hermes-zh:FONT-NOTO-SELFHOST-QA`  
执行人：Hyoga / OPS  
时间：2026-05-02 05:59 UTC  
代码仓：`/opt/projects/hermes-zh`  
分支：`feature/font-noto-selfhost`  
本地 HEAD：`5a33bb336e6f0622b368776e3c1a56bfe75548f4`

## 1. 改动范围核验

当前工作区存在 Noto 字体 self-host 相关改动：

- `app/globals.css`
  - 新增 `@font-face`：`Noto Sans SC` → `/fonts/noto-sans-sc.woff2`
  - 新增 `@font-face`：`Noto Serif SC` → `/fonts/noto-serif-sc.woff2`
  - `font-display: swap`
  - CSS 变量继续指向 Noto / JetBrains Mono 字体栈
- `tailwind.config.ts`
  - `fontFamily.sans` 优先使用 `Noto Sans SC`
  - `fontFamily.serif` 优先使用 `Noto Serif SC`
  - `fontFamily.mono` 保持 `JetBrains Mono` 优先
- `tests/performance/font-loading.test.ts`
  - 新增 self-host 字体断言：禁止 Google Fonts runtime、检查本地 WOFF2、检查字体变量
- `public/fonts/`
  - `noto-sans-sc.woff2`
  - `noto-serif-sc.woff2`

## 2. 字体文件 proof

本地文件验证：

```text
public/fonts/noto-sans-sc.woff2: size=11426032 magic=b'wOF2'
public/fonts/noto-serif-sc.woff2: size=17776316 magic=b'wOF2'
public/fonts/noto-sans-sc.woff2: Web Open Font Format (Version 2), CFF, length 11426032, version 2.262
public/fonts/noto-serif-sc.woff2: Web Open Font Format (Version 2), CFF, length 17776316, version 2.131
```

结论：两个字体文件均为真实 WOFF2，不是空占位。

## 3. 本地工程验证

执行命令：

```bash
npm run typecheck && npm run lint && npm test -- --runInBand && npm run build
```

结果：通过。

摘要：

- Typecheck：通过
- Lint：通过，`--max-warnings=0`
- Test：通过，`68/68 passed`
- Build：通过，Next.js 15.5.15，`Compiled successfully`，静态页 `20/20`
- Build 内容源：`/opt/projects/hermes-zh/.content-cache/awesome-hermes-agent-zh-main`

字体相关测试 suite：

- `does not use runtime Google Fonts or gstatic font hosts`：通过
- `defines self-hosted Noto Sans SC and Noto Serif SC font faces in site CSS`：通过
- `commits the local font binaries used by the stylesheet`：通过
- `defines CSS font variables used by custom homepage selectors`：通过

## 4. 本地生产服务与字体命中 proof

本地生产服务：

```bash
PORT=3102 npm run start
```

### 4.1 HTTP / 字体资源

首页：

```text
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
```

字体资源：

```text
GET /fonts/noto-sans-sc.woff2
HTTP/1.1 200 OK
Content-Type: font/woff2
Content-Length: 11426032
```

### 4.2 CSS 资源检查

线上生成 CSS（本地生产服务）检查结果：

```json
{
  "css_paths": ["/_next/static/css/19882d04c8fc937f.css"],
  "google": false,
  "font_urls": ["/fonts/noto-sans-sc.woff2", "/fonts/noto-serif-sc.woff2"],
  "has_noto_sans": true,
  "has_noto_serif": true
}
```

HTML 本身检查：

```json
{
  "googleapis": false,
  "font_paths_in_html": [],
  "font_face_in_html": false
}
```

结论：页面不再通过 runtime Google Fonts / gstatic 加载字体；字体声明进入站点 CSS，并指向本地 `/fonts/*.woff2`。

## 5. 浏览器字体命中 proof

### 5.1 首页

URL：`http://127.0.0.1:3102/?fontqa=1`

浏览器 DOM / Performance 查询结果：

```json
{
  "fontsStatus": "loaded",
  "checks": {
    "notoSans": true,
    "notoSerif": true
  },
  "fontResources": [
    "http://127.0.0.1:3102/fonts/noto-sans-sc.woff2",
    "http://127.0.0.1:3102/fonts/noto-serif-sc.woff2"
  ],
  "googleFontRuntime": false,
  "samples": [
    {
      "selector": "body",
      "fontFamily": "\"Noto Sans SC\", \"PingFang SC\", \"Microsoft YaHei\", sans-serif"
    },
    {
      "selector": "h1",
      "fontFamily": "\"Noto Serif SC\", \"Songti SC\", serif",
      "fontWeight": "900"
    },
    {
      "selector": ".site-capability-title-block h2",
      "fontFamily": "\"Noto Serif SC\", \"Songti SC\", serif",
      "fontWeight": "900"
    }
  ]
}
```

视觉截图：`/root/.hermes/profiles/ops/cache/screenshots/browser_screenshot_0aee21983d6e4a3b854ad9de12c64d5c.png`

视觉结论：Hero 标题完整，中文清晰，无乱码、无方框字、无明显异常 fallback，也未见标题裁切。

### 5.2 Docs 页面

URL：`http://127.0.0.1:3102/docs/start?fontqa=1`

浏览器 DOM / Performance 查询结果：

```json
{
  "fontsStatus": "loaded",
  "checks": {
    "notoSans": true,
    "notoSerif": false
  },
  "fontResources": [
    "http://127.0.0.1:3102/fonts/noto-sans-sc.woff2",
    "http://127.0.0.1:3102/fonts/noto-serif-sc.woff2"
  ],
  "googleFontRuntime": false,
  "samples": [
    {
      "selector": "body",
      "fontFamily": "\"Noto Sans SC\", \"PingFang SC\", \"Microsoft YaHei\", sans-serif"
    },
    {
      "selector": "article h1",
      "fontFamily": "\"Noto Sans SC\", \"PingFang SC\", \"Microsoft YaHei\", sans-serif",
      "fontWeight": "900"
    },
    {
      "selector": ".site-doc-sidebar-shell",
      "fontFamily": "\"Noto Sans SC\", \"PingFang SC\", \"Microsoft YaHei\", sans-serif"
    }
  ]
}
```

说明：Docs 页面正文与目录使用 `Noto Sans SC`；该页面没有使用 serif 标题，因此 `document.fonts.check('32px "Noto Serif SC"')` 返回 false 不构成问题。首页已验证 serif 命中。

视觉截图：`/root/.hermes/profiles/ops/cache/screenshots/browser_screenshot_37975d9cfd79465aa8d13b962b51860a.png`

视觉结论：左侧目录和正文均清晰可读，无乱码、无方框字、无明显 fallback。

### 5.3 Console proof

首页与 `/docs/start` 页面浏览器 console：

```json
{
  "console_messages": [],
  "js_errors": [],
  "total_messages": 0,
  "total_errors": 0
}
```

## 6. 生产可部署 / 线上状态

### 6.1 本地生产构建可部署性

`npm run build` 已通过，生产服务 `npm run start` 可正常返回 200，字体资源本地可被 Next static server 以 `font/woff2` 返回。

### 6.2 线上当前状态核验

当前生产域名 `https://hermes-zh.com/` 返回 200，但线上 CSS 仍未包含本次 self-host 字体资源：

```json
{
  "prod_html_google": false,
  "css_paths": ["/_next/static/css/a1aad416a40a0429.css"],
  "css_google": false,
  "font_urls": [],
  "has_noto": false
}
```

结论：生产站当前尚未反映本地 self-host 改动。

### 6.3 部署 blocker

Vercel CLI 可用，`.vercel/project.json` 存在，但当前运行环境没有 Vercel 登录态或 token：

```text
VERCEL_TOKEN_present=False
/root/.vercel/auth.json present=False
vercel whoami -> Error: No existing credentials found. Please run `vercel login` or pass "--token"
```

因此本轮无法直接执行 `vercel deploy --prod` 并回收生产字体命中 proof。该阻塞属于外部部署凭据缺失，不是构建或代码问题。

## 7. 结论

本地 QA 通过：

- Self-host 字体文件存在且为真实 WOFF2。
- `@font-face` 指向本地 `/fonts/noto-sans-sc.woff2` 与 `/fonts/noto-serif-sc.woff2`。
- Runtime 不再访问 Google Fonts / gstatic。
- Typecheck / lint / test / build 全部通过。
- 本地生产服务字体资源 200，Content-Type 为 `font/woff2`。
- 浏览器 Performance 只命中本地字体资源。
- 首页与 Docs 视觉无乱码、方框字、明显 fallback 或标题裁切。

未完成项：生产部署 proof 被 Vercel 凭据缺失阻塞。补齐 `VERCEL_TOKEN` 或登录态后，可直接执行生产部署并复用本文件第 4–5 节检查项做线上验收。

## 8. 风险 / 建议

1. 字体文件较大：`Noto Sans SC` 约 11.4 MB，`Noto Serif SC` 约 17.8 MB。self-host 已消除 Google runtime 依赖，但后续建议评估字体子集化，降低首屏字体下载成本。
2. `eslint.config.mjs` 仍包含 `@next/next/no-page-custom-font: off`，在当前 self-host 方案下可能不是必需项；建议 Dev 复核是否可移除，避免保留上一轮 Google stylesheet 方案的遗留配置。
3. 生产站未更新前，不应对外宣称线上 self-host 已完成；当前只能宣称“本地构建与可部署性已通过，生产部署等待 Vercel 凭据”。
