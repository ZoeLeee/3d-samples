import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { InitCanvas } from "../../common/init";
import { SnowCoverMaterialPlugin } from "../../SnowCoverMaterialPlugin";

export function renderCoverSnow(canvas: HTMLCanvasElement) {
    const [engine, scene, camera, gui] = InitCanvas(canvas)
    const name = "HillValley.babylon";

    engine.loadingScreen.displayLoadingUI();

    SceneLoader.AppendAsync(
        "https://www.babylonjs.com/Scenes/hillvalley/",
        name,
        scene
    ).then((res) => {

        engine.loadingScreen.hideLoadingUI();

        const plugin: SnowCoverMaterialPlugin[] = []
        camera.position = scene.activeCamera.position;
        camera.target = scene.activeCamera.target;
        scene.activeCamera = camera;

        for (const material of scene.materials) {
            // if (m.geometry) {
            //   const mtl = getSnowMtl(scene);

            //   m.material = mtl;
            // }

            material["snowCover"] = new SnowCoverMaterialPlugin(material)

            plugin.push(material["snowCover"])

        }

        const params = {
            snowAmount: 0.5,
            smoothFactor: 0.5,
        };


        gui.add(params, 'snowAmount', 0, 1).onChange(function (val) {
            for (const p of plugin) {
                p.snowAmount = val;
            }
        });
        gui.add(params, 'smoothFactor', 0, 1).onChange(function (val) {
            for (const p of plugin) {
                p.smoothFactor = val;
            }
        });

        gui.open();

    });

    return () => {
        engine.dispose()
    }
}