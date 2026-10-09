import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { RefObject } from "react";
import { create } from "zustand";

export interface EpisodeSheetEpisode {
  episodeId: string;
  showId: string;
  tvmazeId: number;
  season: number;
  number: number;
  order: number;
  name: string;
  summary: string | null;
  airsAt: number | null;
  airTimeKnown: boolean;
  runtime: number | null;
  imageUrl: string | null;
  headerUrl: string | null;
  posterUrl: string | null;
  watched: boolean;
  aired: boolean;
  yearSeasons: boolean;
}

interface BottomsheetState {
  setGenericRef: (ref: RefObject<BottomSheetModal | null> | null) => void;
  openGenericSheet: () => void;
  genericRef: RefObject<BottomSheetModal | null> | null;
  setEpisodeSheetRef: (ref: RefObject<BottomSheetModal | null> | null) => void;
  episodeSheetRef: RefObject<BottomSheetModal | null> | null;
  episode: EpisodeSheetEpisode | null;
  openEpisodeSheet: (episode: EpisodeSheetEpisode) => void;
  closeEpisodeSheet: () => void;
}

export const useBottomsheetStore = create<BottomsheetState>((set, get) => ({
  genericRef: null,
  episodeSheetRef: null,
  episode: null,

  setGenericRef: (ref) => set({ genericRef: ref }),

  openGenericSheet: () => {
    get().genericRef?.current?.present();
  },

  setEpisodeSheetRef: (ref) => set({ episodeSheetRef: ref }),

  openEpisodeSheet: (episode) => {
    set({ episode });
    get().episodeSheetRef?.current?.present();
  },

  closeEpisodeSheet: () => {
    get().episodeSheetRef?.current?.dismiss();
    set({ episode: null });
  },
}));
