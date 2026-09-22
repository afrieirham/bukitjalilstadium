import { Link, NavLink } from "react-router";

import { buttonVariants } from "~/components/core/button";
import { cn } from "~/lib/utils";

const NAV = [
  { to: "/", label: "Seat map" },
  { to: "/contributors", label: "Contributors" },
];

function SiteHeader() {
  return (
    <header className="border-border bg-background sticky top-0 z-30 border-b">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:gap-3 sm:px-4">
        <Link
          to="/"
          className="text-foreground hidden shrink-0 text-sm font-semibold tracking-tight sm:inline"
        >
          Bukit Jalil
          <span className="hidden lg:inline"> Stadium</span>
        </Link>

        <nav className="ml-auto flex items-center gap-0.5 sm:gap-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-2.5 py-1.5 text-sm whitespace-nowrap transition-colors",
                  isActive
                    ? "text-foreground bg-muted font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}

          <Link
            to="/contribute"
            className={cn(buttonVariants({ size: "sm" }), "ml-1")}
          >
            Share a photo
          </Link>
        </nav>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-border mt-16 border-t">
      <div className="text-muted-foreground mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p>Seat views shared by fans, for fans.</p>
        <p>
          Built by{" "}
          <a
            href="https://afrieirham.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground underline-offset-4 hover:underline"
          >
            Afrie Irham
          </a>
        </p>
      </div>
    </footer>
  );
}

/**
 * The chrome every page shares, so the site reads as one product rather than
 * four pages that happen to share a repository.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}

/**
 * The page column. Pages vary in width because their content does, but they
 * share the gutters and vertical rhythm.
 */
export function PageContainer({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <main className={cn("mx-auto w-full max-w-7xl px-4 py-6 md:py-8", className)}>
      {children}
    </main>
  );
}
