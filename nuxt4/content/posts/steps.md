---
title: Markdown 步骤说明
published: 2026-08-27T00:00:00.000Z
description: 用清晰的步骤结构展示操作顺序和检查要点。
tags:
  - 示例
  - Markdown
  - 步骤
  - Shirone
category: 指南
lang: zh_CN
draft: false
---

当操作顺序很重要时，可以使用步骤容器。编号帮助读者定位当前进度，段落、列表和代码仍保持原有含义。

## 从安装到预览

:::steps[启动本地应用]
1. **进入应用目录**

   新应用与旧项目分别维护，在以下目录执行命令。

   ```sh
   cd nuxt4
   ```

2. **安装依赖**

   按照 lockfile 安装兼容版本。

   ```sh
   pnpm install --frozen-lockfile
   ```

3. **执行检查**

   确认类型检查和数据验证通过。

   ```sh
   pnpm typecheck
   pnpm test
   ```

4. **启动开发服务**

   打开终端输出的本地地址，检查首页与文章页。

   ```sh
   pnpm dev
   ```
:::

## 配置选项

- `:::steps[标题]` 用于设置可见标题。
- `start=4` 可以改变第一项显示的编号。
- 容器应只包含一个有序列表。
- 渲染在构建阶段完成，不为静态步骤额外加载脚本。
