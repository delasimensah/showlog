import { StatusBar } from "expo-status-bar";

import { Text, VStack } from "@/components";

const IndexRoute = () => {
  return (
    <VStack justify="center" className="flex-1 gap-4 bg-page px-5">
      <StatusBar style="light" />
      <Text className="font-app-extrabold text-[34px] text-text">Showlog</Text>
      <Text className="text-base text-muted">
        Track the TV shows and anime you watch, see where you left off, and know
        when the next episode is out.
      </Text>
    </VStack>
  );
};

export default IndexRoute;
