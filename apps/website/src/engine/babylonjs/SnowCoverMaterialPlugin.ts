
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";


// import imgUrl from '../../assets/southeast.jpg'
import { MaterialPluginBase } from "@babylonjs/core/Materials/materialPluginBase";
import { Texture, UniformBuffer } from "@babylonjs/core/Materials";


export class SnowCoverMaterialPlugin extends MaterialPluginBase {
  public snowAmount = 0.5;
  public smoothFactor = 0.5
  private texture: Texture;
  private norTexture: Texture;
  private _isEnabled = false;

  constructor(material) {
    // last parameter is a priority, which lets you define the order multiple plugins are run.
    super(material, "SnowCover", 200, { SNOWCOVER: false });
    this.texture = new Texture("/textures/snow/Snow_003_COLOR.jpg", material.getScene())
    this.norTexture = new Texture("/textures/snow/Snow_003_NORM.jpg", material.getScene())
  }

  get isEnabled() {
    return this._isEnabled;
  }

  set isEnabled(enabled) {
    if (this._isEnabled === enabled) {
      return;
    }
    this._isEnabled = enabled;
    this.markAllDefinesAsDirty();
    this._enable(this._isEnabled);
  }



  prepareDefines(defines, scene, mesh) {
    defines["SNOWCOVER"] = this._isEnabled;
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
        { name: "smoothFactor", size: 1, type: "float" },
        { name: "snowColor", size: 3, type: "vec3" },
        { name: "snowDirection", size: 3, type: "vec3" },
        // { name: "snowTexture", size: 3, type: "vec3" },
        // { name: "snowNorTexture", size: 3, type: "vec3" },
      ],
      // now, on the fragment shader, add the uniform itself in case uniform buffers are not supported by the engine
      fragment: `#ifdef SNOWCOVER
                        uniform float smoothFactor; 
                        uniform float snowAmount; 
                        uniform vec3 snowDirection;
                        uniform vec3 snowColor;
                  #endif`,
    };
  }
  getSamplers(samplers) {
    samplers.push("snowTexture");
  }
  bindForSubMesh(uniformBuffer: UniformBuffer, scene, engine, subMesh) {
    if (this._isEnabled) {
      uniformBuffer.updateFloat("snowAmount", this.snowAmount);
      uniformBuffer.updateColor3("snowColor", Color3.White());
      uniformBuffer.updateVector3("snowDirection", new Vector3(0, 1));
      uniformBuffer.setTexture("snowTexture", this.texture);
      uniformBuffer.setTexture("snowNorTexture", this.norTexture);
    }
  }

  getCustomCode(shaderType) {
    if (shaderType === "fragment") {
      // we're adding this specific code at the end of the main() function
      return {
        CUSTOM_FRAGMENT_DEFINITIONS: `
        varying vec3 vNormal;
        varying vec2 vUv;
        uniform sampler2D snowTexture;
        uniform sampler2D snowNorTexture;
        `,
        CUSTOM_FRAGMENT_BEFORE_LIGHTS: `
        #ifdef SNOWCOVER
          vec4 norSnowC=texture2D(snowNorTexture,vUv);
          // normalW =normalW * (norSnowC.rgb*0.5+0.5);
        #endif
        `,
        CUSTOM_FRAGMENT_MAIN_END: `
            #ifdef SNOWCOVER
        
            vec4 snowC=texture2D(snowTexture,vUv);


            float an=dot(vNormal, snowDirection);

            // 计算覆盖判断
            float cover = an - (1.0 - snowAmount);

             // 使用平滑因子对积雪边缘进行平滑
            float n = smoothstep(0.0,smoothFactor, cover);
          
            // if (cover > 0.0) {
            //    vec3 color = mix(vec3(1.0, 1.0, 1.0), snowC.rgb, n);
            //   // vec3 color=mix(vec3(1.0,1.0,1.0),vec3(0.0,0.0,0.0),cover);
            //   // gl_FragColor = vec4(snowC.rgb,clamp(an,0.0,1.0)); 
            //    gl_FragColor = snowC;
            // }

            gl_FragColor = mix(color,snowC,clamp(cover+.4,0.0,1.0));

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