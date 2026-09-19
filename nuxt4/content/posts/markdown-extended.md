---
title: Markdown 扩展功能
published: 2024-05-01T00:00:00.000Z
updated: 2024-11-29T00:00:00.000Z
description: 了解仓库卡片、图表、提示块与图片说明的组合用法。
image: ''
tags:
  - 示例
  - Markdown
  - Fuwari
series: markdown-syntax-guide
seriesOrder: 2
draft: false
lang: zh_CN
---

## 仓库卡片

可以用简短指令展示项目链接。远程请求是否启用取决于站点配置。

::github{repo="Fabrizz/MMM-OnSpotify"}

```markdown
::github{repo="saicaca/fuwari"}
```

## 流程图

```mermaid
flowchart LR
    accTitle: 内容渲染流程
    accDescr: Markdown 经内容处理后生成 HTML，再按需增强图表。
    A[Markdown 源文件] --> B[内容处理流程]
    B --> C[语义化 HTML]
    C --> D[主题图表]
```

## 不同语义的提示

:::note[说明]
说明读者在继续操作前需要知道的背景。
:::

:::tip[提示]
给出更省时或更容易理解的做法。
:::

:::important[重要]
标出直接影响操作结果的关键条件。
:::

:::warning[警告]
在可能产生问题的步骤之前提醒读者。
:::

:::caution[注意]
描述需要谨慎处理的后果与边界。
:::

:::note[自定义标题]
把标题写在方括号内，就能为提示块增加明确的主题。
:::

> [!TIP]
> 同样支持 GitHub 风格的提示语法。

## 隐藏答案

先自己想一想，再查看 :spoiler[这里的 **参考答案**]。

## 图片宽度与说明

![相册中的人物插画 w-50%](/images/albums/AcgExample/07.webp "半宽图片与居中的说明文字")

`w-1%` 到 `w-100%` 可以控制单张图片的显示宽度。

![另一幅人物插画 w-75%](/images/albums/AcgExample/08.webp)

![收藏的插画](/images/albums/AcgExample/09.webp "不指定宽度时也可以显示图片说明")
