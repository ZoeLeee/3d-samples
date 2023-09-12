import { StoreApi, create, UseBoundStore } from "zustand";
import { createRootSlice } from "./root-store";
import { LoadingSlice, RenderSlice, WithSelectors } from "./types";
import { createRenderSlice } from "./render-store";
import { Node, Scene } from "@babylonjs/core";

export const useStores = create<LoadingSlice & RenderSlice>((...a) => ({
  ...createRootSlice(...a),
  ...createRenderSlice(...a),
}));

const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
  _store: S
) => {
  const store = _store as WithSelectors<typeof _store>;
  store.use = {};
  for (const k of Object.keys(store.getState())) {
    (store.use as any)[k] = () => store((s) => s[k as keyof typeof s]);
  }

  return store;
};

export const Stores = createSelectors(useStores);

export const toggleGLoablLoading = (v: boolean, title?: string) =>
  useStores.setState((state) => ({ loading: v, title }));

export const setRenderScene = (nodes: Node[]) => {
  useStores.setState((state) => ({ nodes }));
};
