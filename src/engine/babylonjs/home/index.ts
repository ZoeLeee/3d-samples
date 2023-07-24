import { Camera, CreatePlane, CreatePlaneVertexData, Mesh, ShaderMaterial, Texture, Vector2 } from "@babylonjs/core";
import { InitCanvas } from "../common/init";

export function renderHome(canvas: HTMLCanvasElement) {
    const [engine, scene, camera, gui] = InitCanvas(canvas);

    const width = engine.getRenderWidth()
    const height = engine.getRenderHeight()


    const ap = width / height;

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


    // Create the 3D UI manager
    const manager = new GUI.GUI3DManager(scene);


    return () => {
        engine.dispose()
    }

}