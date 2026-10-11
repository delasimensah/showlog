import { Stack, useRouter } from "expo-router";
import React from "react";
import { ScrollView, useWindowDimensions } from "react-native";

import { type MyShowsFilter, useMyShows, useMyShowsChoice } from "@/hooks";
import { posterColumnWidth } from "@/utils";

import ShowPoster from "../../../my-shows/ShowPoster/ShowPoster";
import SortFilterSheet from "../../../my-shows/SortFilterSheet/SortFilterSheet";
import EmptyState, { EmptyIcon } from "../../../ui/EmptyState/EmptyState";
import { HStack, VStack } from "../../../ui/Stack/Stack";
import MyShowsScreenSkeleton from "./MyShowsScreenSkeleton";

const FILTER_EMPTY: Record<Exclude<MyShowsFilter, "All">, string> = {
  Watching: "Shows you are still watching show up here.",
  "Up to date": "Shows you have caught up on show up here.",
  "Not started": "Shows you have not started show up here.",
  "Watch later": "Shows you save for later show up here.",
  Finished: "Shows you finish show up here.",
  Stopped: "Shows you have stopped show up here.",
};

function rowsOf<T>(items: T[], count: number) {
  const rows: T[][] = [];
  for (let index = 0; index < items.length; index += count) {
    rows.push(items.slice(index, index + count));
  }
  return rows;
}

const MyShowsScreen: React.FC = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const sort = useMyShowsChoice((state) => state.sort);
  const filter = useMyShowsChoice((state) => state.filter);
  const setSort = useMyShowsChoice((state) => state.setSort);
  const setFilter = useMyShowsChoice((state) => state.setFilter);
  const shows = useMyShows(sort);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const columnWidth = posterColumnWidth(width);
  const visible =
    shows === undefined
      ? []
      : filter === "All"
        ? shows
        : shows.filter((show) => show.status === filter);
  const showSort = shows === undefined || shows.length > 0;
  const title =
    shows === undefined
      ? "My shows"
      : filter === "All"
        ? `My shows · ${shows.length}`
        : `${filter} · ${visible.length}`;

  let body: React.ReactNode;
  if (shows === undefined) {
    body = (
      <ScrollView
        className="flex-1 bg-page"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <MyShowsScreenSkeleton />
      </ScrollView>
    );
  } else if (shows.length === 0) {
    body = (
      <EmptyState
        usesSystemHeader
        title="Your list is empty"
        subtitle="Find a show in Discover."
        icon={<EmptyIcon name="grid-outline" />}
        buttonText="Discover"
        onButtonPress={() => router.push("/discover")}
      />
    );
  } else if (visible.length === 0 && filter !== "All") {
    body = (
      <EmptyState
        usesSystemHeader
        title={`No ${filter} shows`}
        subtitle={FILTER_EMPTY[filter]}
        icon={<EmptyIcon name="grid-outline" />}
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
        <VStack spacing="md" className="px-5 py-4">
          {rowsOf(visible, 3).map((row) => (
            <HStack key={row[0]?.showId} spacing="none" className="gap-3">
              {row.map((show) => (
                <ShowPoster
                  key={show.showId}
                  name={show.name}
                  posterUrl={show.posterUrl}
                  watchedCount={show.watchedCount}
                  airedCount={show.airedCount}
                  watchLater={show.status === "Watch later"}
                  stopped={show.status === "Stopped"}
                  width={columnWidth}
                  onPress={() => router.push(`/show/${show.tvmazeId}`)}
                />
              ))}
            </HStack>
          ))}
        </VStack>
      </ScrollView>
    );
  }

  return (
    <>
      <Stack.Title large>{title}</Stack.Title>
      <Stack.Toolbar placement="right">
        {showSort ? (
          <Stack.Toolbar.Button
            accessibilityLabel="Sort and filter"
            icon="line.3.horizontal.decrease"
            onPress={() => setSheetOpen(true)}
          />
        ) : null}
        <Stack.Toolbar.Button
          accessibilityLabel="Profile"
          icon="person"
          onPress={() => router.push("/profile")}
        />
      </Stack.Toolbar>
      {/* The list is the first view so the large title can collapse into the bar. */}
      {body}
      <SortFilterSheet
        isPresented={sheetOpen}
        onIsPresentedChange={setSheetOpen}
        sort={sort}
        filter={filter}
        onSort={setSort}
        onFilter={setFilter}
      />
    </>
  );
};

export default MyShowsScreen;
