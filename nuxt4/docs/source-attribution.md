# 迁移来源

源项目为本仓库父目录的 Shirone，迁移日期 2026-09-19。父项目未被修改。

| 新应用文件 | 原位置 / 处理方式 |
| --- | --- |
| content/ | src/content/ 的内容快照；不读取父目录 |
| public/ | 原 public/，剔除相册 info.json；其构建信息移入 mock/admin/albums.json |
| public/assets/ | src/assets/ 的媒体、字体、封面 |
| mock/public/config.json | src/config/ 的配置快照；关闭真实评论、统计、音乐集成 |
| mock/public/data.json | src/data/ 的结构化数据快照 |
| mock/source-data/ | 原始 TypeScript 数据，作为溯源材料；生产不依赖 |
| scripts/generate-moment-thumbnails.mjs | 原 scripts/images/generate-moment-thumbnails.mjs，多尺寸缩略图逻辑保留 |
| scripts/vendor/plugins/ | src/plugins/ 的 unified/remark/rehype 实现与 syntax manifest |
| scripts/vendor/utils/ | Markdown processor/manifest 包装器，删除 Astro 运行时耦合 |
| public/styles/markdown/ | 原 Markdown 特性样式 |
| app/i18n/ | 原十种语言词典，Vue 运行时翻译适配与管理文案新增 |
| app/utils/mc-utils.ts | 原 HCT 配色计算工具 |
| app/assets/styles/variables.styl | 原设计变量，Nuxt 样式入口适配 |
| docs/design-reference.md | 原 DESIGN.md 的设计对照副本 |
| docs/upstream-LICENSE | 原项目许可证 |

scripts/import-baseline.mjs 是一次性迁移工具，显式读取父项目。它不属于安装、dev、build、test 或生产运行链；正常开发不再执行。其余新应用运行代码不得引用父项目。

原内容中的 Astro、Svelte 描述保留作演示数据，不代表 Nuxt 运行方式。mdx-showcase 入口提供 Vue 交互示例；未机械移植全部未被页面消费的原子组件。

## 本次视觉校准来源

- `app/assets/styles/textures.css` 复制自原 `src/styles/textures.css`。
- `app/assets/icons.json` 为原生成图标集合和本应用已安装 Iconify Material Symbols 的精选本地 SVG 数据；组件不请求远程图标服务。
- Banner 波浪几何、断点、卡片/侧栏尺寸参照实际运行的原组件；用 Vue 实现生命周期和路由响应。
- 原 Astro 字体输出实测只注册 Outfit 400（与本应用同版本文件 SHA-1 一致），字体匹配以实际页面为准。
- `scripts/astro-reference.config.mjs` 是对比工具，显式引用父 Astro 配置并忽略 `nuxt4/` 的监听；不参与 Nuxt 运行或生产构建。

## 友链页面（2026-09-20）

- FriendSection.vue / FriendCard.vue 参照原 src/components/organisms/FriendSection.svelte、molecules/FriendCard.svelte、PageHeader.svelte 与 TextField/Chips 的实际渲染，使用 Vue Router 管理筛选参数。
- app/assets/friend-loading.json 提取原 src/components/atoms/feedback/loadingShapes.ts 的 indeterminate.scale 和第一段 morph；450ms 筛选阶段只使用这一段。FriendFilterLoading.vue 沿用原 LoadingIndicator 的弹簧常量与旋转时序，Vue 卸载时取消帧。
- compare-friends.mjs 仅为手动对比工具，不属于应用构建或运行依赖。对照截图位于 docs/comparison/friends/。

## 动态页面（2026-09-20）

- MomentSection / MomentCard / MomentGallery 以原同名 Svelte 组件和实际页面为参考，重写为 Vue；保留现有中文演示内容和站点字体配置。
- `app/assets/moment-loading-shapes.ts` 来自原 `src/components/atoms/feedback/loadingShapes.ts`，保留来源注释；MomentLoadingIndicator 用 Vue 实现形状插值、弹簧与旋转，支持减少动效及卸载清理。
- 筛选过渡复用已迁移的 FriendFilterLoading；大图复用已安装的 Fancybox 及站点灯箱样式，不增加远程资源。
- `scripts/compare-moments.mjs` 仅用于原版和 Nuxt 实测对比，不属于正常运行或构建依赖。截图、测量与差异说明见 [动态对照](comparison/moments/README.md)。

## 番剧与站点罗盘（2026-09-20）

- AnimeSection / AnimeCard / CompassSection / CompassTile 对照原同名 Svelte 组件重写 Vue 交互；样式由原 Stylus 解析后迁入各 Vue 文件，跨组件规则调整为 Vue `:deep`，手机间距以实际浏览器渲染为准。
- DiscoveryHeading 参照原 PageHeader；罗盘组标题参照 SectionTitle；搜索和筛选沿用已迁入的 M3E 视觉。筛选加载复用 FriendFilterLoading。
- `app/utils/anime-status.ts` 的状态键、图标和语义色来源于原 `src/utils/anime/status.ts`。进度条保留 4px 轨道、间隙和终点，封面的黑色遮罩/白色评分及黄色星标为原内容覆盖层的可读性例外。
- 新增图标从本地已安装的 Material Symbols 集合提取，沿用现有 LocalIcon，不访问远程图标服务。
- `scripts/compare-discovery.mjs` 是开发期人工对照工具；正常安装、构建和运行不读取父项目。对照见 [番剧与罗盘](comparison/discovery/README.md)。
