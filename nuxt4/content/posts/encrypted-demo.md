---
title: 密码保护与文章加密示例
published: 2026-08-20T00:00:00.000Z
pinned: true
description: 演示浏览器本地解锁以及受保护内容的展示边界。
tags:
  - 示例
  - 安全
  - 加密
  - Markdown
category: 示例
lang: zh_CN
encrypted: true
password: shirone-secret
passwordHint: 演示口令：shirone-secret
hideHomeContent: true
---

# 已解锁的示例文章

恭喜！你已成功解锁这篇示例文章。

这里的内容只用于验证加密文章的显示效果。请勿将生产密钥或真实私人资料放入演示数据。

## 工作方式

正文在生成公开数据时加密，页面只获得密文。输入正确口令后，浏览器在本地解密并渲染内容。

```typescript
interface ProtectedContent {
  salt: string;
  iv: string;
  data: string;
}

const state = { unlocked: false };
console.log("等待用户解锁", state);
```

```mermaid
flowchart LR
    accTitle: 本地解锁流程
    accDescr: 用户输入口令后在浏览器中解密并显示正文。
    A[输入口令] --> B[本地解密]
    B --> C{验证成功}
    C -->|是| D[展示正文]
    C -->|否| E[提示重试]
```

## 公式与提示

解锁后的正文仍可展示数学公式：

$$P(A\mid B)=\frac{P(B\mid A)P(A)}{P(B)}$$

:::tip[提示]
重新进入页面时应重新检查当前解锁状态，避免把受保护正文带到其他页面。
:::

:::warning[警告]
公开搜索、订阅源与缓存都不应收录这段正文。
:::

## 项目卡片

::github{repo="LyraVoid/Shirone"}

## 使用边界

这是本地内容保护示例。需要真实账户、访问控制和审计时，应在下一阶段接入服务端权限系统。
