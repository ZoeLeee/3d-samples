import {
  Color3,
  MaterialPluginBase,
  PBRBaseMaterial,
  UniformBuffer,
  Vector2,
} from "@babylonjs/core";

/**
 * This is a custom material plugin that will colorify the material.
 */
export class ScanMaterialPlugin extends MaterialPluginBase {
  public time=0;
  constructor(material, private options: { height: number }) {
    // last parameter is a priority, which lets you define the order multiple plugins are run.
    super(material, "BlackAndWhite", 200, { BLACKANDWHITE: false });

    this._enable(true);
  }

  prepareDefines(defines, scene, mesh) {
    defines["BLACKANDWHITE"] = true;
  }

  getClassName() {
    return "BlackAndWhitePluginMaterial";
  }
  // here we can define any uniforms to be passed to the shader code.
  getUniforms() {
    return {
      // first, define the UBO with the correct type and size.
      ubo: [
        { name: "uHeight", size: 1, type: "float" },
        { name: "uTopColor", size: 3, type: "vec3" },
        { name: "uCenter", size: 2, type: "vec2" },
        { name: "uWidth", size: 1, type: "float" },
        { name: "uTime", size: 1, type: "float" },
      ],
      // now, on the fragment shader, add the uniform itself in case uniform buffers are not supported by the engine
      fragment: `#ifdef BLACKANDWHITE
                        uniform float uHeight;
                        uniform vec3 uTopColor;
                        uniform vec2 uCenter;
                        uniform float uWidth;
                        uniform float uTime;
                      #endif`,
    };
  }
  bindForSubMesh(uniformBuffer: UniformBuffer, scene, engine, subMesh) {
    uniformBuffer.updateFloat("uHeight", this.options?.height ?? 0.5);
    uniformBuffer.updateColor3("uTopColor", Color3.FromHexString("#aaaeff"));
    uniformBuffer.updateFloat2("uCenter", 0, 0);
    uniformBuffer.updateFloat("uWidth", 10);
    uniformBuffer.updateFloat("uTime", this.time);
  }

  getCustomCode(shaderType) {
    console.log("shaderType: ", shaderType);
    if (shaderType === "fragment") {
      // we're adding this specific code at the end of the main() function
      return {
        CUSTOM_FRAGMENT_DEFINITIONS: `varying vec3 vPos;`,
        CUSTOM_FRAGMENT_MAIN_END: `
          #ifdef BLACKANDWHITE
            vec4 distGradColor=gl_FragColor;

            // 设置混合的百分比
            float gradMix=(vPos.y+uHeight/2.0)/uHeight;
            //计算出混合颜色
            vec3 mixColor=mix(distGradColor.xyz,uTopColor,gradMix);
            gl_FragColor=vec4(mixColor,1.0);

            // 离中心电距离
            float dist=distance(vPos.xz,uCenter);

            // 扩散范围函数
            float spreadIndex=-pow(dist-uTime,2.0)+uWidth;

            if(spreadIndex>0.0){
              gl_FragColor=mix(gl_FragColor,vec4(1.0),spreadIndex/uWidth);
            }
          #endif
      `,
      };
    }

    if (shaderType === "vertex") {
      return {
        CUSTOM_VERTEX_DEFINITIONS: `varying vec3 vPos;`,
        CUSTOM_VERTEX_MAIN_END: `
        vPos=positionUpdated;
        `,
      };
    }

    // for other shader types we're not doing anything, return null
    return null;
  }
}
