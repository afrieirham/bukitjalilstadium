import { useEffect, useState } from "react";

import { Cancel01Icon, Menu01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link, NavLink, useLocation } from "react-router";

import { buttonVariants } from "~/components/core/button";
import { cn } from "~/lib/utils";

const NAV = [
  { to: "/", label: "Seat map" },
  { to: "/contributors", label: "Contributors" },
];

function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Let Escape dismiss the panel without leaving the page. Links inside the
  // panel close it themselves, so there is no route-change effect to sync.
  useEffect(() => {
    if (!menuOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <header className="border-border bg-background sticky top-0 z-30 border-b">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-3 px-3 sm:px-4">
        <Link
          to="/"
          className="text-foreground flex min-w-0 items-baseline gap-2"
        >
          <span className="truncate text-sm font-semibold tracking-tight">
            Bukit Jalil Stadium
          </span>
          <span className="text-muted-foreground hidden text-[11px] lg:inline">
            National Stadium · Kuala Lumpur
          </span>
        </Link>

        <nav className="ml-auto hidden shrink-0 items-center gap-0.5 sm:flex sm:gap-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-2 py-1.5 text-sm whitespace-nowrap transition-colors sm:px-2.5",
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
            <span className="hidden sm:inline">Share a photo</span>
            <span className="sm:hidden">Share</span>
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="site-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="text-muted-foreground hover:text-foreground hover:bg-muted/60 ml-auto rounded-md p-2 transition-colors sm:hidden"
        >
          <HugeiconsIcon
            icon={menuOpen ? Cancel01Icon : Menu01Icon}
            className="size-5"
          />
        </button>
      </div>

      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="bg-black/60 fixed inset-x-0 top-14 bottom-0 z-40 cursor-default sm:hidden"
          />
          <nav
            id="site-nav"
            className="border-border bg-card absolute inset-x-0 top-full z-50 border-b sm:hidden"
          >
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "border-border hover:bg-muted/60 block border-b px-4 py-3 text-sm transition-colors",
                    isActive
                      ? "text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}

            <Link
              to="/contribute"
              onClick={() => setMenuOpen(false)}
              className={cn(
                buttonVariants({ size: "sm" }),
                "m-4 flex justify-center",
              )}
            >
              Share a photo
            </Link>
          </nav>
        </>
      )}
    </header>
  );
}

/**
 * The chrome every page shares, so the site reads as one product rather than
 * four pages that happen to share a repository. The home fills the viewport
 * between header and page footer, so the shell is a full-height column.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  // The home is a single-viewport screen: cap the shell to the viewport so the
  // page itself never scrolls and the seat map stays visible. Everything else
  // scrolls normally.
  const singleViewport = pathname === "/";

  return (
    <div
      className={cn(
        "flex min-h-dvh flex-col",
        singleViewport && "h-dvh overflow-hidden",
      )}
    >
      <SiteHeader />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
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
    <main
      className={cn("mx-auto w-full max-w-[1400px] px-4 py-6 md:py-8", className)}
    >
      {children}
    </main>
  );
}
