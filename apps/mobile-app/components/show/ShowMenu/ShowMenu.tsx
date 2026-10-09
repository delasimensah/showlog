import { Stack } from "expo-router";
import React from "react";

interface ShowMenuProps {
  watchLater: boolean;
  stopped: boolean;
  onWatchLater: () => void;
  onStop: () => void;
  onResume: () => void;
  onRemove: () => void;
}

const ShowMenu: React.FC<ShowMenuProps> = ({
  watchLater,
  stopped,
  onWatchLater,
  onStop,
  onResume,
  onRemove,
}) => {
  return (
    <Stack.Toolbar placement="right">
      <Stack.Toolbar.Menu accessibilityLabel="Menu" icon="ellipsis">
        <Stack.Toolbar.MenuAction onPress={onWatchLater}>
          {watchLater ? "Remove from Watch later" : "Watch later"}
        </Stack.Toolbar.MenuAction>
        <Stack.Toolbar.MenuAction
          destructive={!stopped}
          onPress={stopped ? onResume : onStop}
        >
          {stopped ? "Resume" : "Stop watching"}
        </Stack.Toolbar.MenuAction>
        <Stack.Toolbar.MenuAction destructive onPress={onRemove}>
          Remove from my list
        </Stack.Toolbar.MenuAction>
      </Stack.Toolbar.Menu>
    </Stack.Toolbar>
  );
};

export default ShowMenu;
