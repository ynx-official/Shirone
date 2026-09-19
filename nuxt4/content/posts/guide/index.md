---
title: Shirone 写作与使用指南
published: 2026-08-26T00:00:00.000Z
updated: 2026-08-26T00:00:00.000Z
pinned: true
description: 了解文章资料、Markdown 扩展、本地预览和内容保护。
image: ./cover.jpeg
tags:
  - Shirone
  - 指南
  - Markdown
  - M3E
  - 博客
category: 指南
draft: false
lang: zh_CN
---

欢迎来到 **Shirone（白音）**。这是一个基于 **Nuxt 4、Vue 3 和 TypeScript** 的独立博客应用，沿用 Material 3 Expressive 的设计风格。

这份指南介绍日常内容整理和本地演示流程。当前阶段使用 mock 数据，管理页面中的编辑保存在浏览器本地。

:::tip[提示]
公开页面由服务端渲染。浏览器草稿只影响管理界面和专用预览，不会直接修改线上内容。
:::

## 创建文章

在 `content/posts/` 中创建 Markdown 文件。文章以 YAML 资料块开头：

```yaml
---
title: 我的第一篇笔记
published: 2026-08-26
description: 记录一次小小的技术探索。
tags: [开发, 笔记]
category: 指南
draft: false
lang: zh_CN
---
```

| 字段 | 说明 |
| --- | --- |
| `title` | 文章标题 |
| `published` | 发布日期 |
| `description` | 列表和搜索中显示的摘要 |
| `image` | 封面图片路径 |
| `tags` | 标签列表 |
| `category` | 所属分类 |
| `series` | 系列的稳定标识 |
| `draft` | 是否为草稿 |
| `password` | 加密示例的解锁口令 |

## 写作流程

```mermaid
flowchart LR
    accTitle: 文章整理流程
    accDescr: 编写内容、检查格式、生成产物并进行本地预览。
    A[编写文章] --> B[检查格式]
    B --> C[生成内容]
    C --> D[本地预览]
```

修改文件后，重新生成内容并运行应用：

```sh
pnpm content:build
pnpm dev
```

## 图片与媒体

图片可以使用同目录的相对路径，也可以引用 `public/` 中的资源。替代文本应描述图片内容，而不是重复文件名。

音频和视频只在使用相应语法时加载功能。示例资源的原始语言、品牌名称与技术标识符可以保留。

## 数学与代码

行内公式如 $a^2+b^2=c^2$ 可以直接写在段落中。较长的公式独立显示更清楚：

$$E = mc^2$$

代码块注明语言后可以获得语法高亮。多文件说明可以使用代码树，较长的步骤可以使用步骤容器。

## 内容保护

:::warning[警告]
加密文章与相册用于演示浏览器本地解锁。它们不能替代真实后端的权限控制，不要把生产凭据放入 mock 数据。
:::

公开 HTML、搜索索引和订阅源都不应包含受保护正文。可在 [加密示例](/posts/encrypted-demo/) 检查解锁流程。

## 项目与扩展阅读

::github{repo="LyraVoid/Shirone"}

你可以继续阅读 [基础语法](/posts/markdown/)、[增强语法](/posts/markdown-enhancements/) 和 [图片网格](/posts/image-grid-demo/)。
