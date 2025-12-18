# 设计文档（cosformula.org）

本项目是 **重构方圆 / Beyond Formula** 的站点源码仓库，基于 Astro 构建的静态站点，包含双语（English / 中文）博客、作品页、标签与站内搜索。

## 1. 产品定位

- **类型**：个人博客 + 作品集（静态站点）
- **语言**：默认英文站点（`/`），中文站点使用前缀（`/zh/`）
- **核心诉求**：内容阅读体验优先（速度、可读性、可访问性、SEO 友好），维护成本低

## 2. 信息架构（路由）

### 2.1 英文（默认）

- 首页：`/`
- 文章列表：`/posts/`（分页）
- 文章详情：`/posts/<subdir?>/<slug>/`
  - 文章文件位于 `src/data/blog/en/` 时，URL 会包含 `en/` 目录（例如 `/posts/en/how-i-fixed-godot-shadow/`）
- 作品：`/works/`
- 搜索：`/search/`
- 标签：`/tags/`（标签列表）、`/tags/<tag>/`（标签详情，分页）
- 归档：`/archives/`（可选；由 `SITE.showArchives` 控制，当前为关闭状态会重定向到 `/404`）

### 2.2 中文

- 首页：`/zh/`
- 文章列表：`/zh/posts/`（分页）
- 文章详情：`/zh/posts/<slug>/`
- 作品：`/zh/works/`
- 搜索：`/zh/search/`
- 标签：`/zh/tags/`（标签列表）
- 归档：`/zh/archives/`（同上，受 `SITE.showArchives` 控制）

### 2.3 兼容与重定向

在 `astro.config.ts` 中维护旧 URL 的重定向规则（例如旧 `/blog/...` 到新 `/posts/...`；以及 `/rss` 到 `/rss.xml`）。

## 3. 页面结构与交互

### 3.1 通用布局

- 顶部固定 `Header`（玻璃拟态样式），主体内容 `Main`，底部 `Footer`
- 支持 view transitions（`astro:transitions` 的 `ClientRouter`）

### 3.2 Header 导航

- 主导航：Posts / Works（Archives 按配置可见）
- **语言切换**：按钮在英文与中文站点之间跳转；支持通过页面传入 `translationUrl` 指定“对等页面”
- **主题切换**：Light / Dark（由 `SITE.lightAndDarkMode` 控制）

### 3.3 文章详情页

- 支持代码高亮（Shiki）、数学公式（KaTeX）
- 自动目录（Table of Contents）：桌面固定侧栏 + 移动端抽屉
- 标签列表、上一篇/下一篇、回到顶部、返回按钮（可配置）
- **翻译跳转**：当文章设置 `translationOf` 字段时，会在详情页显示“阅读中文版 / Read in English”的入口（见第 5 节）

### 3.4 语言提示（Toast）

全局布局会在非 `/zh/` 路径下检测浏览器语言为中文时，提示是否切换到中文站点，并记录用户偏好（`localStorage`）。

## 4. 内容与数据模型

### 4.1 内容来源

- 使用 Astro Content Collections：集合名 `blog`
- 实际文件路径：`src/data/blog/**/[^_]*.(md|mdx)`
  - 约定：下划线开头的目录/文件会被排除（用于草稿、模板等）

### 4.2 Blog Post 字段（Frontmatter）

以 `src/content.config.ts` 为准，常用字段：

- `title`：标题（必填）
- `description`：摘要（必填）
- `pubDatetime`：发布时间（必填）
- `modDatetime`：更新时间（可选）
- `tags`：标签数组（可选）
- `draft`：草稿（可选；为 `true` 时不会出现在列表/构建中）
- `featured`：精选（可选）
- `lang`：`zh` / `en`（默认 `zh`；英文文章必须显式为 `en`）
- `translationOf`：翻译关联键（可选；用于中英互跳）
- `ogImage` / `canonicalURL` / `timezone` 等：用于 SEO 或展示

## 5. 国际化策略

### 5.1 站点级国际化

- `astro.config.ts` 中配置 `i18n.locales = ["en", "zh"]`，默认 `en`
- UI 文案字典位于 `src/i18n/ui.ts`

### 5.2 文章级双语（翻译关联）

通过文章 frontmatter 的 `translationOf` 建立关联：

- 同一篇内容的中英文版本应使用相同的 `translationOf` 值
- `PostDetails` 会自动寻找另一语言版本并展示跳转入口

## 6. SEO 与站外分发

- `sitemap`：`@astrojs/sitemap` 自动生成（可按 `SITE.showArchives` 过滤）
- `robots.txt`：指向站点 sitemap
- `RSS`：`/rss.xml`
- OG/Twitter meta：由 `Layout` 统一注入
- **动态 OG 图片**：对未设置 `ogImage` 的文章，构建时生成 `.../index.png`（由 `SITE.dynamicOgImage` 控制）

## 7. 可配置项（站点级）

站点级配置集中在 `src/config.ts`（例如 `SITE.website`、`SITE.title`、`postPerPage`、`showArchives`、`lightAndDarkMode` 等）。

