# 显示设置与 More 菜单

使用真实 Astro / Nuxt 页面，1440 × 1000、浅色、减少动效；截图脚本 `scripts/compare-settings.mjs`。`COMPARE_SITE=original|nuxt` 可单独运行；`NUXT_COMPARE_URL` 可覆盖 Nuxt 地址。

| 对照项 | Astro | Nuxt |
| --- | --- | --- |
| 默认 315 / Tonal Spot / M3E 2025 | [原版](original-panel.png) | [修复后](nuxt-panel.png) |
| 235 / Rainbow / MD3 2021 / Solid | [原版](original-235.png) | [修复后](nuxt-235.png) |
| 向下滚动后悬停 More | [原版](original-menu.png) | [修复后](nuxt-menu.png) |

恢复渐变滑杆、九种配色的动态三色预览、标题色条与当前颜色、重置、分段单选、纹理图标和动效开关。面板宽 320px，桌面顶端 64px，三个分组沿用原容器色与间距。More 7 个条目均有本地 SVG，GitHub 带外链箭头；鼠标、触屏点击、键盘与移动抽屉分别处理。

Nuxt 的减少动效偏好在 235 样例中显式保存为开启；两边正文和统计数据沿用各自可见性规则，不以隐藏草稿换取截图数据相同。
