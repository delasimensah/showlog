import { useRouter } from "expo-router";
import React from "react";

import EmptyState from "../../../ui/EmptyState/EmptyState";
import HeaderButton from "../../../ui/HeaderButton/HeaderButton";
import TvMark from "../../../ui/TvMark/TvMark";

const UpNextScreen: React.FC = () => {
  const router = useRouter();

  return (
    <EmptyState
      pageTitle="Up next"
      title="Add the shows you watch"
      subtitle="Find them in Discover or search by name."
      icon={<TvMark />}
      buttonText="Discover"
      onButtonPress={() => router.push("/discover")}
      headerRight={
        <HeaderButton
          icon="person"
          accessibilityLabel="Profile"
          onPress={() => router.push("/profile")}
        />
      }
    />
  );
};

export default UpNextScreen;
