import { useCallback, useEffect, useRef } from "react";
import {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

export function useShowHeaderScroll(onPull: (offset: number) => void) {
  const scrollY = useSharedValue(0);
  const onPullRef = useRef(onPull);

  useEffect(() => {
    onPullRef.current = onPull;
  });

  const onPullOffset = useCallback((offset: number) => {
    onPullRef.current(offset);
  }, []);

  const onScroll = useAnimatedScrollHandler(
    {
      onScroll: (event) => {
        scrollY.value = event.contentOffset.y;
        if (event.contentOffset.y < 0) {
          scheduleOnRN(onPullOffset, event.contentOffset.y);
        }
      },
    },
    [onPullOffset]
  );

  return { scrollY, onScroll };
}
