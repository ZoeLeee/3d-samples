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

const renderCount = (scene: Scene, meshes: Mesh[]) => {

    const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI", undefined, scene);


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

export function renderMeshOptimize(canvas: HTMLCanvasElement, isMain = true) {
    const [engine, scene, camera, gui] = InitCanvas(canvas)



    if (isMain) {
        const params = {
            loadFile: function () {
                document.getElementById('myInput').click();
            }
        };
        gui.add(params, 'loadFile').name('选择模型');
    }

    const scene2 = new Scene(engine)

    const camera2 = new ArcRotateCamera("1", Math.PI / 2, Math.PI / 4, 100, new Vector3(0, 0, 0), scene2)

    camera.viewport = new Viewport(0, 0, 0.5, 1)


    scene2.activeCamera = camera2
    camera2.viewport = new Viewport(0.5, 0, 0.5, 1)

    scene2.autoClear = false

    camera.onViewMatrixChangedObservable.add((c: ArcRotateCamera) => {
        camera2.radius = c.radius
        camera2.alpha = c.alpha
        camera2.beta = c.beta
    })



    gui.add({
        label: 'Click me!',
        onClick: function () {
            scene2.debugLayer.show({
                embedMode: true,
                overlay: true,
                globalRoot: document.getElementById("app"),
            });
        }
    }, 'onClick').name("调试2");

    SceneLoader.LoadAssetContainer(
        "http://localhost:3000/",
        "Xbot.glb",
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
    SceneLoader.LoadAssetContainer(
        "http://localhost:3000/",
        "output.glb",
        scene2,
        (container) => {
            container.addAllToScene();

            setTimeout(() => {
                ZoomAll(camera2, scene2)
                scene2.createDefaultLight(true)


                const helper = scene2.createDefaultEnvironment();

                // helper.setMainColor(Color3.Teal());

                renderCount(scene2, container.meshes as Mesh[])

            }, 1000);
        }
    );


    engine.runRenderLoop(() => {
        scene.render()
        scene2.render()
    })

    return () => {
        engine.dispose()
    }
}