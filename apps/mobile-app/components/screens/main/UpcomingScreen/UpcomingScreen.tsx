import React from "react";

import EmptyState from "../../../ui/EmptyState/EmptyState";
import TvMark from "../../../ui/TvMark/TvMark";

const UpcomingScreen: React.FC = () => {
  return (
    <EmptyState
      pageTitle="Upcoming"
      title="Nothing scheduled yet"
      subtitle="Nothing scheduled for your shows yet."
      icon={<TvMark />}
    />
  );
};

export default UpcomingScreen;
