import { useEffect, useRef } from "react";

/**
 * Fires `onIntersect` when the returned ref's element scrolls into view.
 * Attach the ref to a sentinel <div> at the bottom of a list.
 */
export function useInfiniteScroll({ onIntersect, enabled = true, rootMargin = "400px" }) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onIntersect();
      },
      { rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [onIntersect, enabled, rootMargin]);

  return sentinelRef;
}
