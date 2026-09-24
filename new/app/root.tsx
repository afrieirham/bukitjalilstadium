import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import { Analytics } from "~/components/widget/analytics";
import { AppShell } from "~/components/core/app-shell";

import type { Route } from "./+types/root";

import "./app.css";

// Inter is self-hosted through @fontsource-variable/inter in app.css, so there
// is no Google Fonts stylesheet to fetch or preconnect to.
export const links: Route.LinksFunction = () => [];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="selection:bg-primary/25">
        <AppShell>{children}</AppShell>
        <ScrollRestoration />
        <Scripts />
        <Analytics />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col items-start gap-4 px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{message}</h1>
      <div className="bg-primary h-[3px] w-16" aria-hidden />
      <p className="text-muted-foreground max-w-prose">{details}</p>
      {stack && (
        <pre className="border-border bg-card w-full overflow-x-auto rounded-lg border p-4 text-xs">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
