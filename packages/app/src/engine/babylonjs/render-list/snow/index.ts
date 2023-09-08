import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { InitCanvas } from "../../common/init";
import { SnowCoverMaterialPlugin } from "../../SnowCoverMaterialPlugin";
import { RegisterMaterialPlugin } from "@babylonjs/core/Materials/materialPluginManager";
import { toggleGLoablLoading } from "@/stores/stores";

export function renderCoverSnow(canvas: HTMLCanvasElement) {
  const [engine, scene, camera, gui] = InitCanvas(canvas);
  const name = "HillValley.babylon";

  RegisterMaterialPlugin("SnowCover", (material) => {
    material["snowCover"] = new SnowCoverMaterialPlugin(material);
    return material["snowCover"];
  });

  toggleGLoablLoading(true);

  SceneLoader.AppendAsync(
    "https://www.babylonjs.com/Scenes/hillvalley/",
    name,
    scene
  ).then((res) => {
    const plugin: SnowCoverMaterialPlugin[] = [];
    camera.position = scene.activeCamera.position;
    camera.target = scene.activeCamera.target;
    scene.activeCamera = camera;

    for (const material of scene.materials) {
      const plugin = material.pluginManager.getPlugin(
        "SnowCover"
      ) as SnowCoverMaterialPlugin;

      if (plugin) {
        plugin.isEnabled = true;
      }
    }

    const params = {
      snowAmount: 0.5,
      smoothFactor: 0.5,
      open: true,
    };

    gui.add(params, "open").onChange(function (val) {
      params.open = val;
      for (const material of scene.materials) {
        const plugin = material.pluginManager.getPlugin(
          "SnowCover"
        ) as SnowCoverMaterialPlugin;

        if (plugin) {
          plugin.isEnabled = val;
        }
      }
    });

    gui.add(params, "snowAmount", 0, 1).onChange(function (val) {
      for (const p of plugin) {
        p.snowAmount = val;
      }
    });
    gui.add(params, "smoothFactor", 0, 1).onChange(function (val) {
      for (const p of plugin) {
        p.smoothFactor = val;
      }
    });

    gui.open();

    toggleGLoablLoading(false);
  });

  return () => {
    engine.dispose();
  };
}
