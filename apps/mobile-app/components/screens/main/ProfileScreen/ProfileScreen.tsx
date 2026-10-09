import React from "react";
import { Alert, ScrollView } from "react-native";

import { useAccount, useSession } from "@/hooks";

import Button from "../../../ui/Button/Button";
import SkeletonCard from "../../../ui/SkeletonCard/SkeletonCard";
import { HStack, VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";

const ProfileScreen: React.FC = () => {
  const account = useAccount();
  const { signOut } = useSession();

  const confirmSignOut = () => {
    Alert.alert(
      "Sign out?",
      "You can sign in again with your email and password.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign out",
          style: "destructive",
          onPress: () => {
            void signOut();
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <VStack spacing="2xl" paddingY="md" className="px-5">
        <VStack spacing="sm">
          <HStack
            align="center"
            justify="between"
            paddingX="md"
            className="min-h-[52px] rounded-2xl bg-surface"
          >
            <Text className="font-app-medium text-[15px] text-text">Name</Text>
            {account === undefined ? (
              <SkeletonCard width={150} height={11} radius={4} />
            ) : (
              <Text
                className="max-w-[60%] font-app-medium text-[13px] text-muted"
                numberOfLines={1}
              >
                {account.name ?? "—"}
              </Text>
            )}
          </HStack>
          <HStack
            align="center"
            justify="between"
            paddingX="md"
            className="min-h-[52px] rounded-2xl bg-surface"
          >
            <Text className="font-app-medium text-[15px] text-text">
              Account
            </Text>
            {account === undefined ? (
              <SkeletonCard width={150} height={11} radius={4} />
            ) : (
              <Text
                className="max-w-[60%] font-app-medium text-[13px] text-muted"
                numberOfLines={1}
              >
                {account.email ?? "—"}
              </Text>
            )}
          </HStack>
        </VStack>
        <Button
          text="Sign out"
          variant="quietDanger"
          size="lg"
          fullWidth
          onPress={confirmSignOut}
        />
      </VStack>
    </ScrollView>
  );
};

export default ProfileScreen;
