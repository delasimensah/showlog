import { Stack } from "expo-router";
import React from "react";
import { ScrollView } from "react-native";
import {
  episodeLabel,
  hourStart,
  upcomingDetail,
  upcomingSections,
} from "shared";

import { useOpenedAt, useUpcoming } from "@/hooks";

import EmptyState, { EmptyIcon } from "../../../ui/EmptyState/EmptyState";
import { VStack } from "../../../ui/Stack/Stack";
import UpcomingSection from "../../../upcoming/UpcomingSection/UpcomingSection";
import UpcomingScreenSkeleton from "./UpcomingScreenSkeleton";

function deviceTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

const UpcomingScreen: React.FC = () => {
  const openedAt = useOpenedAt();
  const now = hourStart(openedAt);
  const list = useUpcoming(now);
  const timeZone = deviceTimeZone();

  const empty =
    list !== undefined &&
    list.episodes.length === 0 &&
    list.noDate.length === 0;

  let body: React.ReactNode;
  if (list === undefined) {
    body = (
      <ScrollView
        className="flex-1 bg-page"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <UpcomingScreenSkeleton />
      </ScrollView>
    );
  } else if (empty) {
    body = (
      <EmptyState
        usesSystemHeader
        title="Nothing scheduled yet"
        subtitle="Nothing scheduled for your shows yet."
        icon={<EmptyIcon name="calendar-outline" />}
      />
    );
  } else {
    const sections = upcomingSections(list.episodes, now, timeZone);
    body = (
      <ScrollView
        className="flex-1 bg-page"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <VStack spacing="xl" className="px-5 py-4">
          {sections.map((section) => (
            <UpcomingSection
              key={section.title}
              title={section.title}
              date={section.date}
              rows={section.rows.map((row) => ({
                tvmazeId: row.tvmazeId,
                showName: row.showName,
                headerUrl: row.headerUrl,
                posterUrl: row.posterUrl,
                imageUrl: row.imageUrl,
                label: episodeLabel(row),
                premiere: row.number === 1,
                episodeName: row.name,
                primary: upcomingDetail(row, timeZone),
              }))}
            />
          ))}
          {list.noDate.length > 0 ? (
            <UpcomingSection title="No date yet" rows={list.noDate} />
          ) : null}
        </VStack>
      </ScrollView>
    );
  }

  return (
    <>
      <Stack.Title large>Upcoming</Stack.Title>
      {body}
    </>
  );
};

export default UpcomingScreen;
