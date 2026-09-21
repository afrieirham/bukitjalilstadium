import { Link } from "react-router";

import { buttonVariants } from "~/components/core/button";
import { cn } from "~/lib/utils";

export function meta() {
  return [
    { title: "Page not found | Bukit Jalil Stadium" },
    { name: "robots", content: "noindex" },
  ];
}

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-7xl flex-col items-start gap-4 p-4 pt-16">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-muted-foreground">
        The page you are looking for does not exist.
      </p>
      <Link to="/" className={cn(buttonVariants())}>
        Back to the seat map
      </Link>
    </main>
  );
}
