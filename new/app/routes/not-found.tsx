import { Link } from "react-router";

import { PageContainer } from "~/components/core/app-shell";
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
    <PageContainer className="flex max-w-2xl flex-col items-start gap-4">
      <h1 className="text-3xl font-semibold tracking-tight text-balance">
        Page not found
      </h1>
      <div className="bg-primary h-[3px] w-16" aria-hidden />
      <p className="text-muted-foreground max-w-prose">
        The page you are looking for does not exist. The seat map has every
        Section.
      </p>
      <Link to="/" className={cn(buttonVariants())}>
        Back to the seat map
      </Link>
    </PageContainer>
  );
}
