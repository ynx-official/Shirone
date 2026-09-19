---
title: 在文章中嵌入视频
published: 2023-08-01T00:00:00.000Z
description: 演示不同视频来源的嵌入方式与按需播放。
tags:
  - 示例
  - 视频
series: media-embeds
seriesOrder: 1
category: 示例
draft: false
lang: zh_CN
---

视频可以补充操作过程或展示最终效果。先用正文说明观看目的，再提供播放器。

## 编写示例

```markdown
::youtube{id="5gIf0_xpFPI" title="视频演示" preload="auto"}
```

## YouTube 示例

::youtube{id="5gIf0_xpFPI" title="YouTube 视频演示" preload="auto"}

## 哔哩哔哩示例

::bilibili{bvid="BV1fK4y1s7Qf" title="哔哩哔哩视频演示" p=1 preload="auto"}

## AcFun 示例

::acfun{acid="ac48649632" title="AcFun 视频演示" preload="auto"}

## 独立视频文件

::artplayer{src="https://www.pexels.com/download/video/38538991/" title="风景视频片段" preload="auto"}

第三方内容的可用性由对应平台决定。为不能播放的情况提供文字说明，可以让文章仍然完整。
