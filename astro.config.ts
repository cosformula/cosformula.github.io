import { defineConfig, envField } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { transformerFileName } from "./src/utils/transformers/fileName";
import { SITE } from "./src/config";

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  integrations: [
    mdx(),
    sitemap({
      filter: page => SITE.showArchives || !page.endsWith("/archives"),
    }),
  ],
  redirects: {
    // 旧URL的重定向规则
    // 英文文章（在 src/data/blog/en/ 目录下的）
    "/blog/how-i-fixed-godot-shadow-en": "/posts/en/how-i-fixed-godot-shadow",
    "/blog/how-i-fixed-godot-shadow": "/posts/zh/how-i-fixed-godot-shadow",
    "/blog/how-i-fix-godot-shadow": "/posts/zh/how-i-fixed-godot-shadow",

    // 中文文章（在 src/data/blog/ 根目录下的）
    "/blog/web-performance": "/zh/posts/web-performance",
    "/blog/hybrid-web-page-safe-area": "/zh/posts/hybrid-web-page-safe-area",
    "/blog/canvas-text-wrap": "/zh/posts/canvas-text-wrap",
    "/blog/frontend-entry-level-course":
      "/zh/posts/frontend-entry-level-course",

    // RSS订阅重定向
    "/rss": "/rss.xml",
  },
  markdown: {
    remarkPlugins: [
      remarkMath,
      remarkToc,
      [remarkCollapse, { test: "Table of contents" }],
    ],
    rehypePlugins: [[rehypeKatex, { strict: false }]],
    shikiConfig: {
      // For more themes, visit https://shiki.style/themes
      themes: { light: "min-light", dark: "night-owl" },
      defaultColor: false,
      wrap: false,
      transformers: [
        transformerFileName({ style: "v2", hideDot: false }),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationDiff({ matchAlgorithm: "v3" }),
      ],
    },
  },
  vite: {
    // eslint-disable-next-line
    // @ts-ignore
    // This will be fixed in Astro 6 with Vite 7 support
    // See: https://github.com/withastro/astro/issues/14030
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
  image: {
    responsiveStyles: true,
    layout: "constrained",
  },
  env: {
    schema: {
      PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
    },
  },
  experimental: {
    preserveScriptOrder: true,
  },
  i18n: {
    defaultLocale: "en",
    locales: ["en", "zh"],
  },
});
