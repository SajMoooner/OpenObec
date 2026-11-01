"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@openobec/api-client";
export function useResource<T>(path: string | null) {
  const [attempt, setAttempt] = useState(0);
  const key = useMemo(() => ({ path, attempt }), [path, attempt]);
  const [state, setState] = useState<{ key: typeof key; data?: T; error?: Error }>();
  useEffect(() => {
    if (!key.path) return;
    const controller = new AbortController();
    api<T>(key.path, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setState({ key, data });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({
            key,
            error: error instanceof Error ? error : new Error("Údaje sa nepodarilo načítať."),
          });
      });
    return () => controller.abort();
  }, [key]);
  const current = state?.key === key ? state : undefined;
  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  return { data: current?.data, error: current?.error, loading: Boolean(path) && !current, reload };
}
