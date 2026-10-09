import { Stack, useRouter } from "expo-router";
import React from "react";

import EmptyState, { EmptyIcon } from "../../../ui/EmptyState/EmptyState";

const MyShowsScreen: React.FC = () => {
  const router = useRouter();

  return (
    <>
      <Stack.Title large>My shows</Stack.Title>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          accessibilityLabel="Profile"
          icon="person"
          onPress={() => router.push("/profile")}
        />
      </Stack.Toolbar>
      <EmptyState
        usesSystemHeader
        title="Your list is empty"
        subtitle="Find a show in Discover."
        icon={<EmptyIcon name="grid-outline" />}
        buttonText="Discover"
        onButtonPress={() => router.push("/discover")}
      />
    </>
  );
};

export default MyShowsScreen;
