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
  Vector2,
} from "@babylonjs/core";
import { GridMaterial } from "@babylonjs/materials/Grid";
import "@babylonjs/loaders/glTF/2.0/glTFLoader";
import { CustomMaterial } from "@babylonjs/materials";

//初始化babylonjs
export function initBabylon(canvas: HTMLCanvasElement) {
  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);

  scene.useRightHandedSystem = true;

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

  // const groud = MeshBuilder.CreateGround(
  //   "ground",
  //   { width: 100, height: 100 },
  //   scene
  // );

  // const gridMaterial = new GridMaterial("gridMaterial", scene);

  // groud.material = gridMaterial;

  // groud.position.y = -1;

  let time = 0;

  // const viewer = new AxesViewer(scene, 10);

  console.log(Color3.FromHexString("#aaaeff"));

  const mtls: CustomMaterial[] = [];

  SceneLoader.LoadAssetContainer("/models/", "city.glb", scene, (container) => {
    container.addAllToScene();

    for (const m of container.meshes) {
      if (m instanceof Mesh) {
        if (m.geometry) {
          const mtl = new CustomMaterial("mtl", scene);
          mtl.diffuseColor = Color3.FromHexString("#0c0e6f");
          m.material = mtl;

          mtls.push(mtl);
          m.computeWorldMatrix(true);
          const boundingBox = m.getBoundingInfo().boundingBox;
          console.log("boundingBox: ", boundingBox);

          const y = boundingBox.maximum.y - boundingBox.minimum.y;
          console.log("y: ", y);

          console.log("mtl: ", mtl);

          let max = boundingBox.extendSize.x;

          mtl.AddUniform("uHeight", "float", y);
          mtl.AddUniform(
            "uTopColor",
            "vec3",
            Vector3.FromArray(Color3.FromHexString("#aaaeff").asArray())
          );

          mtl.AddUniform("uCenter", "vec2", new Vector2());
          mtl.AddUniform("uWidth", "float", 10);
          mtl.AddUniform("uTime", "float", 0);

          mtl.Vertex_Begin(`varying vec3 vPosition;`);
          mtl.Vertex_MainEnd(`
          vec4 p=viewProjection*worldPos;
          vPosition=positionUpdated;
          `);

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
            vec3 mixColor=mix(distGradColor.xyz,uTopColor,gradMix);
            gl_FragColor=vec4(mixColor,1.0);

            // 离中心电距离
            float dist=distance(vPosition.xz,uCenter);

            // 扩散范围函数
            float spreadIndex=-pow(dist-uTime,2.0)+uWidth;

            if(spreadIndex>0.0){
              gl_FragColor=mix(gl_FragColor,vec4(1.0),spreadIndex/uWidth);
            }

          `);

          mtl.onBindObservable.add(function () {
            time++;
            if (time >= max) {
              time = 0;
            }
            mtl.getEffect()?.setFloat("uTime", time);
          });

          //浅蓝色
        }
      }
    }
  });

  engine.runRenderLoop(() => {
    scene.render();
  });

  window.addEventListener("resize", () => { engine.resize(); })
}
