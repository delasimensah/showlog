import { Stack } from "expo-router";
import React from "react";

import EmptyState, { EmptyIcon } from "../../../ui/EmptyState/EmptyState";

const UpcomingScreen: React.FC = () => {
  return (
    <>
      <Stack.Title large>Upcoming</Stack.Title>
      <EmptyState
        usesSystemHeader
        title="Nothing scheduled yet"
        subtitle="Nothing scheduled for your shows yet."
        icon={<EmptyIcon name="calendar-outline" />}
      />
    </>
  );
};

export default UpcomingScreen;
