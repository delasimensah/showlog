import { Link, Stack } from "expo-router";

import { Text, VStack } from "@/components";

const NotFoundScreen = () => {
  return (
    <>
      <Stack.Screen options={{ title: "Oops! Not Found" }} />
      <VStack align="center" justify="center" className="flex-1 bg-page p-5">
        <Text className="mb-4 text-center font-app-bold text-xl text-text">
          This screen doesn&apos;t exist.
        </Text>
        <Link href="/" className="mt-4">
          <Text className="text-base text-primary">Go to home screen!</Text>
        </Link>
      </VStack>
    </>
  );
};

export default NotFoundScreen;
