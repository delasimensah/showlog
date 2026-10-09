import { Stack, useRouter } from "expo-router";
import React from "react";

import EmptyState, { EmptyIcon } from "../../../ui/EmptyState/EmptyState";

const UpNextScreen: React.FC = () => {
  const router = useRouter();

  return (
    <>
      <Stack.Title large>Up next</Stack.Title>
      <EmptyState
        usesSystemHeader
        title="Add the shows you watch"
        subtitle="Find them in Discover."
        icon={<EmptyIcon name="play-circle-outline" />}
        buttonText="Discover"
        onButtonPress={() => router.push("/discover")}
      />
    </>
  );
};

export default UpNextScreen;
