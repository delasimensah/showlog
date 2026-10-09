import type { Id } from "@convex/_generated/dataModel";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { ScrollView } from "react-native";

import { useTickUpNext, useUpNext } from "@/hooks";
import { showErrorToast } from "@/utils";

import EmptyState, { EmptyIcon } from "../../../ui/EmptyState/EmptyState";
import { VStack } from "../../../ui/Stack/Stack";
import UpNextSection from "../../../up-next/UpNextSection/UpNextSection";
import UpNextScreenSkeleton from "./UpNextScreenSkeleton";

const UpNextScreen: React.FC = () => {
  const router = useRouter();
  const list = useUpNext();
  const tick = useTickUpNext();

  const onTick = (episodeId: string) => {
    void tick({ episodeId: episodeId as Id<"episodes"> }).catch(() => {
      showErrorToast("Could not mark this episode.");
    });
  };

  const empty =
    list !== undefined &&
    list.upNext.length === 0 &&
    list.paused.length === 0 &&
    list.notStarted.length === 0;

  let body: React.ReactNode;
  if (list === undefined) {
    body = (
      <ScrollView
        className="flex-1 bg-page"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <UpNextScreenSkeleton />
      </ScrollView>
    );
  } else if (empty) {
    body = (
      <EmptyState
        usesSystemHeader
        title="Add the shows you watch"
        subtitle="Find them in Discover."
        icon={<EmptyIcon name="play-circle-outline" />}
        buttonText="Discover"
        onButtonPress={() => router.push("/discover")}
      />
    );
  } else {
    body = (
      <ScrollView
        className="flex-1 bg-page"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <VStack spacing="xl" className="px-5 py-4">
          {list.upNext.length > 0 ? (
            <UpNextSection title="Up next" rows={list.upNext} onTick={onTick} />
          ) : null}
          {list.paused.length > 0 ? (
            <UpNextSection
              title="Paused for a while"
              rows={list.paused}
              onTick={onTick}
            />
          ) : null}
          {list.notStarted.length > 0 ? (
            <UpNextSection
              title="Not started"
              rows={list.notStarted}
              onTick={onTick}
            />
          ) : null}
        </VStack>
      </ScrollView>
    );
  }

  return (
    <>
      <Stack.Title large>Up next</Stack.Title>
      {body}
    </>
  );
};

export default UpNextScreen;
