import * as Updates from "expo-updates";
import { useEffect, useState } from "react";

import { applyAvailableUpdate } from "@/utils";

export function useApplyAvailableUpdate(): boolean {
  const [isChecking, setIsChecking] = useState(() => !__DEV__);

  useEffect(() => {
    if (__DEV__) {
      return;
    }
    let cancelled = false;
    void applyAvailableUpdate(Updates).then((reloaded) => {
      if (!cancelled && !reloaded) {
        setIsChecking(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return isChecking;
}
