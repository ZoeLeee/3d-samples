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
        varying vec2 vUv;
        uniform sampler2D SnowTexture;
        `,
        CUSTOM_FRAGMENT_MAIN_END: `
            #ifdef SNOWCOVER
        
            vec4 snowC=texture2D(SnowTexture,vUv);

            float an=dot(vNormal, snowDirection);

            // 计算覆盖判断
            float cover = an - (1.0 - snowAmount);
          
            if (cover > 0.0) {
              vec3 color=mix(vec3(1.0,1.0,1.0),vec3(0.0,0.0,0.0),cover);
              // gl_FragColor = vec4(snowC.rgb,clamp(an,0.0,1.0)); 
               gl_FragColor = vec4(color,cover);
            }
            #endif
        `,
      };
    }

    if (shaderType === "vertex") {
      return {
        CUSTOM_VERTEX_DEFINITIONS: `
        varying vec3 vNormal;
        varying vec2 vUv;`,
        CUSTOM_VERTEX_MAIN_END: `
          vNormal=normal;
          #ifdef UV1
          vUv=uv;
          #endif
          `,
      };
    }

    // for other shader types we're not doing anything, return null
    return null;
  }
}
