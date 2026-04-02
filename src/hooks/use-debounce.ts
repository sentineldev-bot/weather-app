import { useEffect, useState } from "react";

/**
 * Debounce a value by a given delay.
 */
export function useDebounce<T>(value: T, delayMs: number = 350): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
