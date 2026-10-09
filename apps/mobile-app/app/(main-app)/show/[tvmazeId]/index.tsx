import { useLocalSearchParams } from "expo-router";

import { ShowScreen } from "@/components";

const ShowRoute = () => {
  const { tvmazeId } = useLocalSearchParams<{ tvmazeId: string }>();
  return <ShowScreen tvmazeId={Number(tvmazeId)} />;
};

export default ShowRoute;
