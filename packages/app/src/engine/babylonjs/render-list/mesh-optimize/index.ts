import { InitCanvas } from "../../common/init";
import { ZoomAll } from "../../../utils";
import { Viewport } from "@babylonjs/core/Maths/math.viewport";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { StackPanel } from "@babylonjs/gui/2D/controls/stackPanel";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import { Mesh } from "@babylonjs/core/Meshes";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths";
import { postData } from "../../../utils/fetch";

const uiContainer = new Map<Scene, AdvancedDynamicTexture>()

const renderCount = (scene: Scene, meshes: Mesh[]) => {

    const advancedTexture = uiContainer.get(scene) ?? AdvancedDynamicTexture.CreateFullscreenUI("UI", undefined, scene);

    uiContainer.set(scene, advancedTexture)

    advancedTexture.getChildren().forEach(c => c.dispose())

    const panel = new StackPanel();
    panel.width = 0.2

    panel.horizontalAlignment = 0

    advancedTexture.addControl(panel);

    const text1 = new TextBlock();

    text1.width = 1;
    text1.height = "40px";


    text1.color = "white";
    text1.fontSize = 24;
    panel.addControl(text1);

    const text2 = text1.clone() as TextBlock
    panel.addControl(text2)

    let vc = 0;
    let fc = 0
    meshes.forEach(m => {
        vc += m.getTotalVertices()
        fc += m.getTotalIndices() / 3
    })
    text1.text = "点数: " + vc;
    text2.text = "面数: " + fc;
}

export function renderMeshOptimize(canvas: HTMLCanvasElement, demoName = "Xbot.glb") {
    const [engine, scene, camera, gui] = InitCanvas(canvas)


    const scene2 = new Scene(engine)

    const camera2 = new ArcRotateCamera("1", Math.PI / 2, Math.PI / 4, 100, new Vector3(0, 0, 0), scene2)

    camera.viewport = new Viewport(0, 0, 0.5, 1)


    scene2.activeCamera = camera2
    camera2.viewport = new Viewport(0.5, 0, 0.5, 1)

    scene2.autoClear = false

    const params = {
        loadFile: function () {
            document.getElementById('myInput').click();
        },
        radio: 0.5,
        error: 0.001,
        demoName: 'Xbot.glb',
        wireframe: false,
    };

    const optimize = () => {
        postData("http://localhost:3000/optimize", {
            radio: params.radio,
            fileName: params.demoName,
            error: params.error
        }).then(res => {
            if (res.code === 0) {
                SceneLoader.LoadAssetContainer(
                    "http://localhost:3000/",
                    res.result,
                    scene2,
                    (container) => {
                        container.addAllToScene();

                        setTimeout(() => {
                            ZoomAll(camera2, scene2)
                            scene2.createDefaultLight(true)

                            scene2.createDefaultEnvironment();

                            renderCount(scene2, container.meshes as Mesh[])

                        }, 1000);
                    }
                );
            }
        })
    }

    const load = (demoName: string) => {
        SceneLoader.LoadAssetContainer(
            "http://localhost:3000/",
            `${demoName}`,
            scene,
            (container) => {
                container.addAllToScene();

                setTimeout(() => {
                    ZoomAll(camera, scene)
                    const helper = scene.createDefaultEnvironment();

                    helper.setMainColor(Color3.Teal());

                    renderCount(scene, container.meshes as Mesh[])
                }, 1000);
            }
        );
        optimize()
    }

    gui.domElement.style.float = "left"

    gui.add({
        label: 'Click me!',
        onClick: function () {
            import("@babylonjs/inspector").then((inspector) => {
                scene2.debugLayer.show({
                    embedMode: true,
                    overlay: true,
                    globalRoot: document.getElementById("app"),
                });
            })
        }
    }, 'onClick').name("调试2");


    gui.add(params, 'loadFile').name('上传模型');

    gui.add(params, 'demoName', ['Xbot.glb', 'LittlestTokyo.glb']).onChange(function (val) {
        params.demoName = val
        const roots = scene.rootNodes.filter(m => m instanceof Mesh)
        roots.push(...scene2.rootNodes.filter(m => m instanceof Mesh))
        roots.forEach(m => {
            m.dispose()
        })
        load(val)
    });


    gui.add(params, 'radio', 0, 1).onChange(function (val) {
        params.radio = val
    }).name("压缩率");

    gui.add(params, 'error').onChange(function (val) {
        params.error = val
    }).name("误差限制");

    gui.add(params, 'wireframe').onChange(function (val) {
        scene.materials.forEach(mtl => {
            mtl.wireframe = val
        })
        scene2.materials.forEach(mtl => {
            mtl.wireframe = val
        })

    }).name("线框模式");


    gui.add({
        label: 'Click me!',
        onClick: function (par) {
            const roots = []
            roots.push(...scene2.rootNodes.filter(m => m instanceof Mesh))
            roots.forEach(m => {
                m.dispose()
            })
            optimize()
        }
    }, 'onClick').name("压缩");




    camera.onViewMatrixChangedObservable.add((c: ArcRotateCamera) => {
        camera2.radius = c.radius
        camera2.alpha = c.alpha
        camera2.beta = c.beta
    })



    load(demoName)




    engine.runRenderLoop(() => {
        scene.render()
        scene2.render()
    })

    return () => {
        engine.dispose()
    }
}