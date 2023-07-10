import { IShaderMaterialOptions, Scene, ShaderMaterial } from "@babylonjs/core";
import "./shaders/radar";

export function getCylinderShader(name:string,scene:Scene,options:Partial<IShaderMaterialOptions>={}){
    const mtl=new ShaderMaterial("光柱效果",scene,name,options)

    return mtl
}
