import { Effect } from "@babylonjs/core";

Effect.ShadersStore["scan1VertexShader"] = `
precision highp float;
attribute vec3 position;
attribute vec2 uv;
uniform mat4 worldViewProjection;
varying vec2 vUv;
varying vec2 mapUv;

void main() {
    vec4 p = vec4(position, 1.);
    gl_Position = worldViewProjection * p;
    vUv = uv;
    mapUv = vUv*vec2(6.0);
}
`;

Effect.ShadersStore["scan1FragmentShader"] = `
varying vec2 vUv;
varying vec2 mapUv;
uniform sampler2D map;
uniform sampler2D maskMap;
uniform float time;
uniform float opacity;
uniform float alpha;
uniform vec3 color;
uniform vec3 flowColor;
uniform float glowFactor;
uniform float speed;

void main() {
    float t = mod(time/5.*speed, 1.);
    vec2 uv = abs((vUv-vec2(0.5))*2.0);
    float dis = length(uv);
    float r = t-dis;
    vec4 col = texture2D( map, mapUv );
    vec3 finalCol;
    vec4 mask = texture2D(maskMap, vec2(0.5, r));
    finalCol = mix(color, flowColor, clamp(0., 1., mask.a*glowFactor));
    gl_FragColor = vec4(finalCol.rgb, (alpha+mask.a*glowFactor)*col.a*(1.-dis)*opacity);
}
`;
