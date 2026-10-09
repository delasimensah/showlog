import React from "react";

import EmptyState from "../../../ui/EmptyState/EmptyState";
import TvMark from "../../../ui/TvMark/TvMark";

const DiscoverScreen: React.FC = () => {
  return (
    <EmptyState
      pageTitle="Discover"
      title="No suggestions yet"
      subtitle="Shows you may like show up here."
      icon={<TvMark />}
    />
  );
};

export default DiscoverScreen;
