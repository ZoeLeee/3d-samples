varying vec2 vUv;
varying vec2 vPosition;
uniform sampler2D textureSampler;

void main() {
  vec4 color = texture2D(textureSampler, vUv);
  gl_FragColor = vec4(color.x, color.y, color.z, 1.);
}