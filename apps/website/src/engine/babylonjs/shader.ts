
import { IShaderMaterialOptions, ShaderMaterial } from "@babylonjs/core/Materials/shaderMaterial";
import "./shaders/radar";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Scene } from "@babylonjs/core/scene";
import { Color3 } from "@babylonjs/core/Maths/math.color";

export function getCylinderShader(name: string, scene: Scene, options: Partial<IShaderMaterialOptions> = {}) {
    const mtl = new ShaderMaterial("光柱效果", scene, name, options)

    return mtl
}


export function getSnowMtl(scene: Scene) {
    const mtl = new ShaderMaterial("积雪材质", scene, "Snow", {
        attributes: ["position", "uv", "normal"],
        uniforms: ["worldViewProjection", "snowAmount", "snowColor", "snowDirection"]
    })

    mtl.setFloat("snowAmount", 1)
    mtl.setVector3("snowDirection", new Vector3(0, 0, 1))
    mtl.setColor3("snowColor", Color3.White())


    return mtl
}