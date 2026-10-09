import * as Haptics from "expo-haptics";

export function playTickHaptic() {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}
