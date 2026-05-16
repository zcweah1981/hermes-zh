# 2026-05-16 中文字体子集化 Spike

任务ID：`hermes-zh:FOT-OPTIMIZATION-20260516:T8-FONT-SUBSET-SPIKE`  
执行人：Long / DEV  
代码仓：`/opt/projects/hermes-zh`

## 1. 审计结论

### 字体来源与当前引用

- 字体文件：
  - `public/fonts/noto-sans-sc.woff2`
  - `public/fonts/noto-serif-sc.woff2`
- 来源线索：仓库内既有 QA 文档 `docs/qa/2026-05-02-font-noto-selfhost-qa.md` 记录了 self-host Noto 字体引入与验证；文件 metadata 显示：
  - Sans：WOFF2 / CFF / version 2.262
  - Serif：WOFF2 / CFF / version 2.131
- 引用路径：`app/globals.css` 的 `@font-face` 直接引用 `/fonts/noto-sans-sc.woff2` 与 `/fonts/noto-serif-sc.woff2`，Tailwind 字体栈在 `tailwind.config.ts` 中优先使用 Noto SC。

### 实际使用范围

- `Noto Sans SC`：全站 body / docs 正文 / 导航 / 卡片 / 搜索等默认中文 UI。
- `Noto Serif SC`：营销首页 Hero、站点 Header 品牌字、部分 marketing section heading、pack detail 标题、section card 非 docs 标题等 `font-serif` 场景。
- 原字体覆盖范围：约 44.8k Unicode cmap，属于完整大 CJK 字体；对当前中文站首屏/导航/docs/生成内容而言明显过量。

## 2. 最小可行优化方案

新增脚本：`scripts/optimize-fonts.py`

- 从以下仓库可见文本收集字符集：`app/`、`components/`、`lib/`、`content-cache/generated/`、`docs/`。
- 额外保留 ASCII、常用中英文标点、CJK 标点与全角标点范围。
- 使用 `fonttools/pyftsubset` 从原始大字体生成 WOFF2 子集。
- 写出 `public/fonts/subset-chars.txt`，便于审计当前子集字符来源。
- 直接覆盖生产引用文件名：
  - `public/fonts/noto-sans-sc.woff2`
  - `public/fonts/noto-serif-sc.woff2`
- CSS 路径保持不变，避免联动修改缓存治理规则；回滚依赖 git 二进制 diff 或脚本运行时的 `/tmp/hermes-zh-font-backups/*` 本地备份。

执行命令：

```bash
python3 scripts/optimize-fonts.py
```

## 3. 前后体积

| 文件 | 优化前 | 优化后 | 结果 |
| --- | ---: | ---: | ---: |
| `public/fonts/noto-sans-sc.woff2` | 11,426,032 B / 10.90 MiB | 433,132 B / 0.41 MiB | -96.2% |
| `public/fonts/noto-serif-sc.woff2` | 17,776,316 B / 16.95 MiB | 606,496 B / 0.58 MiB | -96.6% |
| 合计 | 29,202,348 B / 27.85 MiB | 1,039,628 B / 0.99 MiB | -96.4% |

目标 `<3MB/单字体` 已达成。

## 4. 静态字体可用性检查

生成字符集：1608 个唯一字符，写入 `public/fonts/subset-chars.txt`。

抽样字符串：

```text
Hermes Agent 中文站快速上手模型部署入口文档搜索国内落地参考手册问题排查迁移方案
```

检查结果：

```text
public/fonts/noto-sans-sc.woff2 size 433132 unicode_count 1508 probe_missing_font 
public/fonts/noto-serif-sc.woff2 size 606496 unicode_count 1508 probe_missing_font
```

结论：首屏/导航/docs 常见抽样中文在两个字体子集中均无缺字。

## 5. 回滚方式

如果发现线上新增内容出现方框字或视觉异常，可直接回滚本次二进制改动：

```bash
git checkout -- public/fonts/noto-sans-sc.woff2 public/fonts/noto-serif-sc.woff2
```

本机本次运行也保留了临时原始备份，可用于人工恢复：

```bash
cp /tmp/hermes-zh-font-backups/noto-sans-sc.woff2 public/fonts/noto-sans-sc.woff2
cp /tmp/hermes-zh-font-backups/noto-serif-sc.woff2 public/fonts/noto-serif-sc.woff2
```

也可以重新生成更大的分层字符集：

```bash
python3 scripts/optimize-fonts.py --text-dir app --text-dir components --text-dir content-cache/generated --text-dir /path/to/extra-content
```

## 6. 风险与分层方案

### 当前风险

- 子集基于“仓库当前可见文本 + 生成 manifest/search index + 常用标点”，不是完整 CJK。未来内容仓新增大量新字、人名、罕见汉字、日文假名、韩文或 emoji 时，会 fallback 到系统字体。
- 这是最小可行优化，优先解决 FOT/传输体积；仍需浏览器视觉 QA 才能最终确认所有页面无明显 fallback。

### 建议下一步分层

1. **Layer 1：首屏核心子集**（当前实现）：<1MB 合计，覆盖首屏、导航、现有 docs/manifest/search index。
2. **Layer 2：扩展 docs 子集**：按内容仓全量 Markdown + packs manifest 生成，作为 `/fonts/*-docs.woff2`，用 `unicode-range` 延迟加载。
3. **Layer 3：系统字体兜底**：保留 `PingFang SC` / `Microsoft YaHei` / `Songti SC` 兜底，避免罕见字不可读。
4. **构建集成**：后续可把 `scripts/subset-fonts.py --apply` 接入 release 前手动任务，不建议每次 build 自动覆盖二进制，避免不可预期 git dirty。
