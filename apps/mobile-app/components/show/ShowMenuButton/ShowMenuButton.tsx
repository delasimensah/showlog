import { Stack } from "expo-router";
import React from "react";

const ShowMenuButton: React.FC = () => {
  return (
    <Stack.Toolbar placement="right">
      <Stack.Toolbar.Button accessibilityLabel="Menu" icon="ellipsis" />
    </Stack.Toolbar>
  );
};

export default ShowMenuButton;
