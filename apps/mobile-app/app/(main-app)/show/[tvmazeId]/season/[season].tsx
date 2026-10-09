import { useLocalSearchParams } from "expo-router";

import { SeasonScreen } from "@/components";

const SeasonRoute = () => {
  const { tvmazeId, season } = useLocalSearchParams<{
    tvmazeId: string;
    season: string;
  }>();

  return (
    <SeasonScreen tvmazeId={Number(tvmazeId)} seasonNumber={Number(season)} />
  );
};

export default SeasonRoute;
