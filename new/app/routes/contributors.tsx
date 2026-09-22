import { Link } from "react-router";

import { contributions } from "~/data/contributions";
import { creditedContributors, sectionSlug } from "~/lib/contributions";
import { SITE_NAME, SITE_URL } from "~/lib/site";

import type { Route } from "./+types/contributors";

export function loader() {
  return { credits: creditedContributors(contributions) };
}

export function meta() {
  const title = `Contributors | ${SITE_NAME}`;
  const description =
    "The fans who shared seat views from Stadium Bukit Jalil (TM Stadium Nasional), Kuala Lumpur.";

  return [
    { title },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: `${SITE_URL}/contributors` },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: `${SITE_URL}/og.png` },
    { name: "twitter:card", content: "summary_large_image" },
  ];
}

export default function Contributors({ loaderData }: Route.ComponentProps) {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold">Contributors</h1>
        <p className="text-muted-foreground">
          Every view on this site was shared by a fan. These are the people who
          made it useful.
        </p>
      </header>

      {loaderData.credits.length === 0 ? (
        <p className="text-muted-foreground">
          Nobody has been credited yet. Yours could be the first.
        </p>
      ) : (
        <ul className="divide-border divide-y">
          {loaderData.credits.map((credit) => (
            <li
              key={`${credit.name}:${credit.href ?? ""}`}
              className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3"
            >
              {credit.href ? (
                <a
                  href={credit.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:underline"
                >
                  {credit.name}
                </a>
              ) : (
                <span className="font-medium">{credit.name}</span>
              )}
              <span className="text-muted-foreground text-sm">
                {credit.sections.map((section, index) => (
                  <span key={section}>
                    {index > 0 && ", "}
                    <Link to={`/${sectionSlug(section)}`} className="hover:underline">
                      {`Section ${section}`}
                    </Link>
                  </span>
                ))}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
