# 路由切换进度条

运行原 Astro 和 Nuxt，以延迟的真实归档请求捕获正在加载的状态。两边使用 1440 × 1000 视口、浅色主题；截图截取顶部 100px，动画阶段可能不同。

| 状态 | Astro | Nuxt |
| --- | --- | --- |
| 横幅顶部 | [原版](original-banner.png) | [新版](nuxt-banner.png) |
| 向下滚动 | [原版](original-scrolled.png) | [新版](nuxt-scrolled.png) |

实际测量一致：高度 3px、滚动后 top 64px、z-index 65、pointer-events none。样式来源为原项目 RouteProgress.svelte 和 ProgressIndicator.svelte 的线性不定进度部分；只迁移页面使用的形态。

复现：在 nuxt4 下运行 `node scripts/capture-route-progress.mjs original` 和 `node scripts/capture-route-progress.mjs nuxt`，分别读取 localhost:4321 和 127.0.0.1:4322。

Nuxt 生命周期替代 Swup；慢请求持续扫描，真实页面就绪后淡出。快速跳转保留一个 medium 动效间隔以确保可见，不延迟路由/正文。系统和本地减少动效使用静态加载段。
