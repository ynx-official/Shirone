---
title: Markdown 缩略语
published: 2026-08-28T00:00:00.000Z
description: 为专业缩写提供清晰的中文解释。
tags:
  - 示例
  - Markdown
  - 排版
  - Shirone
category: 指南
lang: zh_CN
draft: false
---

技术文章经常使用缩写。为它们定义完整含义后，读者可以通过悬停或辅助技术查看解释。

## 在正文中使用

SSR 让页面在脚本运行之前就有可阅读的内容。评估首屏体验时，可以结合 LCP 和 CLS 观察加载速度与布局稳定性。

**SSR** 可以与普通 Markdown 强调一起使用，而 `SSR` 这样的代码字面量保持原样。

*[SSR]: 服务端渲染
*[LCP]: 最大内容绘制
*[CLS]: 累积布局偏移

## 定义方式

```markdown
*[SSR]: 服务端渲染
*[LCP]: 最大内容绘制

SSR 让浏览器更早获得页面正文。
```

定义仅对当前文章生效。建议第一次使用缩写时同时说明它与当前话题的关系。
