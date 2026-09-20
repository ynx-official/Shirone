# 动态页面对照

状态：Review  
更新：2026-09-20  
关联：[迁移进度](../../migration-progress.md)、[来源记录](../../source-attribution.md)

原版 Astro 与 Nuxt 生产产物分别在 1440×1000、390×844 视口检查，包含浅色、深色、三图拼图和内联查看器。脚本为 `scripts/compare-moments.mjs`，需两个服务已启动；`MOMENTS_COMPARE_URL` 可指定 Nuxt 地址。

| 几何 | 桌面原版 / Nuxt | 手机原版 / Nuxt |
| --- | --- | --- |
| 内容面板宽度 | 801 / 801 px | 361 / 361 px |
| 卡片宽度 | 737 / 737 px | 305 / 305 px |
| 三图网格 | 480×322.656 / 相同 | 275×185.688 / 相同 |
| 大图列宽 | 314.656 / 314.656 px | 178.656 / 178.656 px |

完整数据见 [measurements.json](measurements.json)。正文、日期、图注和标签遵循 Nuxt 已有中文数据；原版为英文数据，且原版使用 Outfit/Yozai、Nuxt 当前配置为系统字体，所以文字换行与卡片高度不应要求像素相同。未修改用户的站点字体配置。

- [Nuxt 手机浅色](nuxt-mobile-light-top.png) · [原版手机浅色](original-mobile-light-top.png)
- [Nuxt 桌面浅色](nuxt-desktop-light-top.png) · [原版桌面浅色](original-desktop-light-top.png)
- [Nuxt 手机深色查看器](nuxt-mobile-viewer.png) · [原版手机深色查看器](original-mobile-viewer.png)

回归覆盖重复渲染、置顶/日期顺序、站点时区、搜索与 URL 恢复、空结果、十条分页、延迟图片、内联键盘与焦点、大图按需加载与离页清理、无 JavaScript 原图链接，以及桌面/手机两种主题的 axe 检查。验证记录见迁移进度。
