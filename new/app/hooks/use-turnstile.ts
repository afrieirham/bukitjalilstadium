import { useCallback, useEffect, useRef } from "react";

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

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

const NOT_CONFIGURED = "The bot challenge is not configured yet.";

let scriptPromise: Promise<void> | null = null;
let siteKeyPromise: Promise<string> | null = null;

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

function loadSiteKey(): Promise<string> {
  if (!siteKeyPromise) {
    siteKeyPromise = fetch("/api/config")
      .then(async (response) => {
        if (!response.ok) throw new Error(NOT_CONFIGURED);
        const body = (await response.json()) as { turnstileSiteKey?: string };
        if (!body.turnstileSiteKey) throw new Error(NOT_CONFIGURED);
        return body.turnstileSiteKey;
      })
      .catch((error: unknown) => {
        // Let a later attempt try again rather than caching the failure.
        siteKeyPromise = null;
        throw error;
      });
  }

  return siteKeyPromise;
}

/**
 * Renders one Turnstile widget and hands out a fresh token per call, because a
 * token can only be spent once and every photo travels in its own request.
 *
 * Tokens arrive through the widget's callback rather than the return value of
 * execute(), which resolves before a freshly reset widget has one to give. The
 * site key comes from the server, since a Pages project configured by
 * wrangler.jsonc cannot take a plain build variable from the dashboard.
 */
export function useTurnstile(
  containerRef: React.RefObject<HTMLDivElement | null>,
) {
  const widgetRef = useRef<string | null>(null);
  const readyRef = useRef<Promise<void> | null>(null);
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

  const ensureWidget = useCallback(() => {
    if (!readyRef.current) {
      readyRef.current = (async () => {
        const [siteKey] = await Promise.all([loadSiteKey(), loadTurnstile()]);

        if (!containerRef.current || !window.turnstile) {
          throw new Error("The bot challenge is not ready yet.");
        }

        widgetRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          execution: "execute",
          appearance: "interaction-only",
          callback: (token: string) => settle(null, token),
          "error-callback": () =>
            settle(new Error("The bot challenge could not be completed.")),
          "timeout-callback": () =>
            settle(new Error("The bot challenge timed out. Try again.")),
        });
      })().catch((error: unknown) => {
        readyRef.current = null;
        throw error;
      });
    }

    return readyRef.current;
  }, [containerRef, settle]);

  const dispose = useCallback(() => {
    const widget = widgetRef.current;
    if (widget && window.turnstile) window.turnstile.remove(widget);
    widgetRef.current = null;
  }, []);

  useEffect(() => {
    // Surfaced on submit instead; a failure here is not actionable yet.
    ensureWidget().catch(() => {});

    return () => {
      dispose();
      readyRef.current = null;
      settle(new Error("The bot challenge was torn down."));
    };
  }, [dispose, ensureWidget, settle]);

  const getToken = useCallback(async () => {
    await ensureWidget();

    const widget = widgetRef.current;
    if (!widget || !window.turnstile) throw new Error(NOT_CONFIGURED);

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
  }, [ensureWidget, settle]);

  return { getToken, dispose };
}
