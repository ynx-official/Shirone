---
title: Shirone Markdown 增强语法
published: 2026-08-19T00:00:00.000Z
pinned: true
description: 用文件树与代码树说明项目结构和多文件示例。
tags:
  - 示例
  - Markdown
  - 扩展语法
  - 主题
  - Shirone
series: markdown-syntax-guide
seriesOrder: 3
category: 指南
lang: zh_CN
draft: false
---

文件树适合说明目录结构，代码树则将多个文件组织为可切换的阅读界面。示例按文章实际使用的语法加载样式和交互。

## 文件树

:::file-tree{title="应用目录结构"}
- app/
  - components/
    - ++ SiteHeader.vue # 新增的顶栏组件
    - -- OldHeader.vue # 已移除的旧组件
  - pages/
    - index.vue
  - **app.vue** # 应用入口
- content/
  - posts/
    - markdown-enhancements.md
- public/
- package.json
:::

用 `++` 与 `--` 表示新增和删除，`#` 后写简短说明。文件夹可以按需展开。

## 终端目录输出

```file-tree title="构建产物" icon="simple"
.output
├── public/
│   ├── _nuxt/
│   └── pagefind/
└── server/
    └── index.mjs
```

## 多文件代码树

:::code-tree{title="按钮组件示例" height="380px" entry="app/components/Button.vue"}
```vue title="app/components/Button.vue"
<script setup lang="ts">
defineProps<{ label: string }>();
</script>

<template>
  <button class="demo-button">{{ label }}</button>
</template>
```

```css title="app/assets/button.css"
.demo-button {
  background: var(--primary);
  color: var(--on-primary);
  border-radius: var(--shape-corner-m);
}
```

```json title="package.json"
{
  "name": "button-demo",
  "version": "1.0.0"
}
```
:::

## 参数说明

- `title` 设置可见标题与可访问名称。
- `height` 设置桌面端的显示高度。
- `entry` 指定默认显示的文件。
- `icon` 可以选择彩色或简洁的图标样式。

文件名和代码标识符保留原样，说明文字使用中文，便于直接对照项目结构。
