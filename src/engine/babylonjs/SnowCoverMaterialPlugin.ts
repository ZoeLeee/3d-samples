import {
  Color3,
  MaterialPluginBase,
  PBRBaseMaterial,
  Texture,
  UniformBuffer,
  Vector2,
  Vector3,
} from "@babylonjs/core";

import imgUrl from '../../assets/southeast.jpg'
console.log('imgUrl: ', imgUrl);

/**
 * This is a custom material plugin that will colorify the material.
 */
export class SnowCoverMaterialPlugin extends MaterialPluginBase {
  public snowAmount = 0.01;
  private texture;
  constructor(material) {
    // last parameter is a priority, which lets you define the order multiple plugins are run.
    super(material, "SnowCover", 200, { SNOWCOVER: false });

    this.texture=new Texture(imgUrl,material.getScene())

    this._enable(true);
  }

  prepareDefines(defines, scene, mesh) {
    defines["SNOWCOVER"] = true;
  }

  getClassName() {
    return "SnowCoverPluginMaterial";
  }
  // here we can define any uniforms to be passed to the shader code.
  getUniforms() {
    return {
      // first, define the UBO with the correct type and size.
      ubo: [
        { name: "snowAmount", size: 1, type: "float" },
        { name: "snowColor", size: 3, type: "vec3" },
        { name: "snowDirection", size: 3, type: "vec3" },
        { name: "snowTexture", size: 3, type: "vec3" },
      ],
      // now, on the fragment shader, add the uniform itself in case uniform buffers are not supported by the engine
      fragment: `#ifdef SNOWCOVER
                        uniform float snowAmount; 
                        uniform vec3 snowDirection;
                        uniform vec3 snowColor;
                        #endif`,
    };
  }
  getSamplers(samplers) {
    samplers.push("SnowTexture");
  }
  bindForSubMesh(uniformBuffer: UniformBuffer, scene, engine, subMesh) {
    uniformBuffer.updateFloat("snowAmount", this.snowAmount);
    uniformBuffer.updateColor3("snowColor", Color3.White());
    uniformBuffer.updateVector3("snowDirection", new Vector3(0, 1));
    uniformBuffer.setTexture("SnowTexture",this.texture);
  }

  getCustomCode(shaderType) {
    if (shaderType === "fragment") {
      // we're adding this specific code at the end of the main() function
      return {
        CUSTOM_FRAGMENT_DEFINITIONS: `
        varying vec3 vNormal;
        uniform sampler2D SnowTexture;
        float random (vec2 st) {
            return fract(sin(dot(st.xy,
                                 vec2(12.9898,78.233)))*
                43758.5453123);
        }
        `,
        CUSTOM_FRAGMENT_MAIN_END: `
            #ifdef SNOWCOVER
        
            vec4 snowC=texture2D(SnowTexture,vDiffuseUV);

            // 计算覆盖判断
            float cover = dot(vNormal, snowDirection) - (1.0 - snowAmount);
          
            if (cover > 0.0) {
              gl_FragColor = snowC; 
            }
            #endif
        `,
      };
    }

    if (shaderType === "vertex") {
      return {
        CUSTOM_VERTEX_DEFINITIONS: `varying vec3 vNormal;`,
        // CUSTOM_VERTEX_UPDATE_WORLDPOS: `
        //   float snowDepth=0.1;
        //   vec3 snowDirection=vec3(0.0,1.0,0.0);
        //   // 顶点沿法线和雪方向偏移
        //   vec3 offset = normalize(normal + snowDirection) * snowDepth;
        //   worldPos.x+=offset.x;
        //   worldPos.y+=offset.y;
        //   worldPos.z+=offset.z;  
        // `,
        CUSTOM_VERTEX_MAIN_END: `
          vNormal=normal;
          `,
      };
    }

    // for other shader types we're not doing anything, return null
    return null;
  }
}
