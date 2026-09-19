# 验证结果

## 原站视觉校准后的本轮验证（2026-09-19）

| 检查 | 结果 |
| --- | --- |
| 原站运行对比 | Astro 与 Nuxt 的 5 页、2 种视口、首屏及内容区；截图和 DOM 尺寸见 docs/comparison |
| Nuxt/Vue 类型检查 | 通过 |
| ESLint | 通过 |
| 契约测试 | 8/8 通过 |
| 开发环境浏览器完整回归 | 首轮 14/17 通过；日历对比度已修复、设置用例改用 combobox 语义定位后复测通过；原站与 Vite 同时运行时切页/axe 曾超时，不把该轮记为全绿 |
| 最新生产产物公开 UI 回归 | **7/7 通过，9.3 秒**；覆盖首轮全部失败用例及桌面/手机几何、分组/筛选、禁用 JS、显示偏好、播放器持久化 |
| Node 24.11.1 构建 | 通过，包含本轮图标、样式和组件修复 |
| 复制生产产物独立运行 | 通过，不依赖父项目 |
| Git 边界 | 仅 nuxt4/ 未跟踪；根项目无跟踪文件修改 |

生产浏览器验证命令：`pnpm exec playwright test --config playwright.production.config.ts`。该配置直接检查 Node SSR 产物，不启动 Vite；开发管理流程仍由原 playwright.config.ts 验证。本轮没有重新构建 Docker 镜像，下方 Docker 结果属于前一轮底座验收。

日历使用完整语义文字色，修复淡灰日期的 WCAG 对比度问题；这是一项有意保留的无障碍改进，不机械复制原站低对比度。

## 前一轮独立应用底座验证


日期：2026-09-19。工作目录：nuxt4。宿主 macOS，Node 22.23.0 / pnpm 9.14.4；专门使用 Node 24.11.1 完成生产构建与独立产物验证。Docker 构建使用 node:24-bookworm-slim，在隔离 Linux 镜像内重新安装并构建。

| 检查 | 最终结果 |
| --- | --- |
| pnpm install --frozen-lockfile | Docker 干净安装通过；独立 lockfile 无 overrides |
| pnpm typecheck | 通过，0 类型错误 |
| pnpm lint | 通过，0 错误、0 警告 |
| pnpm test | 8/8 通过 |
| pnpm test:e2e | 13/13 通过，32.8 秒，Chromium 单 worker |
| Node 24.11.1 内容生成/SSR 构建 | 通过，Nuxt 4.5.2 / Vite 8.3.0 / Vue 3.5.40 |
| 复制 .output 后独立运行 | 通过，公开正文/资源/搜索脚本/Feed/健康接口可用，管理入口 404 |
| Docker 镜像构建 | 通过，镜像名 shirone-nuxt:local |
| Docker 运行验证 | SSR/静态资源/管理禁用/UID 1000/健康检查/停止重启全部通过；验证容器已删除 |
| 根项目改动检查 | git status 仅新增 nuxt4/；没有修改旧项目 |

## 浏览器测试范围

1. 批量公开页面族、20 篇文章、相册详情、Feed/搜索相关输出，分组并发请求；响应不包含加密正文。
2. Pagefind 搜索正文。
3. 错误密码提示、正确密码本地解锁、离开正文不保留页面明文。
4. IndexedDB 图片上传、刷新持久化、删除。
5. 390px 移动端无水平溢出。
6. 本地 Markdown 的扩展语法和 KaTeX 预览；重置恢复 seed。
7. mock 模式无 GitHub API/评论/统计/远程播放器请求；文章直达无 hydration 错误。
8. 默认生产管理/预览/私有 API 与未知路由返回 404。
9. 禁用 JavaScript 后正文仍可读。
10. 客户端导航/回退/深浅色切换无 hydration 错误。
11. 本地文章编辑刷新后仍在、预览显示修改、公开 SSR 未改变。
12. 无效导入保留原存储。
13. 首页 axe WCAG 2 A/AA 检查无违规项。

## 修复并复测的问题

- Vite/TS 解析越过独立应用边界读取父 Astro tsconfig：增加应用与服务端专用 tsconfig。
- Nitro 内容资源路径解析错误：使用绝对构建资源路径并打包进 .output。
- 表单在 Vue 初始化前提前提交：客户端依赖控件在 hydration 完成后启用。
- 文章直达侧栏目录 SSR 时序不同：布局先取得相同 PageData，再渲染侧栏/正文。
- 相册路由复用造成旧照片残留：监听数据更换并关闭画廊。
- ESLint 扫描测试动态目录竞态：明确忽略 test-results/playwright-report。
- Docker 重启重新分配随机宿主端口：验证脚本重读端口；容器本身重启正常。

## 证据与限制

截图：`screenshots/home-desktop.png`、`screenshots/home-mobile.png`、`screenshots/admin-posts.png`。

上述结果覆盖核心可运行性，不等于完整原版视觉/交互验收。尚未执行旧站逐页像素对照、全站所有主题/浏览器的 a11y 矩阵、第三方 provider 启用 fixtures 和性能预算测试。详见 migration-progress.md。

## 2026-09-19 主题面板及 More 菜单复核

- `pnpm typecheck`、`pnpm lint`：通过。
- `pnpm test`：8/8 通过。
- Node 24.11.1 内容生成、生产构建、复制独立产物启动：通过。
- `pnpm exec playwright test --config playwright.production.config.ts`：10/10 通过（最终产物 14.6 秒）。包含新增主题单选/动态颜色/保存/重置/系统模式、面板 axe、More 悬停/本地图标/外链/键盘/焦点、手机设置面板，以及原有 7 项公开 UI 验收。
- 调试中修复重置按钮隐藏导致 Esc 失效、自定义 GitHub 名称回退错误；结束旧预览进程后用新产物重新执行完整公开回归。没有将中断的旧进程测试计入通过结果。
- 对照截图及复现方法见 [主题面板记录](comparison/settings/README.md)。本轮验证限于这些设置和导航行为，不代表全站迁移已完成。

## 2026-09-19 路由进度条

- 类型检查、ESLint、8 项数据测试、Node 24 生产构建及独立产物运行通过。
- 既有 10 项公开 UI 回归通过；新增路由测试覆盖延迟真实请求、加载完成淡出、回退、加载失败、减少动效、快速本地导航和移动端定位。
- 手机使用项目的 14px 根字号，4rem 顶栏实际为 56px；测试按真实顶栏高度断言，不错误套用桌面 64px。
- 原版/新版运行截图与实际尺寸一致，见 [进度条对照](comparison/route-progress/README.md)。
