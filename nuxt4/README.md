# Shirone Nuxt 应用

独立的 Nuxt 4.5.2 / Vue 3.5.40 / TypeScript / Vite 8.3.0 / Tailwind 4 / Nitro SSR 应用。
所有开发、依赖安装、内容生成和验证在本目录执行。父目录 Astro 项目只作为迁移对照，不参与运行。

## 本地启动

建议 Node 24.11 或更高的 Node 24 版本，pnpm 9.14.4。

```sh
cd nuxt4
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

公开站点：`http://localhost:4322/`，管理演示：`http://localhost:4322/admin`。
`dev` 会先生成 Markdown 产物与全文搜索索引；修改 `content/` 或 `mock/` 后重新执行 `pnpm dev`。

## 生产 SSR

```sh
pnpm build
NITRO_HOST=0.0.0.0 NITRO_PORT=3000 pnpm start
```

默认构建关闭管理、预览和私有 mock 数据接口。部署时只需要 `.output/` 和 Node 24：

```sh
node .output/server/index.mjs
```

明确需要公开演示管理界面时，在**构建时**设置：

```sh
NUXT_MOCK_ADMIN=true pnpm build
NITRO_PORT=3000 pnpm start
```

这是无鉴权的本地编辑演示。按钮“保存到本地”只保存当前浏览器的覆盖数据；不会修改公开 SSR 内容，也不表示真实发布。不要把它作为线上管理后台。

## Docker

```sh
docker build -t shirone-nuxt .
docker run --rm --name shirone-nuxt -p 3000:3000 shirone-nuxt
```

镜像使用 Node 24、非 root 用户和 `/api/health` 健康检查。演示镜像可以加 `--build-arg NUXT_MOCK_ADMIN=true`。正式默认值为 false。
构建和运行验证状态见 [迁移进度](docs/migration-progress.md)。

## 内容与数据

- `content/`：迁入的 Markdown 正文与系列、动态内容；构建时编译。
- `mock/public/config.json`：站点配置快照；真实评论、统计和远程音乐默认关闭。
- 远程 GitHub 卡片和视频播放器默认禁用；需要时在构建环境设置 `NUXT_REMOTE_FEATURES=true`。
- `mock/public/data.json`：友链、导航、番剧等数据快照。
- `mock/admin/albums.json`：构建专用相册元数据，不在 public 中。
- `shared/`：DTO 与 Zod 导入校验；`app/repositories/`：公开读取与管理存储适配器。
- `server/api/mock/`：只读 mock API，没有文件写入、数据库或登录接口。
- `.generated/`：构建产物，供 Nitro 打包；`public/pagefind/`：独立全文搜索索引。

管理端覆盖 16 个数据域，并提供媒体、导入导出、重置。JSON 导出包含结构化内容和媒体引用；IndexedDB 中的图片原文件不包含在 JSON 中，应保留原文件。清除网站数据会删除本地编辑与媒体。

公开内容修改后必须重新构建部署。未来 HTTP API 可替换 Repository 的适配器，页面不依赖 mock 文件。详情见 [数据契约](docs/data-contract.md)。

## 验证

```sh
pnpm content:build
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
node scripts/verify-standalone.mjs
# Docker 镜像构建完成后：
node scripts/verify-docker.mjs
```

浏览器测试自动启动开发端口 4322 与生产端口 4323，生产测试要求预先执行 `pnpm build`。不要在测试期间重建 `.output` 或改依赖。
`pnpm format` 会修改文件，`pnpm lint` 是只读检查。

可用 `pnpm dlx node@24.11.1 scripts/verify-node24.mjs` 执行指定 Node 24 版本的内容生成、生产构建与复制产物运行验证。

## 迁移说明

[文章详情对比与优化](docs/comparison/article/README.md) 提供旧站、修复前后截图及本轮范围。

[实施计划](docs/migration-plan.md) · [进度与差异](docs/migration-progress.md) · [来源记录](docs/source-attribution.md) · [路由/组件基线](docs/baseline.json)

旧 Svelte MDX 示例入口保留，改用原生 Vue 展示组件。其他新增 MDX 必须显式转换，构建不会执行任意 Svelte/JSX。
本目录没有嵌套 Git，没有 npm 主题安装/覆盖机制，也不修改根目录工作流。CI 模板仅放在 `docs/ci-template.yml`，需之后自行接入根目录 `.github/workflows/`。
