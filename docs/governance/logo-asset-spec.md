# Hermes 中文站 Logo 资产规范

更新时间：2026-04-30

## 1. 统一主 Logo

- Canonical source：`/root/.hermes/image_cache/img_3c9f9a72b4fc.webp`
- 仓内审计副本：`public/hermes-logo-source.webp`
- 站点统一展示资产：`public/hermes-logo.webp`
- Favicon / App Icon：`app/icon.png`
- Apple Touch Icon：`app/apple-icon.png`

本轮确认：全站 README、header、footer、favicon、Next app icon、Apple icon 均必须从同一个主视觉资产派生，不允许再引入第二套 logo 或重新绘制。

## 2. 核心视觉不可变更项

以下元素属于核心品牌识别，不得重绘、替换或改变：

1. 圆角方形 app icon 轮廓。
2. 深 navy / 近黑色星空背景。
3. 电蓝色内嵌圆角边框与发光效果。
4. 中央圆形轨道 / 星球结构。
5. 居中的白蓝色四角星芒。
6. 环绕中央星体的蓝色轨道线。
7. 轨道周边的发光星点 / 小球。
8. 高对比蓝色、青色、白色发光风格。

允许的处理仅限：等比缩放、为 favicon / icon 需要做最小中心裁切、压缩格式转换。不得改色、改构图、改图形语言、重新描边或扁平化。

## 3. 资产规格

| 使用位置 | 文件 | 尺寸/比例 | 规范 |
|---|---|---:|---|
| Canonical source | `/root/.hermes/image_cache/img_3c9f9a72b4fc.webp` | 795×800 JPG | 唯一主视觉来源，保留原图，不直接改写 |
| 仓内 source 副本 | `public/hermes-logo-source.webp` | 795×800 JPG | 用于审计与后续再生成，不作为组件默认引用 |
| README 展示 | `public/hermes-logo.webp` | 512×512 PNG | 建议显示宽度 96–128px，居中，alt 固定为 `Hermes Agent 中文站 Logo` |
| Header Logo | `public/hermes-logo.webp` | 512×512 PNG | 组件显示 44×44px；保留圆角与轻边框，不拉伸变形 |
| Footer Logo | `public/hermes-logo.webp` | 512×512 PNG | 组件显示 40×40px；与 header 同源同视觉 |
| Favicon / App Icon | `app/icon.png` | 512×512 PNG | Next.js App Router 自动暴露为 `/icon.png` |
| Apple Touch Icon | `app/apple-icon.png` | 180×180 PNG | Next.js App Router 自动暴露为 `/apple-icon.png` |

## 4. 页面引用口径

- Header：`components/layout/site-header.tsx` 使用 `/hermes-logo.webp`。
- Footer：`components/layout/site-footer.tsx` 使用 `/hermes-logo.webp`。
- Metadata：`app/layout.tsx` 使用 `/icon.png`、`/apple-icon.png`，并保留 `/hermes-logo.webp` 作为 icon fallback。
- README：顶部使用 `public/hermes-logo.webp` 展示项目标识。

## 5. 验收点

- 站点内不出现第二套 logo。
- README / header / footer / favicon / icon / apple-icon 同源。
- favicon 与 apple-icon 只做尺寸派生，不改变核心视觉。
- 构建可通过，Next metadata 图标路径可访问。
- 后续如需更新 logo，必须先替换 canonical source，再重新生成所有派生资产。
