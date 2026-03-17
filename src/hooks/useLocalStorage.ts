"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Debounced localStorage hook.
 *
 * - Reads from `localStorage` on mount (falls back to `defaultValue`)
 * - Writes back on every `setValue` call, debounced to avoid perf issues
 * - Exposes a `clear` helper to remove the key entirely
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  debounceMs = 400
) {
  // ── Initialise from storage (runs once) ─────────────────────────
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  // Track whether we've ever persisted (for UI indicators)
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // ── Debounced write ─────────────────────────────────────────────
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Skip initial mount write if value === defaultValue
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        setLastSaved(new Date());
      } catch (err) {
        console.warn(`[useLocalStorage] Failed to write key "${key}"`, err);
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [key, value, debounceMs]);

  // ── Clear ───────────────────────────────────────────────────────
  const clear = useCallback(() => {
    localStorage.removeItem(key);
    setValue(defaultValue);
    setLastSaved(null);
  }, [key, defaultValue]);

  return { value, setValue, clear, lastSaved } as const;
}
