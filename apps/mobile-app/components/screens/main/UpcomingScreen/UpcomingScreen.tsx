import { Stack, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  episodeLabel,
  hourStart,
  upcomingDetail,
  upcomingSections,
} from "shared";

import {
  useOpenedAt,
  usePullToRefresh,
  useReloadUpcoming,
  useUpcoming,
} from "@/hooks";

import EmptyState, { EmptyIcon } from "../../../ui/EmptyState/EmptyState";
import RefreshableScroll from "../../../ui/RefreshableScroll/RefreshableScroll";
import { VStack } from "../../../ui/Stack/Stack";
import UpcomingSection from "../../../upcoming/UpcomingSection/UpcomingSection";
import UpcomingScreenSkeleton from "./UpcomingScreenSkeleton";

function deviceTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

const UpcomingScreen: React.FC = () => {
  const router = useRouter();
  const openedAt = useOpenedAt();
  const [now, setNow] = useState(() => hourStart(openedAt));
  const list = useUpcoming(now);
  const reloadUpcoming = useReloadUpcoming();
  const timeZone = deviceTimeZone();
  const reload = useCallback(
    (stamp: number) => {
      setNow(stamp);
      return reloadUpcoming(stamp);
    },
    [reloadUpcoming]
  );
  const { refreshing, onRefresh } = usePullToRefresh(reload);

  const showSkeleton = list === undefined || refreshing;
  const empty =
    list !== undefined &&
    !refreshing &&
    list.episodes.length === 0 &&
    list.noDate.length === 0;

  let body: React.ReactNode;
  if (showSkeleton) {
    body = <UpcomingScreenSkeleton />;
  } else if (empty) {
    body = (
      <EmptyState
        usesSystemHeader
        title="Nothing scheduled yet"
        subtitle="Nothing scheduled for your shows yet."
        icon={<EmptyIcon name="calendar-outline" />}
        buttonText="Discover"
        onButtonPress={() => router.push("/discover")}
      />
    );
  } else if (list !== undefined) {
    const sections = upcomingSections(list.episodes, now, timeZone);
    body = (
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
    );
  }

  return (
    <>
      <Stack.Title large>Upcoming</Stack.Title>
      <RefreshableScroll
        testID="upcoming-scroll"
        refreshing={refreshing}
        onRefresh={onRefresh}
        centered={empty}
      >
        {body}
      </RefreshableScroll>
    </>
  );
};

export default UpcomingScreen;
