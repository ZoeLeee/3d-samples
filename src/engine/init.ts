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
  RegisterMaterialPlugin,
  ShaderMaterial,
  Texture,
} from "@babylonjs/core";
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";

import { GridMaterial } from "@babylonjs/materials/Grid";
import "@babylonjs/loaders/glTF/2.0/glTFLoader";
import { CustomMaterial } from "@babylonjs/materials";
import { ScanMaterialPlugin } from "./babylonjs/ScanMaterialPlugin";
import { getCylinderShader } from "./babylonjs/shader";
import { gsap } from "gsap";
import { showSnow } from "./effect/snow";

//初始化babylonjs
export function initBabylon(canvas: HTMLCanvasElement, type: number) {
  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);

  scene.useRightHandedSystem = true;

  window["debug"] = () => {
    scene.debugLayer.show({
      embedMode: true,
      overlay: true,
      globalRoot: document.getElementById("app"),
    });
  };

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

  if (type === 0) {
    let time = 0;

    // const viewer = new AxesViewer(scene, 10);

    console.log(Color3.FromHexString("#aaaeff"));

    const mtls: StandardMaterial[] = [];

    // RegisterMaterialPlugin("BlackAndWhite", (material) => {

    //   return material.blackAndWhite;
    // });

    SceneLoader.LoadAssetContainer(
      "/models/",
      "city.glb",
      scene,
      (container) => {
        container.addAllToScene();

        for (const m of container.meshes) {
          if (m instanceof Mesh) {
            if (m.geometry) {
              const mtl = new StandardMaterial("mtl", scene);
              mtl.diffuseColor = Color3.FromHexString("#0c0e6f");
              m.material = mtl;

              mtls.push(mtl);
              m.computeWorldMatrix(true);
              const boundingBox = m.getBoundingInfo().boundingBox;
              console.log("boundingBox: ", boundingBox);

              const y = boundingBox.maximum.y - boundingBox.minimum.y;
              console.log("y: ", y);

              // console.log("mtl: ", mtl);

              let max = boundingBox.extendSize.x;

              mtl.blackAndWhite = new ScanMaterialPlugin(mtl, { height: y });

              // mtl.AddUniform("uHeight", "float", y);
              // mtl.AddUniform(
              //   "uTopColor",
              //   "vec3",
              //   Vector3.FromArray(Color3.FromHexString("#aaaeff").asArray())
              // );

              // mtl.AddUniform("uCenter", "vec2", new Vector2());
              // mtl.AddUniform("uWidth", "float", 10);
              // mtl.AddUniform("uTime", "float", 0);

              // mtl.Vertex_Begin(`varying vec3 vPosition;`);
              // mtl.Vertex_MainEnd(`
              // vec4 p=viewProjection*worldPos;
              // vPosition=positionUpdated;
              // `);

              // mtl.Fragment_Begin(
              //   `
              //   varying vec3 vPosition;
              //   `
              // );

              // mtl.Fragment_MainEnd(`
              //   vec4 distGradColor=gl_FragColor;

              //   // 设置混合的百分比
              //   float gradMix=(vPosition.y+uHeight/2.0)/uHeight;
              //   //计算出混合颜色
              //   vec3 mixColor=mix(distGradColor.xyz,uTopColor,gradMix);
              //   gl_FragColor=vec4(mixColor,1.0);

              //   // 离中心电距离
              //   float dist=distance(vPosition.xz,uCenter);

              //   // 扩散范围函数
              //   float spreadIndex=-pow(dist-uTime,2.0)+uWidth;

              //   if(spreadIndex>0.0){
              //     gl_FragColor=mix(gl_FragColor,vec4(1.0),spreadIndex/uWidth);
              //   }

              // `);

              console.log(mtl.blackAndWhite);

              mtl.onBindObservable.add(function () {
                time++;
                if (time >= max) {
                  time = 0;
                }
                mtl.blackAndWhite.time = time;
              });

              //浅蓝色
            }
          }
        }

        showSnow(scene,camera)
      }
    );
  } else if (type === 1) {
    SceneLoader.LoadAssetContainer(
      "/models/",
      "city.glb",
      scene,
      (container) => {
        container.addAllToScene();
        const meshes = container.meshes as Mesh[];
        meshes.forEach((m) => {
        if (m.geometry) {
            const mtl = new StandardMaterial("mtl", scene);
            mtl.diffuseColor = Color3.FromHexString("#00dbfd");
            m.material = mtl;
          }
        });

        const groud = MeshBuilder.CreateGround(
          "ground",
          { width: 40, height: 40 },
          scene
        );

        const material1 = new ShaderMaterial(
          "material1",
          scene,
          { vertex: "scan1", fragment: "scan1" },
          {
            attributes: ["position", "uv"],
            uniforms: [
              "worldViewProjection",
              "time",
              "opacity",
              "alpha",
              "color",
              "flowColor",
              "glowFactor",
              "speed",
            ],
            samplers: ["textureSampler"],
          }
        );

        const scan_map = new Texture(
          "https://hcwl-cdn.cdn.bcebos.com/hc3d/static/images/scan_map.png",
          scene
        );
        const maskMap = new Texture(
          "https://hcwl-cdn.cdn.bcebos.com/hc3d/static/images/scan-mask-map-2.png",
          scene
        );
        material1.setTexture("map", scan_map);
        material1.setTexture("maskMap", maskMap);
        material1.setFloat("opacity", 1);
        material1.setFloat("alpha", 0.2);
        material1.setColor3("color", new Color3(0.0784, 0.5490, 0.9608));
        material1.setColor3("flowColor", new Color3(0.1490, 0.7961, 1));
        material1.setFloat("glowFactor", 10);
        material1.setFloat("speed", 0.6);
        material1.setFloat("time", 0);

        material1.alpha = 0.99


        groud.material = material1;
        let t = 0.025;
        material1.onBindObservable.add(function () {
          t += 0.01;
          material1.setFloat("time", t);
        });

        const height = 10

        const cylinder = MeshBuilder.CreateCylinder("光柱", {
          diameter: 5, height: height, cap: 0, sideOrientation: 2
        }, scene)

        cylinder.position.y = height / 2;
        const mtl=getCylinderShader("LightingCyliner",scene)

        cylinder.material=mtl;
        mtl.alpha=0.99


        mtl.setFloat("uHeight",height)
        gsap.to(cylinder.scaling,{
          x:2,z:2,yoyo:true,repeat:-1,duration:1
        })


        const RadarMtl=getCylinderShader("Radar",scene,{
          attributes: ["position", "uv"],
          uniforms:["worldViewProjection","uColor","uTime"],
        })

        RadarMtl.setColor3("uColor",new Color3(1,0,1));
        RadarMtl.setFloat("uTime",0);

        const ground=MeshBuilder.CreateGround("ground",{width:10,height:10},scene)

        ground.material=RadarMtl;

        RadarMtl.alpha=0.99

        ground.position.y=10
        let time=0
        RadarMtl.onBindObservable.add(function(){
          time+=0.01;
          RadarMtl.setFloat("uTime",time);
        })


      }
    );
  }

  engine.runRenderLoop(() => {
    scene.render();
  });

  window.addEventListener("resize", () => {
    engine.resize();
  });
}
