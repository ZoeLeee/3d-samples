import { Effect } from "@babylonjs/core";

Effect.ShadersStore["RadarVertexShader"] = `
precision highp float;
attribute vec3 position;
attribute vec2 uv;
uniform mat4 worldViewProjection;
varying vec2 vUv;
uniform float time;

void main() {
    vec4 p = vec4(position, 1.);
    gl_Position = worldViewProjection * p;
    vUv = uv;
}
`;


Effect.ShadersStore["RadarFragmentShader"] = `
#define PI 3.14159265359

varying vec2 vUv;
uniform vec3 uColor;
uniform float uTime;

mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
                sin(_angle),cos(_angle));
}

void main() {

    vec2 newUv=rotate2d(uTime*PI*2.0)*(vUv-0.5);

    newUv=newUv+0.5;

    
    float alpha=1.0-step(0.5,distance(newUv,vec2(0.5)));
    float angle=atan(newUv.y-0.5,newUv.x-0.5);

    float strength=(angle+PI)/(PI*2.0);

    gl_FragColor = vec4(uColor,alpha*strength);
}
`;

Effect.ShadersStore["SnowVertexShader"] = `
precision highp float;
uniform float snowDepth;
attribute vec3 position;
attribute vec3 normal;
uniform mat4 worldViewProjection;
uniform vec3 snowDirection;
varying vec3 vNormal;

void main() {

  // 顶点沿法线和雪方向偏移
  vec3 offset = normalize(normal + snowDirection) * snowDepth;  
  vec3 pos = position ;
  vNormal=normal;

  gl_Position = worldViewProjection * vec4(pos, 1.0);

}
`;


Effect.ShadersStore["SnowFragmentShader"] = `
uniform float snowAmount; 
uniform vec3 snowDirection;
uniform vec3 snowColor;
varying vec3 vNormal;

void main() {

  // 计算覆盖判断
  float cover = dot(vNormal, snowDirection) - (1.0 - snowAmount);

  if (cover > 0.0) {
    gl_FragColor = vec4(snowColor,1.0); 
  }
  else {
    gl_FragColor = vec4(1.0,0.0,0.,1.0);
  }
}
`;