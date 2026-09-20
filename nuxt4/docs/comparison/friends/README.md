# 友链页面复刻

状态：Review（实现验证记录）  
更新：2026-09-20  
关联：[迁移进度](../../migration-progress.md)、[来源](../../source-attribution.md)

原版 `FriendSection.svelte` / `FriendCard.svelte` 对应 Nuxt 的专用 Vue 组件。保留中文演示数据、现有 M3E 主题、双列/单列卡片、40px 头像、域名、说明、标签、悬停和新窗口链接。头像加载失败显示名称首字。

搜索匹配名称、说明、域名和标签，忽略首尾空白及大小写；标签单选可取消，显示结果数量与空状态。`q`、`tag` 使用 Vue Router 替换查询参数，保留其他参数和锚点；首屏 SSR 也应用筛选。布局与页面通过 `usePublicPage` 共享完整数据，筛选不重复请求列表或丢失标签选项。

标签保留原版 300ms 加载、150ms 淡出及结果入场。只提取本次 450ms 过渡实际使用的第一段 LoadingIndicator 形状；减少动效时跳过过渡，离开页面清理计时器与动画帧。排序显式使用 zh-CN，避免 Node 和浏览器默认排序差异造成 hydration 不一致。

## 截图与测量

运行原 Astro 4321、新版 4322 后，在 `nuxt4/` 执行 `node scripts/compare-friends.mjs`；可通过 `FRIENDS_COMPARE_URL` 指定新版地址。截图覆盖 1440px / 390px 及浅色 / 深色。

- [原版桌面](original-desktop-light.png) / [新版桌面](nuxt-desktop-light.png)
- [原版手机](original-mobile-light.png) / [新版手机](nuxt-mobile-light.png)
- [新版深色桌面](nuxt-desktop-dark.png) / [新版深色手机](nuxt-mobile-dark.png)
- [测量数据](measurements.json)

桌面面板 801 × 577.59px、卡片 360.5 × 128px 与原版一致；手机卡片宽 305px 与原版一致。手机总高度随中文说明换行减少而不同。旧站英文内容只作为参考，不覆盖新站中文数据。

## 验证

友链回归覆盖即时搜索、清空、标签联动、空结果、刷新、客户端返回、无 JavaScript 的筛选 SSR、新窗口安全属性、手机溢出和两种主题的 axe 检查。另运行公开站点导航、SSR、首页无障碍回归，以及类型检查、ESLint、单元测试、Node 24 生产构建与独立产物检查。
