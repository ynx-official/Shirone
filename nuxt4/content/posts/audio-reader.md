---
title: 语音片段与按需播放
published: 2026-08-29T00:00:00.000Z
description: 点击按钮后再加载音频，轻量展示一组语音片段。
tags:
  - 示例
  - 语音播放
series: media-embeds
seriesOrder: 2
category: 示例
draft: false
lang: zh_CN
---

这些短音频用于演示文章中的按需播放。页面打开时保持安静，只有点击播放按钮后才加载对应文件。

## 语音片段

- **一句调侃**：:audio-reader[小小的吐槽]{src="/assets/audio/Baka.wav"}
- **元气问候**：:audio-reader[你好呀]{src="/assets/audio/Ciallo.wav"}
- **轻轻一笑**：:audio-reader[俏皮的笑声]{src="/assets/audio/Ehe.wav"}
- **随口一说**：:audio-reader[日常片段]{src="/assets/audio/Imoi.wav"}
- **玩笑时刻**：:audio-reader[开个玩笑]{src="/assets/audio/Zako.wav"}

## 编写方式

```markdown
:audio-reader[音频说明]{src="/assets/audio/Baka.wav"}
```

`src` 应为站内绝对路径或 HTTPS 地址。标签不能为空，文字应简短说明音频内容。原始音轨保留原语言。
