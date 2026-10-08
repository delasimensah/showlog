import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { RefObject } from "react";
import { create } from "zustand";

/**
 * Generic Bottom Sheet Store
 *
 * Manages bottom sheet refs and provides imperative methods to open sheets.
 * Customize by adding more sheet types as needed.
 */
interface BottomsheetState {
  // Store setters for refs
  setGenericRef: (ref: RefObject<BottomSheetModal | null> | null) => void;

  // Imperative methods to open sheets
  openGenericSheet: () => void;

  // Ref storage
  genericRef: RefObject<BottomSheetModal | null> | null;
}

export const useBottomsheetStore = create<BottomsheetState>((set, get) => ({
  genericRef: null,

  setGenericRef: (ref) => set({ genericRef: ref }),

  openGenericSheet: () => {
    const ref = get().genericRef;
    ref?.current?.present();
  },
}));
