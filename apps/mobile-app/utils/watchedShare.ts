export function watchedShare(watched: number, total: number) {
  return total === 0 ? 0 : watched / total;
}
