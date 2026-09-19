---
title: 图片网格：布局与完整示例
published: 2026-07-13T00:00:00.000Z
description: 对照不同列数、比例、裁切与灯箱效果，整理图文内容。
tags:
  - Markdown
  - 图集
  - 图片网格
  - 示例
category: 示例
draft: false
lang: zh_CN
---

图片网格用来组织同一主题下的多张图片。点击图片可以查看大图，布局会随屏幕宽度调整。

## 基本写法

```markdown
:::grid{columns="3" aspect="16/9" fit="cover"}
![风景插画](./landscape-1.webp "图片说明")
:::
```

## 最简网格

:::grid
![风景插画，示例 1](./landscape-1.webp "风景插画 · 1")

![风景插画，示例 2](./landscape-2.webp "风景插画 · 2")
:::

## 列数与图片比例

:::grid{columns="3" aspect="16/9" fit="cover"}
![风景插画，示例 3](./landscape-1.webp "风景插画 · 3")

![风景插画，示例 4](./landscape-2.webp "风景插画 · 4")

![风景插画，示例 5](./landscape-3.webp "风景插画 · 5")
:::

## 图片说明与替代文本

:::grid{columns="3" aspect="1/1"}
![人物插画，示例 6](./square-1.webp "人物插画 · 6")

![人物插画，示例 7](./square-2.webp "人物插画 · 7")

![人物插画，示例 8](./square-3.webp "人物插画 · 8")
:::

## 裁切与完整显示

:::grid{columns="3" aspect="16/9" fit="cover"}
![人物插画，示例 9](./default-portrait-1.webp "人物插画 · 9")

![人物插画，示例 10](./default-portrait-2.webp "人物插画 · 10")

![人物插画，示例 11](./default-portrait-3.webp "人物插画 · 11")
:::

:::grid{columns="3" aspect="16/9" fit="contain"}
![人物插画，示例 12](./default-portrait-1.webp "人物插画 · 12")

![人物插画，示例 13](./default-portrait-2.webp "人物插画 · 13")

![人物插画，示例 14](./default-portrait-3.webp "人物插画 · 14")
:::

## 默认布局

:::grid
![人物插画，示例 15](./default-portrait-1.webp "人物插画 · 15")

![人物插画，示例 16](./default-portrait-2.webp "人物插画 · 16")

![人物插画，示例 17](./default-portrait-3.webp "人物插画 · 17")
:::

## 三列竖幅图片

:::grid{columns="3" aspect="3/4"}
![人物插画，示例 18](./default-portrait-1.webp "人物插画 · 18")

![人物插画，示例 19](./default-portrait-2.webp "人物插画 · 19")

![人物插画，示例 20](./default-portrait-3.webp "人物插画 · 20")
:::

## 三列横幅图片

:::grid{columns="3" aspect="16/9"}
![风景插画，示例 21](./feature-landscape-1.webp "风景插画 · 21")

![风景插画，示例 22](./feature-landscape-2.webp "风景插画 · 22")

![风景插画，示例 23](./feature-landscape-3.webp "风景插画 · 23")
:::

## 两列方形图片

:::grid{columns="2" aspect="1/1"}
![人物插画，示例 24](./mixed-square-1.webp "人物插画 · 24")

![人物插画，示例 25](./mixed-square-2.webp "人物插画 · 25")

![人物插画，示例 26](./mixed-square-3.webp "人物插画 · 26")
:::

## 四列完整显示

:::grid{columns="4" aspect="16/9" fit="contain"}
![人物插画，示例 27](./default-portrait-1.webp "人物插画 · 27")

![人物插画，示例 28](./default-portrait-2.webp "人物插画 · 28")

![人物插画，示例 29](./default-portrait-3.webp "人物插画 · 29")
:::

## 单列细节展示

:::grid{columns="1" aspect="16/9"}
![风景插画，示例 30](./feature-landscape-1.webp "风景插画 · 30")
:::

## 五列稀疏排列

:::grid{columns="5" aspect="1/1"}
![人物插画，示例 31](./mixed-square-1.webp "人物插画 · 31")

![人物插画，示例 32](./mixed-square-2.webp "人物插画 · 32")

![人物插画，示例 33](./mixed-square-3.webp "人物插画 · 33")
:::

## 六列混合构图

:::grid{columns="6" aspect="1/1"}
![人物插画，示例 34](./default-portrait-1.webp "人物插画 · 34")

![人物插画，示例 35](./default-portrait-2.webp "人物插画 · 35")

![人物插画，示例 36](./default-portrait-3.webp "人物插画 · 36")

![风景插画，示例 37](./feature-landscape-1.webp "风景插画 · 37")

![风景插画，示例 38](./feature-landscape-2.webp "风景插画 · 38")

![风景插画，示例 39](./feature-landscape-3.webp "风景插画 · 39")
:::

## 四列方形图片

:::grid{columns="4" aspect="1/1"}
![人物插画，示例 40](./square-1.webp "人物插画 · 40")

![人物插画，示例 41](./square-2.webp "人物插画 · 41")

![人物插画，示例 42](./square-3.webp "人物插画 · 42")

![人物插画，示例 43](./square-4.webp "人物插画 · 43")
:::

## 六列横幅图片

:::grid{columns="6" aspect="16/9"}
![风景插画，示例 44](./landscape-1.webp "风景插画 · 44")

![风景插画，示例 45](./landscape-2.webp "风景插画 · 45")

![风景插画，示例 46](./landscape-3.webp "风景插画 · 46")

![风景插画，示例 47](./landscape-4.webp "风景插画 · 47")

![风景插画，示例 48](./landscape-5.webp "风景插画 · 48")

![风景插画，示例 49](./landscape-6.webp "风景插画 · 49")
:::

## 三列竖幅图片

:::grid{columns="3" aspect="3/4"}
![人物插画，示例 50](./portrait-1.webp "人物插画 · 50")

![人物插画，示例 51](./portrait-2.webp "人物插画 · 51")

![人物插画，示例 52](./portrait-3.webp "人物插画 · 52")

![人物插画，示例 53](./portrait-4.webp "人物插画 · 53")

![人物插画，示例 54](./portrait-5.webp "人物插画 · 54")

![人物插画，示例 55](./portrait-6.webp "人物插画 · 55")
:::

## 裁切边缘与灯箱

:::grid{columns="3" aspect="16/9" fit="cover"}
![人物插画，示例 56](./critical-1.webp "人物插画 · 56")

![人物插画，示例 57](./critical-2.webp "人物插画 · 57")

![人物插画，示例 58](./critical-3.webp "人物插画 · 58")
:::

## 特殊比例图片

:::grid{columns="3" aspect="16/9" fit="contain"}
![宽幅画面，示例 59](./extreme-1.webp "宽幅画面 · 59")

![宽幅画面，示例 60](./extreme-2.webp "宽幅画面 · 60")

![宽幅画面，示例 61](./extreme-3.webp "宽幅画面 · 61")
:::

## 透明背景图片

:::grid{columns="1" aspect="16/9" fit="contain"}
![透明背景插画，示例 62](./transparent-1.webp "透明背景插画 · 62")
:::

## 检查要点

- 替代文本说明图片内容，标题补充观看背景。
- `cover` 填满卡片，`contain` 保留整张图片。
- 小屏幕下减少列数，图片不会撑宽页面。
- 每组灯箱只在当前网格内切换图片。
