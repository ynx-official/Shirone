---
title: Markdown 隐藏内容
published: 2026-08-28T00:00:00.000Z
description: 为答案或剧情细节添加可访问的行内遮罩。
tags:
  - 示例
  - Markdown
  - 无障碍
  - Shirone
category: 指南
lang: zh_CN
draft: false
---

隐藏内容适合谜题答案与剧情细节。悬停、聚焦或点击控件，可以查看被遮住的文字。

## 行内示例

这道题的答案是 :spoiler[**42**]，其余文字依然是普通段落。

也可以隐藏 :spoiler[带有 **强调** 的补充说明]，或在句子中配合 `行内代码` 使用。

## 编写方式

```markdown
答案是 :spoiler[42]。
```

生成的控件带有展开状态。未加载脚本时仍可通过悬停和聚焦查看，启用交互后支持点击与键盘切换。
