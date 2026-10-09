import { Stack, useRouter } from "expo-router";
import React from "react";

import EmptyState, { EmptyIcon } from "../../../ui/EmptyState/EmptyState";

const DiscoverScreen: React.FC = () => {
  const router = useRouter();

  return (
    <>
      <Stack.Title large>Discover</Stack.Title>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          accessibilityLabel="Search"
          icon="magnifyingglass"
          onPress={() => router.push("/search")}
        />
      </Stack.Toolbar>
      <EmptyState
        usesSystemHeader
        title="No suggestions yet"
        subtitle="Shows you may like show up here."
        icon={<EmptyIcon name="compass-outline" />}
      />
    </>
  );
};

export default DiscoverScreen;
