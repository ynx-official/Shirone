---
title: Markdown 文件引用
published: 2026-08-28T00:00:00.000Z
description: 在构建时复用已登记的内容片段。
tags:
  - Markdown
  - Shirone
category: 指南
draft: false
lang: zh_CN
---

长文中的公共说明和代码示例可以放入独立文件，再在构建时引用。

<!-- @include: content/snippets/include-example.md#public-api -->

也可以引用整个文件或指定行范围：

```markdown
<!-- @include: content/snippets/include-example.md -->
<!-- @include: content/snippets/include-example.md{1-4} -->
<!-- @include: content/snippets/include-example.md{5-} -->
```

代码块里的引用标记会保留为示例，不会再次展开。浏览器预览只允许读取预先登记的内容。
