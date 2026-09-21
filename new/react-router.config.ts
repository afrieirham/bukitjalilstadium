import type { Config } from "@react-router/dev/config";

import { sections } from "./app/components/widget/seat-plan-data";
import { sectionSlug } from "./app/lib/contributions";

export default {
  // Static site: every route is prerendered and served as an asset, with no
  // server at runtime. See docs/adr/0001-static-prerender-on-pages.md
  ssr: false,
  prerender: [
    "/",
    "/404",
    ...sections.map((section) => `/${sectionSlug(section.id)}`),
  ],
} satisfies Config;
