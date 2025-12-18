# cosformula.org（重构方圆 / Beyond Formula）

本站点（https://www.cosformula.org/）的源码仓库：基于 Astro 构建的静态站点，包含双语博客、作品页、标签与站内搜索。

- 设计文档：`docs/design.md`
- 工程文档：`docs/engineering.md`

## 本地开发

要求：Node.js 20+。

```bash
# 依赖安装（二选一）
npm ci
# pnpm install

# 启动开发服务器
npm run dev
```

## 构建与预览

```bash
npm run build
npm run preview
```

> 搜索使用 Pagefind：开发模式下要看到搜索结果，需要至少执行一次 `npm run build` 生成 `public/pagefind/` 索引。

## 写文章

- 中文：`src/data/blog/`
- 英文：`src/data/blog/en/`

更多字段、目录约定与双语互链规则见：`docs/engineering.md`。
