import { BoundingInfo, Camera, Node } from "@babylonjs/core";
import { FramingBehavior } from "@babylonjs/core/Behaviors/Cameras/framingBehavior";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Scene } from "@babylonjs/core/scene";

export function ZoomAll(camera: ArcRotateCamera, scene: Scene) {
  camera.upperAlphaLimit = null;

  camera.alpha += Math.PI;

  // Enable camera's behaviors
  camera.useFramingBehavior = true;

  const framingBehavior = camera.getBehaviorByName(
    "Framing"
  ) as FramingBehavior;
  framingBehavior.framingTime = 0;
  framingBehavior.elevationReturnTime = -1;

  if (scene.meshes.length) {
    camera.lowerRadiusLimit = null;

    const worldExtends = scene.getWorldExtends(function (mesh) {
      return (
        mesh.isVisible &&
        mesh.isEnabled() &&
        !mesh.name.startsWith("Background")
      );
    });
    framingBehavior.zoomOnBoundingInfo(worldExtends.min, worldExtends.max);

    const boundingInfo = new BoundingInfo(worldExtends.min, worldExtends.max);

    const size = boundingInfo.boundingBox.extendSize;
    camera.minZ =
      Math.min(Math.abs(size.x), Math.abs(size.z), Math.abs(size.y)) / 10;
  }

  camera.useAutoRotationBehavior = true;

  camera.pinchPrecision = 200 / camera.radius;

  camera.wheelDeltaPercentage = 0.01;
  camera.pinchDeltaPercentage = 0.01;
}

export function zoomToNode(node: Node, camera: ArcRotateCamera) {
  // Enable camera's behaviors
  camera.useFramingBehavior = true;

  const framingBehavior = camera.getBehaviorByName(
    "Framing"
  ) as FramingBehavior;
  framingBehavior.framingTime = 500;
  framingBehavior.elevationReturnTime = -1;

  const worldExtends = node.getHierarchyBoundingVectors();

  camera.lowerRadiusLimit = null;

  framingBehavior.zoomOnBoundingInfo(worldExtends.min, worldExtends.max);
}
