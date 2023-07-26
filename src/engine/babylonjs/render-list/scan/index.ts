import { Color3, Mesh, SceneLoader, StandardMaterial } from "@babylonjs/core";
import { ScanMaterialPlugin } from "../../ScanMaterialPlugin";
import { InitCanvas } from "../../common/init";

export function renderScanEffect(canvas: HTMLCanvasElement) {
    const [engine, scene, camera, gui] = InitCanvas(canvas)

    let time = 0;

    const mtls: StandardMaterial[] = [];

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

                        const y = boundingBox.maximum.y - boundingBox.minimum.y;

                        // console.log("mtl: ", mtl);

                        const max = boundingBox.extendSize.x;

                        mtl["blackAndWhite"] = new ScanMaterialPlugin(mtl, { height: y });

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


                        mtl.onBindObservable.add(function () {
                            time++;
                            if (time >= max) {
                                time = 0;
                            }
                            mtl["blackAndWhite"].time = time;
                        });

                        //浅蓝色
                    }
                }
            }
        }, null, (s, message, stack) => {
            console.log("file: index.ts:96 ~ renderScanEffect ~ stack:", stack)
            console.log("file: index.ts:96 ~ renderScanEffect ~ message:", message)
        }
    );

    return () => {
        engine.dispose()
    }
}