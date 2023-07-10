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