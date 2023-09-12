import { StateCreator } from "zustand";
import { RenderSlice } from "./types";

export const createRenderSlice: StateCreator<
  RenderSlice,
  [],
  [],
  RenderSlice
> = (set) => ({
  nodes: null,
});
