const ROW_SIZE = 20;

/** Same seed, same 20 shows. A new seed is a new pick. */
export function pickFromPool<T>(shows: readonly T[], seed: number): T[] {
  const copy = shows.slice();
  let state = seed >>> 0;
  for (let index = copy.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const swap = state % (index + 1);
    const current = copy[index];
    copy[index] = copy[swap] as T;
    copy[swap] = current as T;
  }
  return copy.slice(0, ROW_SIZE);
}
