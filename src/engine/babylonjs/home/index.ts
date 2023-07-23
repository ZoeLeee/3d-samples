import { CreatePlane, Mesh, ShaderMaterial, Texture, Vector2 } from "@babylonjs/core";
import { InitCanvas } from "../common/init";

export function renderHome(canvas: HTMLCanvasElement) {
    const [engine, scene, gui] = InitCanvas(canvas);

    const plane = CreatePlane("广告牌", {
        size: 100,
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
    mtl.setVector2("iResolution", new Vector2(engine.getRenderWidth(), engine.getRenderHeight()))
    mtl.setVector2("iMouse", new Vector2(engine.getRenderWidth() / 2, engine.getRenderHeight() / 2))


    let time = 0
    scene.onAfterRenderObservable.add(() => {
        time += 0.01;
        mtl.setFloat("iTime", time)
    })

    plane.material = mtl

    return () => {
        engine.dispose()
    }

}