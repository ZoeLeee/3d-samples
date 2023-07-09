import { Scene, ShaderMaterial } from "@babylonjs/core";

export function getCylinderShader(scene:Scene){
    const mtl=new ShaderMaterial("光柱效果",scene,"LightingCyliner",{})

    return mtl
}
