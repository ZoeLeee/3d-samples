import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  MeshBuilder,
  AxesViewer,
  SceneLoader,
  HemisphericLight,
  StandardMaterial,
  Color3,
  AbstractMesh,
  Mesh,
  Effect,
  ShaderStore,
} from "@babylonjs/core";
import { GridMaterial } from "@babylonjs/materials/Grid";
import "@babylonjs/loaders/glTF/2.0/glTFLoader";
import { CustomMaterial } from "@babylonjs/materials";

//初始化babylonjs
export function initBabylon(canvas: HTMLCanvasElement) {
  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);
  const camera = new ArcRotateCamera(
    "camera",
    0,
    0,
    100,
    new Vector3(0, 0, 0),
    scene
  );
  camera.attachControl(canvas, true);

  const light = new HemisphericLight("light", new Vector3(1, 1, 1), scene);

  const groud = MeshBuilder.CreateGround(
    "ground",
    { width: 100, height: 100 },
    scene
  );

  const gridMaterial = new GridMaterial("gridMaterial", scene);

  groud.material = gridMaterial;

  const viewer = new AxesViewer(scene, 10);

  const store = ShaderStore.GetShadersStore();

  const mtl = new CustomMaterial("mtl", scene);

  console.log("mtl: ", mtl);

  //浅蓝色
  mtl.diffuseColor = new Color3(0, 0.1, 1);

  SceneLoader.LoadAssetContainer("/models/", "city.glb", scene, (container) => {
    container.addAllToScene();
    for (const m of container.meshes) {
      if (m instanceof Mesh) {
        if (m.geometry) {
          m.material = mtl;
        }
      }
    }
  });

  engine.runRenderLoop(() => {
    scene.render();
  });
}
