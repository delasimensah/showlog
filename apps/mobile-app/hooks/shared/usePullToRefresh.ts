import { useCallback, useRef, useState } from "react";

import { showErrorToast } from "@/utils";

export function usePullToRefresh(load: (stamp: number) => Promise<unknown>) {
  const [refreshing, setRefreshing] = useState(false);
  const running = useRef(false);

  const onRefresh = useCallback((): Promise<void> => {
    if (running.current) return Promise.resolve();
    running.current = true;
    setRefreshing(true);
    return load(Date.now())
      .then(() => undefined)
      .catch(() => {
        showErrorToast("Could not refresh.");
      })
      .finally(() => {
        running.current = false;
        setRefreshing(false);
      });
  }, [load]);

  return { refreshing, onRefresh };
}
