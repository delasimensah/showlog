import { useState } from "react";

/** The moment this screen opened, so a countdown does not jump on every render. */
export function useOpenedAt() {
  const [openedAt] = useState(() => Date.now());
  return openedAt;
}
