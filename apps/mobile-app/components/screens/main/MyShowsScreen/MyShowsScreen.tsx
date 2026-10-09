import React from "react";

import EmptyState from "../../../ui/EmptyState/EmptyState";
import TvMark from "../../../ui/TvMark/TvMark";

const MyShowsScreen: React.FC = () => {
  return (
    <EmptyState
      pageTitle="My shows"
      title="Your list is empty"
      subtitle="Search for a show to add it."
      icon={<TvMark />}
    />
  );
};

export default MyShowsScreen;
