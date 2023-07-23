import {
    ArcRotateCamera,
    Engine,
    HemisphericLight,
    Scene,
    Vector3
} from "@babylonjs/core";
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";

import "@babylonjs/loaders/glTF/2.0/glTFLoader";
import { GUI } from 'dat.gui';


export function InitCanvas(canvas: HTMLCanvasElement) {
    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);

    scene.useRightHandedSystem = true;

    const gui = new GUI()

    gui.add({
        label: 'Click me!',
        onClick: function () {
            scene.debugLayer.show({
                embedMode: true,
                overlay: true,
                globalRoot: document.getElementById("app"),
            });
        }
    }, 'onClick').name("调试");

    const camera = new ArcRotateCamera(
        "camera",
        Math.PI / 2,
        Math.PI / 2,
        100,
        new Vector3(0, 0, 0),
        scene
    );
    camera.attachControl(canvas, true);

    const light = new HemisphericLight("light", new Vector3(1, 1, 1), scene);

    light.intensity = 1

    engine.runRenderLoop(() => {
        scene.render();
    });

    engine.onDisposeObservable.addOnce(() => {
        if (gui)
            gui.destroy()
    })

    return [engine, scene, gui] as [
        Engine, Scene, GUI
    ]
}