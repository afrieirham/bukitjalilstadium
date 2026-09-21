import type { Config } from "@react-router/dev/config";

export default {
  // Static site: every route is prerendered and served as an asset, with no
  // server at runtime. See docs/adr/0001-static-prerender-on-pages.md
  ssr: false,
  prerender: ["/", "/404"],
} satisfies Config;
