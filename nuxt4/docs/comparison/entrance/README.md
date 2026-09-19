# 刷新入场动画

原始实现：`src/styles/transition.css`、`MainGridLayout.astro`、`SideBar.astro`、`PostPage.astro`（仅作为读取参考）。Nuxt 对应 `app/assets/styles/entrance.css`，无新动画依赖。

| 部位 | 动画延迟 |
| --- | --- |
| 顶栏、分类栏 | 0ms |
| 左右侧栏整列 | 100ms |
| 正文外层、第一张文章卡片 | 150ms |
| 后续文章卡片、侧栏 sticky 区组件 | 每项递增 50ms |
| 页脚 | 250ms |

动画均为 300ms / ease，从下方 2rem（桌面 32px、手机 28px）上移并由透明变为不透明。侧栏 top 区不另加一层子组件错峰。文章阅读信息、标题、元数据和正文继续使用原时序。

运行 `node scripts/compare-entrance.mjs original` 或 `node scripts/compare-entrance.mjs nuxt` 记录浏览器 CSS Animation 的实际 timing，并固定到 150/350/800ms 截图。这里是动画时间的可复现采样，不声称网络、图片加载或字体完成时间也相同。原站截图采集时横幅图片尚未显示，主内容动画仍可对照。

| 帧 | 原版 | Nuxt |
| --- | --- | --- |
| 150ms | [开始](original-150.png) | [开始](nuxt-150.png) |
| 350ms | [中间](original-350.png) | [中间](nuxt-350.png) |
| 800ms | [完成](original-800.png) | [完成](nuxt-800.png) |

持久顶栏与侧栏不因普通客户端跳转重新挂载；SSR 即可运行动画，不要求 hydration 后才显示。系统或本地减少动效直接显示最终内容。
