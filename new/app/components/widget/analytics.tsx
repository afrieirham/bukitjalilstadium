import { useEffect } from "react";

import {
  UMAMI_SCRIPT,
  UMAMI_WEBSITE_ID,
  shouldLoadAnalytics,
} from "~/lib/analytics";

/**
 * Loads the self-hosted Umami tracker, on the live site only.
 *
 * Added after hydration rather than rendered into the markup, for two reasons:
 * the prerendered HTML is served by preview deployments too, where the tracker
 * should not report, and a script added this way cannot block rendering.
 *
 * Cloudflare Web Analytics is not here: it is enabled on the Pages project and
 * Cloudflare injects its beacon itself, which also keeps preview traffic out.
 */
export function Analytics() {
  useEffect(() => {
    if (!shouldLoadAnalytics(window.location.hostname)) return;

    const script = document.createElement("script");
    script.defer = true;
    script.src = UMAMI_SCRIPT;
    script.dataset.websiteId = UMAMI_WEBSITE_ID;
    document.head.append(script);

    return () => script.remove();
  }, []);

  return null;
}
