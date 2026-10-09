const HEADER_EDGE = 16;
const HEADER_BUTTON = 44;
const HEADER_GAP = 8;

/** Back button, or the round menu button, plus the gap before the title. */
export const HEADER_ICON_SLOT = HEADER_EDGE + HEADER_BUTTON + HEADER_GAP;

/**
 * The Watch season pill. "Season watched" is the longer label.
 * Includes the glass padding and the gap before the title.
 */
export const HEADER_LABEL_SLOT = 220;

/**
 * The navigation bar centres a custom title on the whole bar, so a long
 * name runs under the buttons. This frame is the full bar, with padding
 * that keeps the words in the gap between those buttons.
 */
export function headerTitleFrame(
  screenWidth: number,
  trailing: "icon" | "label"
): { width: number; paddingLeft: number; paddingRight: number } {
  return {
    width: screenWidth,
    paddingLeft: HEADER_ICON_SLOT,
    paddingRight: trailing === "label" ? HEADER_LABEL_SLOT : HEADER_ICON_SLOT,
  };
}
