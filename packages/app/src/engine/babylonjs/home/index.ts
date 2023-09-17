
import { CreatePlane, CreatePlaneVertexData } from "@babylonjs/core/Meshes/Builders/planeBuilder";
import { InitCanvas } from "../common/init";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { ShaderMaterial, Texture } from "@babylonjs/core/Materials";
import { Vector2 } from "@babylonjs/core/Maths";
import { Camera } from "@babylonjs/core/Cameras";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { GUI3DManager } from "@babylonjs/gui/3D/gui3DManager";
import { HolographicButton } from "@babylonjs/gui/3D/controls/holographicButton";

export function renderHome(canvas: HTMLCanvasElement) {
    const [engine, scene, camera, gui] = InitCanvas(canvas);

    const width = engine.getRenderWidth()
    const height = engine.getRenderHeight()

    camera.alpha = Math.PI / 2
    camera.beta = Math.PI / 2

    const plane = CreatePlane("广告牌", {
        width,
        height,
        sideOrientation: Mesh.DOUBLESIDE
    })

    const mtl = new ShaderMaterial("首页", scene, "Home", {
        attributes: ["position", "normal", "uv"],
        uniforms: ["world", "worldView", "iMouse", "iResolution", "worldViewProjection", "view", "projection", "iTime", "direction"],
        samplers: ["textureSampler"],
        defines: ["MyDefine"],
        needAlphaBlending: true,
        needAlphaTesting: true
    })

    const amigaTexture = new Texture("https://cdn.jsdelivr.net/gh/ZoeLeee/cdn/img/village/20111208032646806585.jpg", scene);
    mtl.setTexture("textureSampler", amigaTexture);
    mtl.setVector2("iResolution", new Vector2(width, height))
    // mtl.setVector2("iMouse", new Vector2(width / 2, height / 2))


    let time = 0
    scene.onAfterRenderObservable.add(() => {
        time += 0.01;
        mtl.setFloat("iTime", time)
    })

    plane.material = mtl

    camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
    camera.detachControl();

    gui.close()

    const update = () => {
        const width = engine.getRenderWidth()
        console.log("file: index.ts:46 ~ update ~ width:", width)
        const height = engine.getRenderHeight()
        console.log("file: index.ts:48 ~ update ~ height:", height)
        camera.orthoLeft = -width / 2;
        camera.orthoRight = width / 2;
        camera.orthoTop = height / 2;
        camera.orthoBottom = -height / 2;
    }

    update()

    engine.onResizeObservable.add(() => {
        update()
        const width = engine.getRenderWidth()
        const height = engine.getRenderHeight()
        const vx = CreatePlaneVertexData({
            width,
            height,
            sideOrientation: Mesh.DOUBLESIDE
        })
        vx.applyToMesh(plane)
        mtl.setVector2("iResolution", new Vector2(width, height))
        // mtl.setVector2("iMouse", new Vector2(width / 2, height / 2))

    })

    // const anchor = new TransformNode("anchor", scene);

    // // Create the 3D UI manager
    // const manager = new GUI3DManager(scene);

    // const button = new HolographicButton("BJS");
    // manager.addControl(button);
    // button.linkToTransformNode(anchor);

    // button.position.set(-500, 500, 0)
    // button.scaling.set(200, 200, 200)

    // button.imageUrl = "https://logos-download.com/wp-content/uploads/2022/12/Babylon.js_Logo.png";

    // button.text = "Babylonjs";

    // button.onPointerDownObservable.addOnce(() => {
    //     location.href = "/bjs"
    // })

    return () => {
        engine.dispose()
    }

}