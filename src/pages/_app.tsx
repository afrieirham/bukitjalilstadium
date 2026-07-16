import "@/styles/globals.css";
import type { AppProps } from "next/app";
import "react-photo-view/dist/react-photo-view.css";
import posthog from "posthog-js";

if (typeof window !== "undefined") {
  posthog.init("phc_teM97m62HSztsrdRBajuuVthJ3M5XWifpkCYoydHhPaP", {
    api_host: "https://eu.i.posthog.com",
    ui_host: "https://eu.posthog.com",
    defaults: "2026-01-30",
    capture_exceptions: true,
    debug: process.env.NODE_ENV === "development",
  });
}

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
