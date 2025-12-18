# 工程文档（cosformula.org）

本文档描述本站点的工程结构、开发/构建流程，以及内容（文章）维护约定。

## 1. 技术栈

- **框架**：Astro（SSG 输出静态站点）
- **语言**：TypeScript
- **样式**：Tailwind CSS
- **内容**：Markdown / MDX（Astro Content Collections）
- **代码高亮**：Shiki（含 diff/highlight 等 transformers）
- **数学公式**：remark-math + rehype-katex（KaTeX）
- **站内搜索**：Pagefind（构建时生成索引）
- **SEO**：sitemap、robots、RSS、OpenGraph/Twitter meta、JSON-LD

## 2. 目录结构（关键部分）

```text
public/
  static/                静态资源（文章图片等，URL 前缀 /static/...）
  toggle-theme.js        主题切换脚本
src/
  config.ts              站点配置（SITE）
  constants.ts           社交链接等常量
  content.config.ts      内容集合 schema（blog）
  data/blog/             文章内容（zh 默认）
  data/blog/en/          英文文章内容
  i18n/                  UI 文案字典与工具
  pages/                 路由页面（/、/zh、/posts、/zh/posts、/search 等）
  layouts/               Layout/Main/PostDetails 等布局
  components/            Header/Card/Tag/... 组件
dist/                    构建产物（默认被 .gitignore 忽略）
```

## 3. 环境与依赖

- Node.js：建议 **20+**（CI 使用 Node 20）
- 包管理器：`npm` 或 `pnpm` 均可（脚本在 `package.json`）

## 4. 常用命令

```bash
# 安装依赖（二选一）
npm ci
# pnpm install

# 本地开发
npm run dev

# 构建（含类型检查 + Pagefind 索引生成）
npm run build

# 预览 dist
npm run preview

# 质量检查
npm run lint
npm run format:check
npm run format
```

### 4.1 build 脚本做了什么

`npm run build` 对应：

1. `astro check`：类型/内容校验
2. `astro build`：输出到 `dist/`
3. `pagefind --site dist`：为静态站点生成搜索索引（`dist/pagefind/`）
4. `cp -r dist/pagefind public/`：把索引复制到 `public/pagefind/`，用于**开发模式**下的搜索结果加载（该目录已在 `.gitignore` 中忽略）

> 注意：`/search` 与 `/zh/search` 页面会提示「DEV mode Warning」，原因是 Pagefind 只有在至少构建一次后才有索引数据。

## 5. 内容维护（写文章）

### 5.1 文章存放位置

- 中文文章：`src/data/blog/*.md` 或 `*.mdx`
- 英文文章：`src/data/blog/en/*.md` 或 `*.mdx`

### 5.2 Frontmatter 模板

最小可用示例（字段以 `src/content.config.ts` 为准）：

```yaml
---
title: 标题
description: 摘要
pubDatetime: 2025-01-01T00:00:00.000Z
tags:
  - 标签1
lang: zh # 英文文章必须为 en
draft: false
featured: false
# translationOf: some-key (可选，用于中英互链)
---
```

### 5.3 图片与静态资源

- 推荐放在 `public/static/images/<post-slug>/...`
- 在 Markdown/MDX 中用绝对路径引用：`/static/images/...`

### 5.4 双语互链（translationOf）

如果一篇文章有中英文两个版本：

1. 两个文件分别放在 `src/data/blog/`（zh）与 `src/data/blog/en/`（en）
2. 两篇文章的 frontmatter 里设置相同的 `translationOf`（自定义字符串即可）
3. `PostDetails` 会自动在详情页展示跳转入口（“阅读中文版 / Read in English”）

## 6. 配置与常见改动点

### 6.1 站点配置

- `src/config.ts`：站点域名、标题、分页大小、是否显示归档、主题开关等
- `src/constants.ts`：社交链接（用于 Header/Footer 的 Socials）

### 6.2 Astro 配置

- `astro.config.ts`
  - `site`: 使用 `SITE.website`（影响 sitemap/RSS 绝对链接等）
  - `redirects`: 旧 URL 兼容
  - `markdown`: remark/rehype（TOC、折叠、数学公式、Shiki 主题等）
  - `i18n`: `en` / `zh`
  - `env.schema`: `PUBLIC_GOOGLE_SITE_VERIFICATION`（可选）

## 7. 部署

本站点是纯静态产物，部署只需要托管 `dist/`：

- 构建命令：`npm run build`
- 输出目录：`dist`
- 可选环境变量：`PUBLIC_GOOGLE_SITE_VERIFICATION`

## 8. Docker（可选）

### 8.1 本地开发（docker-compose）

```bash
docker compose up
```

首次运行需要在容器内安装依赖：

```bash
docker compose run --rm app npm install
```

### 8.2 构建并用 Nginx 提供静态站点（Dockerfile）

```bash
docker build -t cosformula-site .
docker run --rm -p 4321:80 cosformula-site
```

## 9. CI（现状）

`.github/workflows/ci.yml` 会在 PR 上执行：

- 安装依赖
- ESLint / Prettier 检查
- `pnpm run build` 构建验证

