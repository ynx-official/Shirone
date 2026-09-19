---
title: Markdown 参数卡片
description: 用字段分组说明组件参数、类型和默认值。
published: 2026-08-30T00:00:00.000Z
category: 指南
draft: true
lang: zh_CN
---

参数卡片将字段名、类型、状态和说明放在一起，适合 API 与组件文档。

## 字段分组

:::: field-group

::: field title
@type string
@required

组件的可见标题，建议简洁准确。
:::

::: field disabled
@type boolean
@default `false`
@optional

是否禁用当前控件。
:::

::: field locale
@type `'en' | 'zh-CN' | 'ja-JP'`
@default `'zh-CN'`
@optional

用于日期、数字和界面文案的语言。
:::

::: field legacyMode
@type boolean
@deprecated

仅保留用于兼容旧配置，新代码不应继续使用。
:::

::::

## 单独的字段

::: field format
@type `'short' | 'long'`
@default `'short'`
@optional

控制结果的格式。说明中仍然可以使用 **强调**、列表与代码。
:::

这篇文章保持草稿状态，不进入公开列表和搜索索引。
