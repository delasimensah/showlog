const SCREEN_PADDING = 20;
const COLUMN_GAP = 12;
const COLUMNS = 3;

export function posterColumnWidth(screenWidth: number) {
  const content = screenWidth - SCREEN_PADDING * 2;
  return (content - COLUMN_GAP * (COLUMNS - 1)) / COLUMNS;
}
