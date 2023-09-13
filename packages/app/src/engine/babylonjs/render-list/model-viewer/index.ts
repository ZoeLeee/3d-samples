import { chooseFile } from "@/engine/utils/file";
import { InitCanvas } from "../../common/init";
import { uploadMultiple } from "@/engine/utils/fetch";
import { message } from "antd";
import { setRenderScene, toggleGLoablLoading } from "@/stores";
import { Quaternion, SceneLoader, Vector2, Vector3 } from "@babylonjs/core";
import { ZoomAll } from "@/engine/utils";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Mesh, TransformNode } from "@babylonjs/core/Meshes";
import { Node } from "@babylonjs/core/node";
import { explode } from "./explode";

export function renderModelViewer(canvas: HTMLCanvasElement) {
  const [engine, scene, camera, gui] = InitCanvas(canvas);

  if (import.meta.env.DEV) {
    toggleGLoablLoading(true);
    SceneLoader.LoadAssetContainer(
      "//localhost:3000/upload/wolf.glb",
      "",
      scene,
      (container) => {
        container.addAllToScene();

        const roots = container.meshes.filter((m) => !m.parent);

        setRenderScene(roots);

        mergeMeshes(roots);

        explode(roots[0]);

        setTimeout(() => {
          ZoomAll(camera, scene);
          const helper = scene.createDefaultEnvironment();

          helper.setMainColor(Color3.Teal());

          toggleGLoablLoading(false);
        }, 1000);
      }
    );
  }

  const clearAll = () => {
    const roots = scene.rootNodes.filter((m) => m instanceof Mesh);
    roots.forEach((m) => {
      m.dispose(false, true);
    });
  };

  const params = {
    loadFile: function () {
      chooseFile({
        multiple: false,
        filter: ".STEP,.glb",
        callback: async (files) => {
          const formData = new FormData();

          for (const f of Array.from(files)) {
            formData.append(f.name, f);
          }
          toggleGLoablLoading(true);
          const res = await uploadMultiple(formData, "model-viewer");

          const url = `//${location.hostname}:3000`;
          if (res.code === 0) {
            console.log("res: ", res);
            clearAll();
            message.success("上传成功");
            toggleGLoablLoading(true);
            SceneLoader.LoadAssetContainer(
              url + res.data.url,
              "",
              scene,
              (container) => {
                container.addAllToScene();

                const roots = container.meshes.filter((m) => !m.parent);

                mergeMeshes(roots);

                setRenderScene(roots);

                setTimeout(() => {
                  ZoomAll(camera, scene);
                  const helper = scene.createDefaultEnvironment();

                  helper.setMainColor(Color3.Teal());

                  toggleGLoablLoading(false);
                }, 1000);
              }
            );
          }
        },
      });
    },
  };

  gui.add(params, "loadFile").name("上传模型");

  return () => {
    engine.dispose();
  };
}

function mergeMeshes(meshes: (Mesh | TransformNode)[], root?: Node) {
  const needMergeMeshes: Mesh[] = [];

  for (const node of meshes) {
    const children = node.getChildren() as (Mesh | TransformNode)[];
    if (children.length) {
      mergeMeshes(children, node);
    } else {
      if (node instanceof Mesh && node.geometry) {
        needMergeMeshes.push(node);
      }
    }
  }

  if (needMergeMeshes.length > 1) {
    const mesh = Mesh.MergeMeshes(needMergeMeshes, true, true);
    if (mesh) {
      const mtx = root.getWorldMatrix().clone().invert();
      const positon = new Vector3();
      const rotation = new Quaternion();
      const scale = new Vector3();

      mtx.decompose(scale, rotation, positon);

      mesh.position.copyFrom(positon);
      mesh.rotation.copyFrom(rotation.toEulerAngles());
      mesh.scaling.copyFrom(scale);

      mesh.parent = root;
    }
  }
}
