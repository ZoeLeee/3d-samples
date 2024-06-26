import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { InitCanvas } from "../../common/init";
import { getCylinderShader } from "../../shader";
import gsap from "gsap";
import { Mesh, MeshBuilder } from "@babylonjs/core/Meshes";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { ShaderMaterial, Texture } from "@babylonjs/core/Materials";
import { toggleGLoablLoading } from "@/stores";

export function renderRadarEffect(canvas: HTMLCanvasElement) {
  const [engine, scene, camera, gui] = InitCanvas(canvas);

  toggleGLoablLoading(true);

  SceneLoader.LoadAssetContainer("/models/", "city.glb", scene, (container) => {
    toggleGLoablLoading(false);
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
    material1.setColor3("color", new Color3(0.0784, 0.549, 0.9608));
    material1.setColor3("flowColor", new Color3(0.149, 0.7961, 1));
    material1.setFloat("glowFactor", 10);
    material1.setFloat("speed", 0.6);
    material1.setFloat("time", 0);

    material1.alpha = 0.99;

    groud.material = material1;
    let t = 0.025;
    material1.onBindObservable.add(function () {
      t += 0.01;
      material1.setFloat("time", t);
    });

    const height = 10;

    const cylinder = MeshBuilder.CreateCylinder(
      "光柱",
      {
        diameter: 5,
        height: height,
        cap: 0,
        sideOrientation: 2,
      },
      scene
    );

    cylinder.position.y = height / 2;
    const mtl = getCylinderShader("LightingCyliner", scene);

    cylinder.material = mtl;
    mtl.alpha = 0.99;

    mtl.setFloat("uHeight", height);
    gsap.to(cylinder.scaling, {
      x: 2,
      z: 2,
      yoyo: true,
      repeat: -1,
      duration: 1,
    });

    const RadarMtl = getCylinderShader("Radar", scene, {
      attributes: ["position", "uv"],
      uniforms: ["worldViewProjection", "uColor", "uTime"],
    });

    RadarMtl.setColor3("uColor", new Color3(1, 0, 1));
    RadarMtl.setFloat("uTime", 0);

    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: 10, height: 10 },
      scene
    );

    ground.material = RadarMtl;

    RadarMtl.alpha = 0.99;

    ground.position.y = 10;
    let time = 0;
    RadarMtl.onBindObservable.add(function () {
      time += 0.01;
      RadarMtl.setFloat("uTime", time);
    });
  });

  return () => {
    engine.dispose();
  };
}
