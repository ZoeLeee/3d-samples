
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import "@babylonjs/core/Debug/debugLayer";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Vector3 } from "@babylonjs/core/Maths";
import { Scene } from "@babylonjs/core/scene";

import "@babylonjs/core/Helpers/sceneHelpers"

import "@babylonjs/loaders";

import { GUI } from 'dat.gui';

import "@babylonjs/core/Loading"


export function InitCanvas(canvas: HTMLCanvasElement) {
    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);

    scene.useRightHandedSystem = true;

    const gui = new GUI()

    gui.add({
        label: 'Click me!',
        onClick: function () {
            import("@babylonjs/inspector").then(() => {
                scene.debugLayer.show({
                    embedMode: true,
                    overlay: true,
                    globalRoot: document.getElementById("app"),
                });
            })

        }
    }, 'onClick').name("调试");

    const camera = new ArcRotateCamera(
        "camera",
        Math.PI / 2,
        Math.PI / 4,
        100,
        new Vector3(0, 0, 0),
        scene
    );
    camera.attachControl(canvas, true);

    const light = new HemisphericLight("light", new Vector3(1, 1, 1), scene);

    light.intensity = 1

    const onResize = () => {
        engine.resize()
    }

    window.addEventListener("resize", onResize)


    engine.runRenderLoop(() => {
        scene.render();
    });

    engine.onDisposeObservable.addOnce(() => {
        if (gui)
            gui.destroy()

        window.removeEventListener("resize", onResize)
    })


    return [engine, scene, camera, gui] as [
        Engine, Scene, ArcRotateCamera, GUI
    ]
}