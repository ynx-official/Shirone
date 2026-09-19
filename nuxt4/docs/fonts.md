# 字体构建

Nuxt 保留原有 Outfit + Yozai 字体栈及 `font-display: optional`。
Yozai 原始字体放在 `assets/fonts/`，不再位于 `public/`。

`nuxt.config.ts` 的 `nitro:config` 钩子调用 `scripts/fonts.mjs`，因此
`pnpm build` 和直接执行 `pnpm exec nuxt build` 都会处理字体：

- 开发模式把完整 TTF 放入 `.generated/fonts-dev`，允许输入新字符。
- 生产模式从 `content`、十语言 `app/i18n`、`mock` 配置与数据收集字符，
  生成 `.generated/fonts-production` 下带内容哈希的 WOFF2 子集。
- 两种模式使用独立目录，通过 Nitro public assets 挂载 `/fonts/yozai/`，
  生产构建不会改变已启动开发服务器的字体。
- 沿用 `mock/public/config.json` 中 `font.subsetting` 的本地字符来源开关。
  关闭子集化时仍转换为 WOFF2；超出体积预算会让构建失败。
- 只扫描本地内容，不访问远程歌单。远程新增文字和浏览器管理预览中的新字
  若不在子集中，会使用系统回退字体；更新本地内容后重新构建。
- 生产编译完成后检查原始 TTF/OTF 文件和 CSS/HTML 引用、WOFF2 签名、
  单文件及总字体预算。KaTeX 自带数学字体保持独立，排除在此检查之外。

此流程迁移自 Astro 的 `src/integration/fonts.ts` 和
`scripts/fonts/check-fonts.mjs`，运行时和构建时均不读取父项目。
当前适配既有 Yozai 资源，并非任意字体配置的完整迁移。

验证：`pnpm test`、`pnpm typecheck`、`pnpm lint`、`pnpm build`，
以及生产浏览器中的字体请求、中文切换和首页无障碍检查。

## 本次验证

- 当前内容构建的 Yozai 从 15,225,614 bytes 减到 402,364 bytes（约 97.4%）。
- 生产构建、类型检查、ESLint、11 项 Node 测试通过；额外验证新增字符会改变字体资源哈希。
- 浏览器确认 `document.fonts.load` 成功加载 Yozai WOFF2，旧 TTF URL 返回 404。
- 七项生产浏览器回归中六项通过（包含入场、字体加载稳定性、移动语言选择、首页 axe）。
  独立访客语言断言失败：测试全局预设英文 cookie，却期待中文默认语言；字体请求验证不受影响。
- 开发服务仍按开发模式提供原始字体，不应使用其 Lighthouse 分数评价生产优化。

后续资源优化回归已修正语言测试的访客 cookie 隔离，语言切换、独立访客 SSR
与首页字体加载均通过；最新性能对比见 `performance.md`。
