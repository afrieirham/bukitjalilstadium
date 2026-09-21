import { useCallback, useEffect, useRef } from "react";

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/**
 * Cloudflare's always-passes test key. It keeps the form usable in development
 * and on preview deployments; set VITE_TURNSTILE_SITE_KEY to the real key for
 * production builds.
 */
const TEST_SITE_KEY = "1x00000000000000000000AA";

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? TEST_SITE_KEY;

const TOKEN_TIMEOUT_MS = 20_000;

interface TurnstileWidget {
  render(element: HTMLElement, options: Record<string, unknown>): string;
  execute(widget: string): void;
  reset(widget: string): void;
  remove(widget: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileWidget;
  }
}

let scriptPromise: Promise<void> | null = null;

function loadTurnstile(): Promise<void> {
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      if (window.turnstile) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error("Could not load the bot challenge."));
      document.head.append(script);
    });
  }

  return scriptPromise;
}

/**
 * Renders one Turnstile widget and hands out a fresh token per call, because a
 * token can only be spent once and every photo travels in its own request.
 *
 * Tokens arrive through the widget's callback rather than the return value of
 * execute(), which resolves before a freshly reset widget has one to give.
 */
export function useTurnstile(
  containerRef: React.RefObject<HTMLDivElement | null>,
) {
  const widgetRef = useRef<string | null>(null);
  const pendingRef = useRef<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
    timer: number;
  } | null>(null);

  const settle = useCallback((error: Error | null, token = "") => {
    const pending = pendingRef.current;
    if (!pending) return;

    window.clearTimeout(pending.timer);
    pendingRef.current = null;

    if (error) pending.reject(error);
    else pending.resolve(token);
  }, []);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    let cancelled = false;

    loadTurnstile()
      .then(() => {
        if (cancelled || !window.turnstile || !containerRef.current) return;

        widgetRef.current = window.turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          execution: "execute",
          appearance: "interaction-only",
          callback: (token: string) => settle(null, token),
          "error-callback": () =>
            settle(new Error("The bot challenge could not be completed.")),
          "timeout-callback": () =>
            settle(new Error("The bot challenge timed out. Try again.")),
        });
      })
      .catch(() => {
        // The submit path reports this; there is nothing useful to do here.
      });

    return () => {
      cancelled = true;

      const widget = widgetRef.current;
      if (widget && window.turnstile) window.turnstile.remove(widget);
      widgetRef.current = null;
    };
  }, [containerRef, settle]);

  return useCallback(async () => {
    await loadTurnstile();

    const widget = widgetRef.current;
    if (!widget || !window.turnstile) {
      throw new Error("The bot challenge is still loading. Try again in a moment.");
    }

    return new Promise<string>((resolve, reject) => {
      const timer = window.setTimeout(
        () => settle(new Error("The bot challenge did not answer. Try again.")),
        TOKEN_TIMEOUT_MS,
      );

      pendingRef.current = { resolve, reject, timer };

      // Clear any spent token so the widget issues a new one.
      window.turnstile?.reset(widget);
      window.turnstile?.execute(widget);
    });
  }, [settle]);
}
