import {
  Animation,
  AnimationGroup,
  BoundingBox,
  CreateLines,
  Mesh,
  MeshBuilder,
  Node,
  StandardMaterial,
  Vector3,
} from "@babylonjs/core";

export function explode(root: Node) {
  const result = root.getHierarchyBoundingVectors();

  const box = new BoundingBox(result.min, result.max);

  const meshes = root.getChildMeshes();

  const center = box.centerWorld;

  const group = new AnimationGroup("分解动画");

  const time = 3;
  const frame = 30;

  for (const mesh of meshes) {
    if (mesh instanceof Mesh && mesh.geometry) {
      const pos = mesh.position.clone();
      const bound = mesh.getBoundingInfo();

      const meshCenter = bound.boundingBox.centerWorld;

      const mtx = mesh.parent.getWorldMatrix().invert();

      const dir = meshCenter.subtract(center);

      const an = new Animation(
        mesh.name,
        "position",
        frame,
        Animation.ANIMATIONTYPE_VECTOR3
      );

      const d = Vector3.TransformCoordinates(dir, mtx.getRotationMatrix());

      an.setKeys([
        {
          frame: 0,
          value: pos.clone(),
        },
        {
          frame: frame * time,
          value: pos.clone().add(d.scale(2)),
        },
      ]);

      group.addTargetedAnimation(an, mesh);
    }
  }

  // setTimeout(() => {
  //   group.start();

  //   group.onAnimationGroupEndObservable.addOnce(() => {
  //     group.start(false, 1, time * frame, 0);
  //   });
  // }, 1000);
}
