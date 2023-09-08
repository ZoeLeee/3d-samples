import { StoreApi, create, UseBoundStore } from "zustand";
import { createRootSlice } from "./root-store";
import { LoadingSlice, WithSelectors } from "./types";

export const useStores = create<LoadingSlice>((...a) => ({
  ...createRootSlice(...a),
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
