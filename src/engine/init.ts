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
  TransformNode,
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

  groud.position.y = -1;

  const viewer = new AxesViewer(scene, 10);

  const store = ShaderStore.GetShadersStore();

  SceneLoader.LoadAssetContainer("/models/", "city.glb", scene, (container) => {
    container.addAllToScene();

    container.rootNodes.forEach((node: TransformNode) => {
      node.position.y += 1;
    });

    for (const m of container.meshes) {
      if (m instanceof Mesh) {
        if (m.geometry) {
          const mtl = new CustomMaterial("mtl", scene);
          mtl.diffuseColor = Color3.FromHexString("#0c0e6f");
          m.material = mtl;

          const boundingBox = m.getBoundingInfo().boundingBox;

          const y = boundingBox.maximumWorld.y - boundingBox.minimumWorld.y;

          console.log("mtl: ", mtl);
          mtl.Vertex_Begin(`varying vec3 vPosition;`);
          mtl.Vertex_MainEnd(`
          vec4 p=viewProjection*worldPos;
          vPosition=worldPos.xyz;
          `);

          mtl.AddUniform("uHeight", "float", y);
          mtl.AddUniform("uTopColor", "vec3", Color3.White());

          mtl.Fragment_Begin(
            `
            varying vec3 vPosition;
            `
          );

          mtl.Fragment_MainEnd(`
            vec4 distGradColor=gl_FragColor;

            // 设置混合的百分比
            float gradMix=(vPosition.y+uHeight/2.0)/uHeight;
            //计算出混合颜色
            vec3 mixColor=mix(distGradColor.xyz,vec3(1.0,1.0,1.0),gradMix);
            gl_FragColor=vec4(mixColor,1.0);
          `);

          //浅蓝色
        }
      }
    }
  });

  engine.runRenderLoop(() => {
    scene.render();
  });
}
