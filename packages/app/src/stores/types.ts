export interface LoadingSlice {
  loading: boolean;
  title: string;
  startLoading: () => void;
  endLoading: () => void;
}

export type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never;
