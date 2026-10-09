import { Stack } from "expo-router";
import React from "react";

import { tabStackScreenOptions } from "@/utils";

export const unstable_settings = {
  anchor: "index",
};

const UpcomingLayout: React.FC = () => {
  return <Stack screenOptions={tabStackScreenOptions} />;
};

export default UpcomingLayout;
