export function joinMeta(parts: (string | null | undefined)[]) {
  return parts
    .filter((part) => part !== null && part !== undefined && part.length > 0)
    .join(" · ");
}

export function seasonsLabel(count: number) {
  return count === 1 ? "1 season" : `${count} seasons`;
}
