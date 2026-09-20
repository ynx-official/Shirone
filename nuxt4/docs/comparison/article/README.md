# 文章详情对比与优化

状态：Review。最后更新：2026-09-20。
关联：[迁移进度](../../migration-progress.md)、[数据契约](../../data-contract.md)、[验证记录](../../validation.md)。

本轮实际运行 Astro 4321 与 Nuxt 4322，检查 Markdown 基础、Expressive Code、Markdown 扩展三篇文章，视口为桌面 1440 × 1000 和手机 390 × 844。Nuxt 保留已确认的系统字体及中文内容，因此不以相同文字高度或像素一致作为验收目标。

## 已处理

- 标题旁恢复可键盘操作的复制链接按钮及状态反馈；手机标题调整字级并平衡换行。
- 有封面的文章恢复正文前的响应式图片；无封面文章保留分隔线。
- 代码块使用 M3E 表面色、等宽字体与原版行距；普通 prose 样式不再覆盖 Expressive Code 的 padding。
- 复制按钮移到代码框而非滚动内容中；复制内容提取真实代码行，排除行号，切页清理按钮。
- 正文内恢复作者、发布时间和许可证，分享区收进同一文章卡片。许可及分享尊重已有开关，均关闭时不留下空白 footer。
- 接入更新时间及过时提示配置；优先使用 frontmatter updated，按构建日与 UTC 日期计算天数。
- 标题锚点预留固定顶栏空间，长目录内部滚动；长公式在 SSR 中提供键盘焦点。

## 截图

| 原版 | Nuxt 修复前 | Nuxt 修复后 |
| --- | --- | --- |
| ![原版代码块](original-code.png) | ![修复前代码块](before-code.png) | ![修复后代码块](after-code.png) |

[手机正文](after-mobile.png) · [文章底部](after-footer.png)

完整临时截图和几何测量保存在 `nuxt4/.cache/article-comparison/`；重新采集时在 Nuxt 目录运行 `node scripts/compare-article.mjs before` 和 `node scripts/compare-article.mjs after`。

## 对比服务

Windows 当前 Node 22.12.0 下，旧站需要先安装根依赖并生成本地图标，然后仅为对比进程开启 TypeScript 转换：

```powershell
# 根目录
pnpm.cmd install --frozen-lockfile
node scripts/icons/generate-local-icons.mjs
node scripts/images/generate-moment-thumbnails.mjs
$env:ASTRO_DEV_BACKGROUND = '1'
node --experimental-transform-types node_modules/astro/bin/astro.mjs dev --port 4321 --config nuxt4/scripts/astro-reference.config.mjs
```

该参数仅用于旧站对比，没有升级系统 Node，也没有修改原站跟踪文件。

## 2026-09-20 文件树与代码树补齐

实际对照旧站 `markdown-enhancements`，修复 HTML 清洗丢失 `details.open` 与 SVG `viewBox`、遗漏 disclosure/Expressive Code 样式依赖，以及正文列表样式侵入 `not-prose` 组件的问题。文件切换清除 SSR 的内联隐藏样式，更新键盘焦点；放大窗口保留样式作用域、名称和退出焦点，代码复制在窗口内仍可使用。

[旧版代码树](code-tree-original.png) · [Nuxt 代码树](code-tree-nuxt.png) · [手机放大窗口](code-tree-mobile.png)

开发和生产各 10 项浏览器回归通过，覆盖文件切换、键盘、复制、窗口退出、客户端返回、无 JavaScript、手机布局与 axe；15 项 Node 测试、类型检查、ESLint 和生产构建通过。仅修复本篇增强组件链路，不代表所有 Markdown 扩展均已完整迁移。

## 2026-09-20 缩略语提示补齐

恢复清洗器中的原生 `popover` 属性，按内容动态加载 Nuxt 缩略语运行时。支持悬停、键盘焦点、触屏切换、Escape/外部点击关闭；组件卸载清除监听器与计时器，为多实例分配独立提示 ID 和定位锚点。SSR 保留 `title` 解释，客户端增强后移除以避免双重提示。

缩略语浏览器专项 3/3（含手机、无 JavaScript、路由返回和 axe）、代码树回归 3/3、编译专项 3/3、类型检查、ESLint 和生产构建通过。[提示效果](abbreviations-nuxt.png)。

## 2026-09-20 选项组补齐

从旧版交互契约迁移独立的 Nuxt 按需运行时，替换只处理 ARIA 的简化点击事件。恢复默认项初始化、选中高亮、同 `syncKey` 分组同步、选择记忆、方向键/Home/End、选项栏横向滚动与面板内复制。监听器随 Markdown 组件卸载清理；无 JavaScript 时全部面板保持可读。

选项组、缩略语和代码树共 9 项浏览器回归通过，包含路由返回、手机、无 JavaScript 和 axe；类型检查、ESLint 与生产构建通过。[选项组效果](option-groups-nuxt.png)。

## 尚未纳入本轮

原版的相关推荐、稳定随机推荐、系列上下篇、全站上一篇/下一篇，以及完整海报封面配置仍需继续迁移。本轮没有将文章详情标记为完全对齐。

## 2026-09-20 正文注释补齐

恢复清洗器中的按钮 `popovertarget` 和 `aside.popover`，沿用旧版原生弹层，无须新增客户端脚本。修正正文段落与行内代码样式对 `not-prose` 注释的干扰，补回富文本列表标记。支持富文本、同标记多条说明、键盘与触屏开启、Escape/再次点击关闭以及无 JavaScript 使用。

注释、选项组、缩略语 8 项浏览器回归和 4 项编译测试通过，注释增加列表断言后专项 2/2 通过；包含 axe、路由返回和手机边界检查。ESLint、生产构建通过。[注释效果](content-annotations-nuxt.png)。
