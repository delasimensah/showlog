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
 * A custom title is laid out in the gap between the bar buttons, and a
 * view as wide as the screen is pushed off centre. With a round button on
 * each side the frame is exactly that gap, so a long name ends in "..."
 * before a button. With the Watch season pill the frame is the full bar,
 * with padding that keeps the words in the gap.
 */
export function headerTitleFrame(
  screenWidth: number,
  trailing: "icon" | "label"
): { width: number; paddingLeft?: number; paddingRight?: number } {
  if (trailing === "label") {
    return {
      width: screenWidth,
      paddingLeft: HEADER_ICON_SLOT,
      paddingRight: HEADER_LABEL_SLOT,
    };
  }
  return { width: Math.max(screenWidth - 2 * HEADER_ICON_SLOT, 0) };
}
