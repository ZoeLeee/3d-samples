import {
  Animation,
  AnimationGroup,
  BoundingBox,
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

  const size = box.extendSizeWorld.scale(2);

  const TestBox = MeshBuilder.CreateBox("test", {
    width: size.x,
    height: size.y,
    depth: size.z,
  });

  const mtl = new StandardMaterial("1");

  mtl.wireframe = true;

  TestBox.material = mtl;

  TestBox.position = center;

  const group = new AnimationGroup("分解动画");

  const time = 3;
  const frame = 30;

  for (const mesh of meshes) {
    if (mesh instanceof Mesh && mesh.geometry) {
      const pos = mesh.position;
      const bound = mesh.getBoundingInfo();

      const meshCenter = bound.boundingBox.center;

      const mtx = mesh.getWorldMatrix().clone().invert();

      const localCenter = Vector3.TransformCoordinates(center, mtx);

      const dir = meshCenter.subtract(localCenter);

      const an = new Animation(
        mesh.name,
        "position",
        frame,
        Animation.ANIMATIONTYPE_VECTOR3
      );

      an.setKeys([
        {
          frame: 0,
          value: pos.clone(),
        },
        {
          frame: frame * time,
          value: pos.clone().add(dir.scale(2)),
        },
      ]);

      group.addTargetedAnimation(an, mesh);
    }
  }

  setTimeout(() => {
    group.start();

    group.onAnimationGroupEndObservable.addOnce(() => {
      group.start(false, 1, time * frame, 0);
    });
  }, 1000);
}
