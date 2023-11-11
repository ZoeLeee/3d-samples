import { SceneLoader } from "@babylonjs/core";
import { InitCanvas } from "../../common/init";

const name = "HillValley.babylon";

export function lazyLoadMaterial(canvas: HTMLCanvasElement) {
  const [engine, scene, camera, gui] = InitCanvas(canvas);

  SceneLoader.AppendAsync(
    "https://www.babylonjs.com/Scenes/hillvalley/",
    name,
    scene
  ).then((res) => {
    camera.position = scene.activeCamera.position;
    camera.target = scene.activeCamera.target;
    scene.activeCamera = camera;
  });

  return () => {
    engine.dispose();
  };
}
