// =========================================================================
// 1. useDebounce Hook
// =========================================================================

import { useEffect, useState } from "react";

// =========================================================================
// Debounce genérico para qualquer tipo de valor
// =========================================================================
export function useDebounce<T>(value: T, delay: number = 1000): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
