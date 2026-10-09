import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import React, { useState } from "react";
import { Alert, Linking, Pressable, ScrollView, View } from "react-native";
import { tvTime, tvTimeParts } from "shared";

import { COLORS } from "@/constants";
import {
  useAccount,
  useExportHistory,
  useProfileStats,
  useSession,
} from "@/hooks";
import { localDay, saveHistoryFile, showErrorToast } from "@/utils";

import Button from "../../../ui/Button/Button";
import SkeletonCard from "../../../ui/SkeletonCard/SkeletonCard";
import { HStack, VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";

const version = Constants.expoConfig?.version ?? "1.0.0";

function StatNumber({ value, unit }: { value: string; unit?: string }) {
  return (
    <VStack spacing="none" align="center" className="flex-1">
      <Text className="font-app-extrabold text-[28px] text-text">{value}</Text>
      <Text className="font-app-medium text-[11px] text-muted">
        {unit ?? " "}
      </Text>
    </VStack>
  );
}

function WatchTimeValue({ minutes }: { minutes: number }) {
  const parts = tvTimeParts(minutes);
  const units = [
    {
      count: parts.months,
      label: parts.months === 1 ? "month" : "months",
    },
    { count: parts.days, label: parts.days === 1 ? "day" : "days" },
    { count: parts.hours, label: parts.hours === 1 ? "hour" : "hours" },
  ];

  return (
    <HStack accessibilityLabel={tvTime(minutes)} spacing="sm">
      {units.map((unit) => (
        <StatNumber
          key={unit.label}
          value={String(unit.count)}
          unit={unit.label}
        />
      ))}
    </HStack>
  );
}

const ProfileScreen: React.FC = () => {
  const account = useAccount();
  const stats = useProfileStats();
  const exportHistory = useExportHistory();
  const { signOut } = useSession();
  const [exporting, setExporting] = useState(false);

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

  const exportFile = () => {
    if (exporting) return;
    setExporting(true);
    void exportHistory({})
      .then((json) => saveHistoryFile(json, localDay()))
      .catch(() => {
        showErrorToast("Could not export your history.");
      })
      .finally(() => {
        setExporting(false);
      });
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <VStack spacing="2xl" paddingY="md" className="px-5">
        <HStack spacing="md" align="stretch">
          <VStack
            spacing="sm"
            className="min-w-0 flex-1 rounded-2xl bg-surface p-4"
          >
            <Text
              className="font-app-medium text-[13px] text-muted"
              numberOfLines={1}
            >
              Watch time
            </Text>
            {stats === undefined ? (
              <SkeletonCard width={72} height={28} radius={4} />
            ) : (
              <WatchTimeValue minutes={stats.minutesWatched} />
            )}
          </VStack>
          <VStack
            spacing="sm"
            className="min-w-0 flex-1 rounded-2xl bg-surface p-4"
          >
            <Text
              className="font-app-medium text-[13px] text-muted"
              numberOfLines={1}
            >
              Episodes watched
            </Text>
            {stats === undefined ? (
              <SkeletonCard width={72} height={28} radius={4} />
            ) : (
              <StatNumber
                value={stats.episodesWatched.toLocaleString("en-US")}
              />
            )}
          </VStack>
        </HStack>

        <VStack
          spacing="none"
          className="overflow-hidden rounded-2xl bg-surface"
        >
          <HStack
            align="center"
            justify="between"
            paddingX="md"
            className="min-h-[52px]"
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
          <View className="ml-4 h-px bg-border" />
          <HStack
            align="center"
            justify="between"
            paddingX="md"
            className="min-h-[52px]"
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
          <View className="ml-4 h-px bg-border" />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Export my history"
            disabled={exporting}
            onPress={exportFile}
            className="min-h-[52px] flex-row items-center justify-between px-4"
          >
            <Text className="font-app-medium text-[15px] text-text">
              Export my history
            </Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
          </Pressable>
        </VStack>

        <VStack spacing="xs" align="center">
          <Pressable
            accessibilityRole="link"
            onPress={() => {
              void Linking.openURL("https://www.tvmaze.com");
            }}
          >
            <Text className="text-center font-app-medium text-[13px] text-primary">
              Show data from TVmaze
            </Text>
          </Pressable>
          <Text className="text-center font-app-medium text-[13px] text-muted">
            Version {version}
          </Text>
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
