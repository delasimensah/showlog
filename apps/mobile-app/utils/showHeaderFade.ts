const FADE = 72;

export function fillOpacity(offset: number, threshold: number) {
  "worklet";
  const start = Math.max(threshold - FADE, 0);
  const span = threshold - start;
  if (span <= 0) return offset >= threshold ? 1 : 0;
  const progress = (offset - start) / span;
  return Math.min(1, Math.max(0, progress));
}
