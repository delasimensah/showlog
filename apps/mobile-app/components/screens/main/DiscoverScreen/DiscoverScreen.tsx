import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView } from "react-native";

import { useAddShow, useDiscoverRows } from "@/hooks";
import { keepDayShows, localDay, showErrorToast } from "@/utils";

import DiscoverCard from "../../../discover/DiscoverCard/DiscoverCard";
import EmptyState, { EmptyIcon } from "../../../ui/EmptyState/EmptyState";
import { VStack } from "../../../ui/Stack/Stack";
import Text from "../../../ui/Text/Text";
import DiscoverScreenSkeleton from "./DiscoverScreenSkeleton";

interface DiscoverShow {
  tvmazeId: number;
  name: string;
  posterUrl: string;
  year: number | null;
}

const DiscoverScreen: React.FC = () => {
  const router = useRouter();
  const rows = useDiscoverRows();
  const addShow = useAddShow();
  const [addingId, setAddingId] = useState<number | null>(null);
  const [addedIds, setAddedIds] = useState<number[]>([]);
  const day = localDay();
  const [saved, setSaved] = useState<{
    day: string;
    rows: Record<string, DiscoverShow[]>;
  }>({ day: "", rows: {} });

  const stored = saved.day === day ? saved.rows : {};
  const visible =
    rows === undefined
      ? []
      : rows
          .map((row) => ({
            title: row.title,
            shows: keepDayShows(stored[row.title], row.shows, day),
          }))
          .filter((row) => row.shows.length > 0);

  if (rows !== undefined) {
    const nextRows = Object.fromEntries(
      visible.map((row) => [row.title, row.shows])
    );
    const titles = Object.keys(nextRows);
    const sameDay =
      saved.day === day &&
      titles.length === Object.keys(stored).length &&
      titles.every((title) => stored[title] === nextRows[title]);
    if (!sameDay) setSaved({ day, rows: nextRows });
  }

  const add = (tvmazeId: number) => {
    if (addingId !== null || addedIds.includes(tvmazeId)) return;
    setAddingId(tvmazeId);
    void addShow({ tvmazeId })
      .then(() => {
        setAddedIds((current) =>
          current.includes(tvmazeId) ? current : [...current, tvmazeId]
        );
      })
      .catch(() => {
        showErrorToast("Could not add this show.");
      })
      .finally(() => {
        setAddingId(null);
      });
  };

  let body: React.ReactNode;
  if (rows === undefined) {
    body = (
      <ScrollView
        className="flex-1 bg-page"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <DiscoverScreenSkeleton />
      </ScrollView>
    );
  } else if (visible.length === 0) {
    body = (
      <EmptyState
        usesSystemHeader
        title="No suggestions yet"
        subtitle="Shows you may like show up here."
        icon={<EmptyIcon name="compass-outline" />}
      />
    );
  } else {
    body = (
      <ScrollView
        className="flex-1 bg-page"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <VStack spacing="xl" className="py-4">
          {visible.map((row) => (
            <VStack key={row.title} spacing="none" className="gap-3">
              <Text className="px-5 font-app-semibold text-[20px] text-text">
                {row.title}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
              >
                {row.shows.map((show) => (
                  <DiscoverCard
                    key={show.tvmazeId}
                    name={show.name}
                    posterUrl={show.posterUrl}
                    year={show.year}
                    added={addedIds.includes(show.tvmazeId)}
                    adding={addingId === show.tvmazeId}
                    onOpen={() => router.push(`/show/${show.tvmazeId}`)}
                    onAdd={() => add(show.tvmazeId)}
                  />
                ))}
              </ScrollView>
            </VStack>
          ))}
        </VStack>
      </ScrollView>
    );
  }

  return (
    <>
      <Stack.Title large>Discover</Stack.Title>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          accessibilityLabel="Search"
          icon="magnifyingglass"
          onPress={() => router.push("/search")}
        />
      </Stack.Toolbar>
      {body}
    </>
  );
};

export default DiscoverScreen;
