import {
  Effect,
  Matrix,
  PostProcess,
  PostProcessRenderEffect,
  ShaderMaterial,
  Texture,
} from "@babylonjs/core";

Effect.ShadersStore["customSnowFragmentShader"] = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float; 
#endif

varying vec2 vUV;
uniform sampler2D textureSampler;
uniform sampler2D depthSampler;
uniform sampler2D positionSampler;

uniform sampler2D snowTexture;
uniform float snowAmount;
uniform mat4 projection;

uniform mat4 iprojection;
uniform mat4 iview;
uniform float maxZ;

vec3 ssToWorldPos() {
    float depthColor = texture2D(depthSampler, vUV).r;
    vec4 ndc = vec4((vUV.x - 0.5) * 2.0, (vUV.y - 0.5) * 2.0, -projection[2].z + projection[3].z / (depthColor * maxZ), 1.0);

    vec4 worldSpaceCoord = iview * iprojection * ndc;

    worldSpaceCoord /= worldSpaceCoord.w;

    return worldSpaceCoord.xyz;//vectorToPixel;
}




void main() {

    vec4 baseColor = texture2D(textureSampler, vUV);

    vec3 worldPosition = ssToWorldPos();

    vec3 U = dFdx(texture2D(positionSampler, vUV).rgb);
    vec3 V = dFdy(texture2D(positionSampler, vUV).rgb);
    vec3 vNormalW = normalize(cross(U,V));



  // 获取雪花颜色
  vec4 snowColor = texture2D(snowTexture, vUV);

  // 根据高度控制混合因子
  float heightMix = smoothstep(0.0, 50.0, worldPosition.y);

  // 根据法线方向控制混合因子 
  float normalMix = pow(max(0.0, dot(vec3(0.0, 1.0, 0.0), vNormalW)), 2.0);

  // 结合两种混合因子
  float mixFactor = heightMix * normalMix;

  // 和雪量 uniforms 结合 
  mixFactor *= snowAmount;

  // 混合雪花
  vec4 color = mix(baseColor, snowColor, mixFactor);
  
  gl_FragColor = color;
}
`;

let snowAmount = 0;

export function showSnow(scene, camera) {
  // 创建纹理
  const snowTexture = new Texture(
    "https://hcwl-cdn.cdn.bcebos.com/hc3d/textures/yun1.png?v=1&v=1",
    scene
  );

  //"My custom post process", "custom", ["screenSize", "threshold"], null, 0.25, camera
  // 积雪后处理效果
  const snowPostProcess = new PostProcess(
    "Snow",
    "customSnow",
    [
      "snowTexture",
      "snowAmount",
      "world",
      "iprojection",
      "projection",
      "iview",
    ],
    ["depthSampler",'positionSampler'],
    0.25,
    camera
  );

  // 后处理组
  //   const snowPostEffect = new PostProcessRenderEffect(scene.getEngine());
  //   snowPostEffect.addEffect(snowPostProcess);

  snowPostProcess.onApply = function (effect) {
    snowAmount += 0.01;
    effect.setTexture("screenSize", snowTexture);
    effect.setFloat("snowAmount", snowAmount);
    effect.setMatrix("world", camera.getWorldMatrix());
    const iprojection = new Matrix();
    camera.getProjectionMatrix(true).invertToRef(iprojection);
    const iview = new Matrix();
    camera.getViewMatrix().invertToRef(iview);
    effect.setMatrix("iprojection", iprojection);
    effect.setMatrix("iview", iview);
    effect.setMatrix("projection", camera.getProjectionMatrix(true));
    effect.setFloat("maxZ", camera.maxZ);
  };
}
