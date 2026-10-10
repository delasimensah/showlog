import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { useState } from "react";

/**
 * The Discover rows for my list. They load once my list is known, and the
 * previous rows stay on screen while new ones load after I add a show.
 */
export function useDiscoverRows() {
  const taste = useQuery(api.discover.taste, {});
  const rows = useQuery(api.discover.rows, taste ?? "skip");
  const [kept, setKept] = useState(rows);
  if (rows !== undefined && rows !== kept) setKept(rows);
  return rows ?? kept;
}
