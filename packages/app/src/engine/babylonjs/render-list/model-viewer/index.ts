import { chooseFile } from "@/engine/utils/file";
import { InitCanvas } from "../../common/init";
import { uploadMultiple } from "@/engine/utils/fetch";
import { message } from "antd";
import { toggleGLoablLoading } from "@/stores";
import { SceneLoader } from "@babylonjs/core";
import { ZoomAll } from "@/engine/utils";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Mesh } from "@babylonjs/core/Meshes";

export function renderModelViewer(canvas: HTMLCanvasElement) {
  const [engine, scene, camera, gui] = InitCanvas(canvas);

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

          const res = await uploadMultiple(formData, "model-viewer");

          let url = `//${location.hostname}:3000`;
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
