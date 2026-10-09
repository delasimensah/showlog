import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const MY_SHOWS_SORTS = [
  { value: "lastWatched", label: "Last watched" },
  { value: "lastAdded", label: "Last added" },
  { value: "name", label: "A to Z" },
] as const;

export const MY_SHOWS_FILTERS = [
  "All",
  "Watching",
  "Up to date",
  "Not started",
  "Watch later",
  "Finished",
  "Stopped",
] as const;

export type MyShowsSort = (typeof MY_SHOWS_SORTS)[number]["value"];
export type MyShowsFilter = (typeof MY_SHOWS_FILTERS)[number];

interface MyShowsChoice {
  sort: MyShowsSort;
  filter: MyShowsFilter;
  setSort: (sort: MyShowsSort) => void;
  setFilter: (filter: MyShowsFilter) => void;
}

export const useMyShowsChoice = create<MyShowsChoice>()(
  persist(
    (set) => ({
      sort: "lastWatched",
      filter: "All",
      setSort: (sort) => set({ sort }),
      setFilter: (filter) => set({ filter }),
    }),
    {
      name: "my-shows-choice",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
