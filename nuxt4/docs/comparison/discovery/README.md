# 番剧与站点罗盘对照

状态：Review  
更新：2026-09-20  
关联：[迁移进度](../../migration-progress.md)、[来源记录](../../source-attribution.md)

通过 `scripts/compare-discovery.mjs` 对照原版 Astro 与 Nuxt 生产产物。视口为桌面 1440×1000、手机 390×844，各检查浅色、深色；番剧另检查横向列表布局。设置 `DISCOVERY_COMPARE_URL` 指定 Nuxt 地址，原版参考服务为 4321。

| 项目 | 桌面原版 / Nuxt | 手机原版 / Nuxt |
| --- | --- | --- |
| 面板宽度 | 801 / 801 px | 361 / 361 px |
| 番剧网格卡片宽度 | 172.25 / 172.25 px | 146.375 / 146.375 px |
| 番剧封面比例 | 2:3 / 2:3 | 2:3 / 2:3 |
| 罗盘卡片宽度 | 175.25 / 175.25 px | 148.125 / 148.125 px |
| 罗盘卡片高度 | 120.297 / 120.297 px | 110.5 / 110.5 px |

完整测量见 [measurements.json](measurements.json)。Nuxt 保留已有中文数据及系统字体；原版是英文数据和 Outfit/Yozai，因此标题、筛选标签换行和内容总高度有所不同。罗盘中文数据还为原版缺少说明的组补有说明，额外文本占据的高度属于数据差异。

- [Nuxt 手机番剧网格](nuxt-anime-mobile-light.png) · [原版](original-anime-mobile-light.png)
- [Nuxt 手机番剧列表](nuxt-anime-mobile-light-list.png) · [原版](original-anime-mobile-light-list.png)
- [Nuxt 桌面罗盘](nuxt-compass-desktop-light.png) · [原版](original-compass-desktop-light.png)
- [Nuxt 手机深色罗盘](nuxt-compass-mobile-dark.png) · [原版](original-compass-mobile-dark.png)

功能回归检查状态/分组与搜索组合、URL 刷新与回退、十二条分页、封面与图标回退、布局记忆、存储受限、键盘操作、无 JavaScript 筛选、减少动效和两种主题的 axe 无障碍结果。
