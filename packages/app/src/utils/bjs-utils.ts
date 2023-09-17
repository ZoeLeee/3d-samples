import { BoundingInfo, Camera, Node } from "@babylonjs/core";

export function zoomToNode(node: Node, camera: Camera) {
  const boundBox = node.getHierarchyBoundingVectors();
  const b = new BoundingInfo(boundBox.min, boundBox.max);
}
