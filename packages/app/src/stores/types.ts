import { Node, Scene } from "@babylonjs/core";

export interface LoadingSlice {
  loading: boolean;
  title: string;
  startLoading: () => void;
  endLoading: () => void;
}
export interface RenderSlice {
  nodes: Node[];
  scene: Scene;
}

export type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never;
