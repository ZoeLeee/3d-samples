import { StateCreator } from "zustand";
import { LoadingSlice } from "./types";

export const createRootSlice: StateCreator<
  LoadingSlice,
  [],
  [],
  LoadingSlice
> = (set) => ({
  loading: false,
  title: "",
  startLoading: () => set(() => ({ loading: true })),
  endLoading: () => set(() => ({ loading: false })),
  setTitle: (title: string) => set(() => ({ title: title })),
});
