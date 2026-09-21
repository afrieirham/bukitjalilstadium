import type { Contribution } from "~/lib/contributions";

const modules = import.meta.glob<{ default: Contribution }>(
  "/data/contributions/**/*.json",
  { eager: true },
);

export const contributions: Contribution[] = Object.entries(modules)
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([, module]) => module.default);
