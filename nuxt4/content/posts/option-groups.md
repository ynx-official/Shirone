---
title: Markdown 选项组
published: 2026-08-28T00:00:00.000Z
description: 使用可同步的选项卡展示不同环境下的操作方法。
tags:
  - 示例
  - Markdown
  - 选项卡
  - Shirone
category: 指南
lang: zh_CN
draft: false
---

选项组适合并列展示相同任务的不同做法。每个选项都可以包含完整的 Markdown 内容。

## 选择包管理器

`@tab:active` 指定默认项，`#` 后的稳定标识用于同步选择。

::: tabs#package-manager

@tab npm

使用 npm 安装项目依赖：

```sh
npm install
```

@tab:active **pnpm**#pnpm

当前项目使用 pnpm，请优先遵循仓库的锁文件：

```sh
pnpm install --frozen-lockfile
```

@tab Bun#bun

其他环境可参考对应包管理器的命令：

```sh
bun install
```

:::

## 运行项目

下面的组使用同一个 `package-manager` 标识，会同步所选命令。

::: tabs#package-manager

@tab npm

```sh
npm run dev
```

@tab pnpm

```sh
pnpm dev
```

@tab Bun#bun

```sh
bun run dev
```

:::

## 更多场景

::: tabs

@tab 本地开发

在本机调试功能，快速检查页面变化。

@tab 预览环境

生成可供检查的临时预览。

@tab 持续集成

为每次修改执行确定性的自动化检查。

@tab 生产部署

部署已通过检查的独立构建产物。

@tab 离线恢复

网络不可用时，从本地产物恢复运行。

:::

每组至少需要两个选项，标记与正文之间应当空一行。手机端的长选项栏可以在自身范围内横向滚动。
