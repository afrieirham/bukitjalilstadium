import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False while the prerendered HTML is being hydrated and true afterwards.
 * Use it to delay anything the static build cannot know, such as state read
 * from the URL, so the first client render matches the markup.
 */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
