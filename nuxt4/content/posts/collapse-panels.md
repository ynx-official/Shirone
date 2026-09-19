---
title: Markdown 折叠面板
published: 2026-08-28T00:00:00.000Z
description: 把相关问题与可选说明整理为紧凑的折叠面板。
tags:
  - 示例
  - Markdown
  - 折叠面板
  - Shirone
category: 指南
lang: zh_CN
draft: false
---

折叠面板适合常见问题、安装步骤和较长的背景说明。标题与正文都能继续使用 Markdown。

## 独立展开

在标题前加 `:+` 可以默认展开该项，`:-` 则明确保持收起。

::: collapse
- **运行环境要求**

  使用项目支持的 Node.js 版本，并安装锁定的包管理器。

- :+ 安装依赖

  在独立应用目录中执行：

  ```sh
  cd nuxt4
  pnpm install --frozen-lockfile
  ```

- 构建前的检查

  - `pnpm typecheck`
  - `pnpm test`
  - `pnpm build`
:::

## 手风琴模式

加入 `accordion` 后，一次只展开一项。

::: collapse accordion expand
- `expand` 有什么作用？

  没有显式展开标记时，它会默认展开第一项。

- 标题可以包含 Markdown 吗？

  可以使用 **强调** 和 `行内代码`，正文也支持列表与代码块。

- 手机端如何显示？

  长文本正常换行，代码块保留独立的横向滚动区域。
:::

## 编写规则

容器内应当只有一个顶层无序列表。每项先写标题，空一行后再写正文；不完整的内容会保留为普通列表。
