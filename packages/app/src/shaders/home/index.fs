precision highp float;

//#define DEBUG_GEOMETRY
#define OPTIMISATIONS

#define rx(a) mat3(1.0, 0.0, 0.0, 0.0, cos(a), -sin(a), 0.0, sin(a), cos(a))
#define ry(a) mat3(cos(a), 0.0, -sin(a), 0.0, 1.0, 0.0, sin(a), 0.0, cos(a))
#define rz(a) mat3(cos(a), -sin(a), 0.0, sin(a), cos(a), 0.0, 0.0, 0.0, 1.0)

const float PI = 3.14159;
float time;

struct Box {
  vec3 origin;
  vec3 size;
};
#define MIN x
#define MAX y

uniform float iTime;
uniform sampler2D textureSampler;
uniform vec2 iResolution;
uniform vec2 iMouse;

varying vec2 vUV;
varying vec3 vPosition;

int iFrame = 1;

struct Ray {
  vec3 origin;
  vec3 dir;
};

bool box_hit(const in Box inbox, const in Ray inray) {
  vec2 tx, ty, tz;
  vec3 maxbounds = inbox.origin + vec3(inbox.size);
  vec3 minbounds = inbox.origin + vec3(-inbox.size);
  tx = ((inray.dir.x >= 0. ? vec2(minbounds.x, maxbounds.x)
                           : vec2(maxbounds.x, minbounds.x)) -
        inray.origin.x) /
       inray.dir.x;
  ty = ((inray.dir.y >= 0. ? vec2(minbounds.y, maxbounds.y)
                           : vec2(maxbounds.y, minbounds.y)) -
        inray.origin.y) /
       inray.dir.y;
  if ((tx.MIN > ty.MAX) || (ty.MIN > tx.MAX))
    return false;
  tx = vec2(max(tx.MIN, ty.MIN), min(tx.MAX, ty.MAX));
  tz = ((inray.dir.z >= 0. ? vec2(minbounds.z, maxbounds.z)
                           : vec2(maxbounds.z, minbounds.z)) -
        inray.origin.z) /
       inray.dir.z;
  if ((tx.MIN > tz.MAX) || (tz.MIN > tx.MAX))
    return false;
  tx = vec2(max(tx.MIN, tz.MIN), min(tx.MAX, tz.MAX));

  if (tx.MIN >= 0.) {
    return true;
  }

  return false;
}

vec3 rayDirection(float fieldOfView, vec2 size, vec2 fragCoord) {
  vec2 xy = fragCoord - size / 2.;
  float z = size.y / tan(radians(fieldOfView) / 2.);
  return normalize(vec3(xy, -z));
}

mat4 viewMatrix(vec3 eye, vec3 center, vec3 up) {
  vec3 f = normalize(center - eye), s = normalize(cross(f, up)),
       u = cross(s, f);
  return mat4(vec4(s, 0.), vec4(u, 0.), vec4(-f, 0.), vec4(vec3(0.), 1.));
}

Ray makeViewRay2(vec2 coord, vec2 res, float a, float h) {
  vec3 lookAt = vec3(-2.9, 2., 2.0);
  vec3 origin = vec3(-4.7, 2., 8.);
  vec3 viewDir = rayDirection(100., res, coord);
  mat4 viewToWorld = viewMatrix(origin, lookAt, vec3(0., 1., 0.));
  vec3 rd = (viewToWorld * vec4(viewDir, 1.0)).xyz;
  Ray result = Ray(origin, rd);
  return result;
}

float sdEllipsoid(vec3 p, vec3 r) {
  float k0 = length(p / r);
  float k1 = length(p / (r * r));
  return k0 * (k0 - 1.0) / k1;
}

float smin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * (1.0 / 4.0);
}

float smax(float a, float b, float k) {
  return log(exp(k * a) + exp(k * b)) / k;
}

float sdLink(vec3 p, float le, float r1, float r2) {
  vec3 q = vec3(p.x, max(abs(p.y) - le, 0.0), p.z);
  return length(vec2(length(q.xy) - r1, q.z)) - r2;
}

float sdCylinder(vec3 p, vec3 c) { return length(p.xz - c.xy) - c.z; }

float sdTorus(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

float sdCappedTorus(vec3 p, vec2 sc, float ra, float rb) {
  p.x = abs(p.x);
  float k = (sc.y * p.x > sc.x * p.y) ? dot(p.xy, sc) : length(p.xy);
  return sqrt(dot(p, p) + ra * ra - 2.0 * ra * k) - rb;
}

float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sdRoundBox(vec3 p, vec3 b, float r) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
}

float sdBoxFrame(vec3 p, vec3 b, float e) {
  p = abs(p) - b;
  vec3 q = abs(p + e) - e;
  return min(min(length(max(vec3(p.x, q.y, q.z), 0.0)) +
                     min(max(p.x, max(q.y, q.z)), 0.0),
                 length(max(vec3(q.x, p.y, q.z), 0.0)) +
                     min(max(q.x, max(p.y, q.z)), 0.0)),
             length(max(vec3(q.x, q.y, p.z), 0.0)) +
                 min(max(q.x, max(q.y, p.z)), 0.0));
}

vec2 hash(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise(in vec2 p) {
  const float K1 = 0.366025404;
  const float K2 = 0.211324865;

  vec2 i = floor(p + (p.x + p.y) * K1);
  vec2 a = p - i + (i.x + i.y) * K2;
  float m = step(a.y, a.x);
  vec2 o = vec2(m, 1.0 - m);
  vec2 b = a - o + K2;
  vec2 c = a - 1.0 + 2.0 * K2;
  vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
  vec3 n =
      h * h * h * h *
      vec3(dot(a, hash(i + 0.0)), dot(b, hash(i + o)), dot(c, hash(i + 1.0)));
  return dot(n, vec3(70.0));
}

vec2 scrollDir = vec2(0, -1);
#define rot(a) mat2(cos(a), sin(a), -sin(a), cos(a))
#define SCRL_SPEED 1.5
#define HOR_SCALE 1.1
#define FREQ 0.6
#define OCC_SPEED 1.
#define WAV_ROT 1.21
#define FREQ_SCL 1.2
#define TIME_SCL 1.095
#define DRAG 0.9
#define WEIGHT_SCL 0.8
#define HEIGHT_DIV 2.5
#define ITERS_TRACE 8
#define DX_DET 0.65

#define WAVE_DIR vec2(1, 0)
#define WAVE_HEIGHT .5

// Built with some ideas from
// https://www.shadertoy.com/view/wldBRf
// https://www.shadertoy.com/view/ssG3Wt
// https://www.shadertoy.com/view/4dBcRD
// https://www.shadertoy.com/view/Xdlczl
vec2 wavedx(vec2 wavPos, int iters, float t) {
  vec2 dx = vec2(0);
  vec2 wavDir = WAVE_DIR;
  float wavWeight = WAVE_HEIGHT;
  wavPos += t * SCRL_SPEED * scrollDir;
  wavPos *= HOR_SCALE;
  float wavFreq = FREQ;
  float wavTime = OCC_SPEED * t;
  for (int i = 0; i < iters; i++) {
    wavDir *= rot(WAV_ROT);
    float x = dot(wavDir, wavPos) * wavFreq + wavTime;
    float result = exp(sin(x) - 1.) * cos(x);
    result *= wavWeight;
    dx += result * wavDir / pow(wavWeight, DX_DET);
    wavFreq *= FREQ_SCL;
    wavTime *= TIME_SCL;
    wavPos -= wavDir * result * DRAG;
    wavWeight *= WEIGHT_SCL;
  }
  float wavSum = -(pow(WEIGHT_SCL, float(iters)) - 1.) * HEIGHT_DIV;
  return dx / pow(wavSum, 1. - DX_DET);
}

float wave(vec2 wavPos, int iters, float t) {
  wavPos.xy *= 2.;
  float wav = 0.0;
  vec2 wavDir = WAVE_DIR;
  float wavWeight = WAVE_HEIGHT;
  wavPos += t * SCRL_SPEED * scrollDir;
  wavPos *= HOR_SCALE;
  float wavFreq = FREQ;
  float wavTime = OCC_SPEED * t;
  for (int i = 0; i < iters; i++) {
    wavDir *= rot(WAV_ROT);
    float x = dot(wavDir, wavPos) * wavFreq + wavTime;
    float wave = exp(sin(x) - 1.0) * wavWeight;
    wav += wave;
    wavFreq *= FREQ_SCL;
    wavTime *= TIME_SCL;
    wavPos -= wavDir * wave * DRAG * cos(x);
    wavWeight *= WEIGHT_SCL;
  }
  float wavSum = -(pow(WEIGHT_SCL, float(iters)) - 1.) * HEIGHT_DIV;
  return wav / wavSum;
}

#define WAVE_SHAPE_SCALER (vec3(.4, 1.0, 2.0) * .75)
float water_geometry(vec3 p) {
  float boatShape = length(vec2(abs(p.x * 1.6) + 3.5, p.z + 0.5)) - 5.;
  float s =
      sin(boatShape * 12.0 - time * 7.0) * 0.05 * smoothstep(4.2, 3., p.z);

  return p.y - wave(p.xz * WAVE_SHAPE_SCALER.xz, ITERS_TRACE, time) -
         s * smoothstep(3.5, 2., boatShape) +
         1.0 * step(max(boatShape, p.z - 1.3), 2.);
}

vec3 norm(vec3 p) {
  vec3 n = vec3(0);
  for (int i = 0; i < 4; i++) {
    vec3 e = 0.01 * (vec3(9 >> i & 1, i >> 1 & 1, i & 1) * 2. - 1.);
    n += e * water_geometry(p + e);
  }
  return normalize(n);
}

float DistributionGGX(vec3 N, vec3 H, float roughness) {
  float a2 = roughness * roughness;
  float NdotH = max(dot(N, H), .0);
  float NdotH2 = NdotH * NdotH;

  float nom = a2;
  float denom = (NdotH2 * (a2 - 1.) + 1.);
  denom = PI * denom * denom;

  return nom / denom;
}

float GeometrySchlickGGX(float NdotV, float roughness) {
  float nom = NdotV;
  float denom = NdotV * (1. - roughness) + roughness;

  return nom / denom;
}

float GeometrySmith(in vec3 N, vec3 V, vec3 L, float roughness) {
  float NdotV = max(dot(N, V), .0);
  float NdotL = max(dot(N, L), .0);
  float ggx1 = GeometrySchlickGGX(NdotV, roughness);
  float ggx2 = GeometrySchlickGGX(NdotL, roughness);

  return ggx1 * ggx2;
}

vec3 fresnelSchlick(float cosTheta, vec3 F0, float roughness) {
  return F0 + (max(F0, vec3(1. - roughness)) - F0) * pow(1. - cosTheta, 5.);
}

#define MAT_ID int
struct Hit {
  float dst;
  MAT_ID matID;
};

struct Mat {
  vec3 albedo;
  float metallic;
  float roughness;
};

Hit hitMin(Hit one, Hit two) {
  if (one.dst <= two.dst)
    return one;
  else
    return two;
}

#define FOG_CLR (vec3(55., 91., 117.) / 255.)

#define ZERO min(0, iFrame)
#define DIST_MIN .01
#define DIST_MAX MAX_FLOAT
#define STEP_MAX 128

#define MAX_FLOAT 1e10
#define MIN_FLOAT 1e-10

mat4 boatRot, engineRot;

const Hit NO_HIT = Hit(MAX_FLOAT, -1);
const MAT_ID MAT_ENGINE_COVER = 0;
const MAT_ID MAT_ENGINE_HANDLE = 1;
const MAT_ID MAT_ENGINE_ACTUATOR = 2;
const MAT_ID MAT_ANCHOR = 3;
const MAT_ID MAT_ROPE = 4;
const MAT_ID MAT_MAIN_BOAT_BODY = 5;
const MAT_ID MAT_BOAT_BODY_RIM = 6;
const MAT_ID MAT_BENCH = 7;
const MAT_ID MAT_METAL_DARK = 8;
const MAT_ID MAT_ENGINE_RIM = 9;

Hit engine(vec3 pos) {
  Hit engine = NO_HIT;
  {
    vec3 engPos = (pos - vec3(0.0, 1.0, 0.0)) * 0.5;
    engPos.xz = abs(engPos.xz);
    engPos.xz += smoothstep(0., 0.2, abs(engPos.y + 0.025)) * 0.05;
    engPos.y -= pos.z * 0.05 * step(0.0, pos.y - 1.0);
    engPos.x -= pos.z * 0.05;
    engine = Hit(sdBox(engPos, vec3(0.1, 0.1, 0.2)), MAT_ENGINE_COVER);

    engine.dst = min(engine.dst, sdRoundBox(engPos + vec3(0.0, 0.025, 0.0),
                                            vec3(0.11, 0.01, 0.21), 0.0001));
    if (distance(pos.y, .95) < 0.04) {
      engine.matID = MAT_ENGINE_RIM;
    }

    {
      float size = .035 + 0.05 * pos.z;
      float handle =
          sdRoundBox(pos + vec3(0.13, -0.75, 0.2), vec3(size, size, .25), 0.04);
      engine.dst = smin(engine.dst, handle, 0.05);

      handle = sdCylinder(pos.xzy, vec3(-0.13, 0.76, 0.02));
      handle = max(handle, abs(pos.z + 0.5) - 0.4);
      engine = hitMin(engine, Hit(handle, MAT_ENGINE_HANDLE));
    }
  }

  Hit actuator = NO_HIT;
  {
    vec3 newPos = vec3(abs(pos.x) + smoothstep(0.15, 0.3, pos.z) * 0.05, pos.y,
                       pos.z - 0.2);
    float act = sdBox(
        newPos - vec3(0.0, 0.2, 0.0),
        vec3(0.05 + smoothstep(0.1, 0.0, distance(pos.y, -0.3)) * 0.05, .6,
             0.1 - smoothstep(-0.05, -0.2, pos.y) * 0.1 *
                       step(0.0, pos.z - 0.2)));

    act = smin(act,
               sdRoundBox(pos - vec3(0.0, 0.0, 0.3),
                          vec3(.1 - pos.z * 0.1, .05 - pos.z * 0.1, 0.2), 0.01),
               0.1);
    act = min(act,
              sdEllipsoid(pos - vec3(0.0, -0.3, .225), vec3(0.05, 0.05, .125)));

    float prop = sdCylinder(pos.xzy, vec3(0.1, -0.25, 0.075));
    prop = min(prop, sdCylinder(pos.xzy, vec3(-0.1, -0.35, 0.075)));
    prop = max(prop, distance(pos.z + 0.325, 0.6));
    actuator = Hit(smin(act, prop, 0.025), MAT_ENGINE_ACTUATOR);
  }

  return hitMin(engine, actuator);
}

Hit boat(vec3 pos) {
  if (pos.y < 0.)
    return NO_HIT;

  Hit anchor = NO_HIT;

#ifdef OPTIMISATIONS
  if (all(lessThan(abs(pos.xz - vec2(2.75, 3.75)), vec2(1., 0.5))))
#endif
  {
    anchor =
        Hit(max(sdCylinder(pos, vec3(3.5, 3.5,
                                     0.2 - noise(pos.zy * 5.0) * 0.005 -
                                         noise(pos.zy * vec2(10., 1.)) * 0.02)),
                pos.y - 2.0),
            MAT_ANCHOR);

    vec3 ropePos = pos;
    ropePos.y = fract(ropePos.y * 10.) * 0.025;
    float rope = max(sdTorus(ropePos - vec3(3.5, 0.05, 3.5), vec2(.25, 0.035)),
                     distance(pos.y, .95) - .125);

    ropePos = pos;
    ropePos.y +=
        smoothstep(2., 0., distance(pos.x, 2.75 + sin(iTime * 3.0) * 0.25)) *
        (0.4 + noise(vec2(iTime * 0.25, 1.17)) * 0.2);
    rope = min(rope, max(sdCylinder(ropePos.yxz, vec3(1.1, 3.25, 0.025)),
                         distance(pos.x, 2.7) - .7));

    anchor = hitMin(anchor, Hit(rope, MAT_ROPE));
  }

#ifndef DEBUG_GEOMETRY
  // TODO can we move this out of raymarching loop????
  // need to return normal from raymarch func
  pos = (boatRot * vec4(pos, 1.)).xyz;
#endif

  pos *= .5;
  pos.y -= .7;
  pos.x *= 1.2;

  vec3 noseUp = pos;
  noseUp.y += smoothstep(0.6, 0.4, abs(pos.x)) * 0.1 // body back cut
              * step(0., pos.y + 0.2) * step(0., pos.z);
  noseUp.y -= smoothstep(0., -7., noseUp.z) * 0.5;

  float outer = MAX_FLOAT;
  float inner = MAX_FLOAT;
  Hit boat_body = NO_HIT;
  {
    float thickness = 0.05 + step(abs(noseUp.y - 0.1), 0.02) * 0.05;
    const float BACK = 2.;
    vec3 mirrorX = vec3(abs(pos.x) + 3.5, pos.y, pos.z);
    mirrorX.y -= 1.0;

    float rad = 5.0;
    float bumps =
        smoothstep(0.025, 0.005, distance(distance(mirrorX.y, -1.3), 0.075)) *
        0.02;

    outer = length(mirrorX) - rad - bumps - thickness;
    inner = length(mirrorX) - rad + thickness;
    float main_body = max(-inner, outer);

    main_body =
        min(main_body, max(outer, max(-(pos.z - BACK + thickness),
                                      (pos.z - bumps - BACK - thickness))));
    main_body = max(main_body, pos.z - bumps - BACK - thickness);

    main_body = max(main_body, noseUp.y - 0.1);
    main_body = max(main_body, noseUp.z - 2.07);

    float b = max(max(outer, abs(pos.y + .4) - 0.05), pos.z - 2.);
    main_body = min(main_body, b);
    main_body = max(main_body, -pos.y - 0.45);

    boat_body = Hit(main_body, MAT_MAIN_BOAT_BODY);
    boat_body.matID += int(step(distance(noseUp.y, 0.1), 0.05));

    boat_body = hitMin(
        boat_body,
        Hit(max(max(outer, abs(pos.y - 0.09) - 0.01), pos.z + 2.), MAT_BENCH));
  }

#ifdef OPTIMISATIONS
  if (all(lessThan(abs(pos - vec3(0., .5, 0.)), vec3(1.6, .5, 4.))))
#endif
  {
    boat_body = hitMin(
        boat_body, Hit(max(max(outer, abs(pos.y - 0.35) - 0.05), pos.z + 3.1),
                       MAT_BOAT_BODY_RIM));

    float link = sdLink(pos.yxz + vec3(-.41, 0., 3.3), .1, 0.075, 0.015);

    float cyl = max(
        sdCylinder(pos.zxy + vec3(0., 0., -0.125), vec3(1.0, 0.075, 0.075)),
        -sdCylinder(pos.zxy + vec3(0., 0., -0.175), vec3(1.0, 0.05, 0.075)));
    cyl = max(cyl, abs(abs(pos.x) - 1.25) - 0.02);

    boat_body = hitMin(boat_body, Hit(min(link, cyl), MAT_METAL_DARK));
  }

#ifdef OPTIMISATIONS
  if (all(lessThan(abs(pos - vec3(0., -0.1, 0.)), vec3(1.6, .125, 4.))))
#endif
  {
    float tor = sdTorus(pos.yzx + vec3(0.025, -1.7, 1.19), vec2(.035, .0025));
    tor =
        min(tor, sdTorus(pos.yzx + vec3(0.025, 0., 1.496), vec2(.035, .0025)));
    tor = min(tor,
              sdTorus(pos.zxy + vec3(-2.075, .86, 0.035), vec2(.025, .0025)));
    tor = min(tor,
              sdTorus(pos.zxy + vec3(-2.075, -.86, 0.035), vec2(.025, .0025)));

    boat_body = hitMin(boat_body, Hit(tor, MAT_METAL_DARK));

    vec3 ropeCoords = vec3(abs(pos.x) + 3.5, pos.y + 0.04, pos.z);
    ropeCoords.y += (1.0 - pow(distance(ropeCoords.z, 0.85) / .85, 2.)) * 0.12 *
                    step(distance(ropeCoords.z, .85), .85);

    ropeCoords.y += (1.0 - pow(distance(ropeCoords.z, -1.8) / 1.8, 2.)) * 0.06 *
                    step(distance(ropeCoords.z, -1.8), 1.8);
    float rope = sdTorus(ropeCoords, vec2(5., .0025));
    rope = max(rope, ropeCoords.z - 2.07);

    float c = sdCylinder(pos.zxy, vec3(2.07, -0.04, 0.0025));
    c = max(c, distance(abs(pos.x), .95) - .09);
    rope = smin(rope, c, 0.01);

    boat_body = hitMin(boat_body, Hit(rope, MAT_ROPE));
  }

  {
    vec3 mirBenchCoord = vec3(pos.x, pos.y + 0.2, abs(pos.z) - 1.);
    float bench = sdBox(mirBenchCoord, vec3(2.0, 0.025, .25));
    mirBenchCoord.x = abs(mirBenchCoord.x) - 1.6;
    bench = min(bench, sdBox(mirBenchCoord, vec3(.5, 0.1, .3)));
    bench = max(bench, outer);
    boat_body = hitMin(boat_body, Hit(bench, MAT_BENCH));
  }

#ifdef OPTIMISATIONS
  if (all(lessThan(abs(pos.xz - vec2(0., 2.)), vec2(.5, .6))))
#endif
  {
    float falloff = smoothstep(0.25, 0., pos.y);
    float engine_stand =
        sdBoxFrame(pos + vec3(0.0, -0.0, -2.),
                   vec3(0.3 * falloff, 0.15, 0.125 * falloff), 0.02);
    engine_stand =
        max(engine_stand, -sdBox(pos + vec3(0.0, 0.3, -2.), vec3(0.26)));
    engine_stand = smin(
        engine_stand,
        max(sdCylinder(pos.zxy, vec3(2.05, 0.17, 0.035)), abs(pos.x) - 0.1),
        0.025);
    boat_body = hitMin(boat_body, Hit(engine_stand, MAT_METAL_DARK));

    pos = (engineRot * vec4(pos, 1.)).xyz;
    boat_body = hitMin(boat_body, engine(pos * 1.5 - vec3(-1., -1.85, 2.6)));
  }
  return hitMin(boat_body, anchor);
}

vec3 calcNormal(vec3 p) {
  vec3 n = vec3(0);
  for (int i = min(0, iFrame); i < 4; i++) {
    vec3 e = DIST_MIN * (vec3(9 >> i & 1, i >> 1 & 1, i & 1) * 2. - 1.);
    n += e * boat(p + e).dst;
  }
  return normalize(n);
}

Hit march(vec3 ro, vec3 rd) {
  float t = DIST_MIN, d;
  for (int i = ZERO; i < STEP_MAX; i++) {
    Hit localHit = boat(ro + rd * t);
    t += d = localHit.dst;
    if (d < DIST_MIN)
      return Hit(t, localHit.matID);
    if (t > DIST_MAX)
      return NO_HIT;
  }
  return NO_HIT;
}

vec4 marchWater(in Ray r) {
  // TODO need to do a raymarch between 2 planes
  // TODO lower the raymarch iterations
  float t = MIN_FLOAT;
  for (int i = ZERO; i <= 32; i++) {
    vec3 p = r.origin + r.dir * t;
    float dst = water_geometry(p);
    if (dst < .05)
      break;
    t += dst;
  }
  vec3 normal = norm((r.origin + r.dir * t));
  return vec4(t, normal);
}

Mat getMaterial(MAT_ID matID, vec3 pos) {
  switch (matID) {
  case MAT_ENGINE_COVER:
    return Mat(vec3(0.196, 0.235, 0.306), .5, .35);
  case MAT_ENGINE_RIM:
    return Mat(vec3(0.204, 0.035, 0.035), 0.8, 0.25);
  case MAT_ENGINE_HANDLE:
    return Mat(vec3(0.1), 1., 1.);
  case MAT_ANCHOR:
    return Mat(vec3(100., 70., 30.) / 255., .8, .3);
  case MAT_ROPE:
    return Mat(vec3(0.180, 0.165, 0.063), 0., 1.);
  case MAT_MAIN_BOAT_BODY: {
    float noise = noise(pos.zy * 0.75);
    return Mat(vec3(0.3, 0.5, 1.0) * (0.75 + 0.25 * noise), 0.6, 0.5);
  }
  case MAT_BOAT_BODY_RIM:
    return Mat(vec3(0.196, 0.149, 0.004), 0.25, .5);
  case MAT_BENCH:
    return Mat(vec3(0.141, 0.059, 0.000), 0.6, 1.);
  case MAT_ENGINE_ACTUATOR:
  case MAT_METAL_DARK:
    return Mat(vec3(0.1), 1., .5);
  default:
    return Mat(vec3(0.831, 0.000, 1.000), 0.8, 0.25);
  }
}

vec3 makeColor(vec3 pos, vec3 normal, vec3 viewDir, MAT_ID matID) {
  Mat material = getMaterial(matID, pos);

  vec3 N = normalize(normal);
  vec3 V = normalize(-viewDir);

  vec3 F0 = vec3(0.04);
  F0 = mix(F0, material.albedo, material.metallic);

  vec3 L = normalize(vec3(-1.0, 1.0, -.5));
  vec3 H = normalize(V + L);
  float attenuation = 8.;
  vec3 radiance = vec3(.8) * attenuation;

  float aDirect = .125 * pow(material.roughness + 1., 2.);
  float aIBL = .5 * material.roughness * material.roughness;
  float NDF = DistributionGGX(N, H, material.roughness);
  float G = GeometrySmith(N, V, L, material.roughness);
  vec3 F = fresnelSchlick(max(dot(H, V), 0.0), F0, material.roughness);

  vec3 kS = F;
  vec3 kD = vec3(1.) - kS;
  kD *= 1. - material.metallic;

  vec3 nominator = NDF * G * F;
  float denominator = 4. * max(dot(N, V), 0.0) * max(dot(N, L), 0.0);
  vec3 specular = nominator / max(denominator, .001);

  float NdotL = max(dot(N, L), 0.0);
  return (kD * material.albedo / PI + specular) * radiance * NdotL;
}

float shadow(in vec3 ro, in vec3 rd) {
  float result = 1.;
  float t = .1;
  for (int i = 0; i < 16; i++) {
    float h = boat(ro + t * rd).dst;
    if (h < 0.00001)
      return .0;
    result = min(result, 8. * h / t);
    t += h;
  }

  return result;
}

const int pressLength = 5;
const int[] pressLetters = int[](80, 82, 69, 83, 83);
const int anyLength = 3;
const int[] anyLetters = int[](65, 78, 89);
const int buttonLength = 6;
const int[] buttonLetters = int[](66, 85, 84, 84, 79, 78);

void main() {

  time = iTime;

  // 获取片元在屏幕上的位置
  vec2 screenCoord = gl_FragCoord.xy;
  // 屏幕分辨率
  vec2 resolution = vec2(1920.0, 1080.0); // 替换成实际的屏幕分辨率
  // 获取片元在纹理坐标空间的位置
  vec2 texCoord = vUV.xy;
  // 模拟 gl_FragCoord
  vec2 fragCoord = texCoord * resolution;

  Ray r = makeViewRay2(fragCoord, iResolution.xy, iMouse.x / iResolution.x * 5.,
                       -10. + iMouse.y / iResolution.y * 40.);
  vec3 color = vec3(0.4);

#ifndef DEBUG_GEOMETRY
  float dstToSurf = (-r.origin.y + 1.0) / r.dir.y;
  if (dstToSurf >= 0.0) {
    vec4 t = marchWater(Ray(r.origin + r.dir * dstToSurf, r.dir));
    if (t.x < MAX_FLOAT) {
      Ray reflectedRay = Ray(r.origin + r.dir * (dstToSurf + t.x),
                             normalize(reflect(r.dir, t.yzw)));
      color = vec3(dot(reflectedRay.dir, normalize(vec3(0.0, -1., -1.0)))) *
              FOG_CLR;
      dstToSurf += t.x;
    }
  } else {
    dstToSurf = MAX_FLOAT;
  }
#endif

  Box box = Box(vec3(0.0, 1.6, -0.75), vec3(2.25, 1.5, 6.2));
  Hit geometry = NO_HIT;
  if (box_hit(box, r)) {
    vec3 rots =
        vec3(-0.05 + sin(iTime * 2.0) * 0.05, 0.0, cos(iTime * 1.0) * 0.05);
    boatRot = inverse(mat4(rx(rots.x) * ry(rots.y) * rz(rots.z)));
    engineRot = inverse(mat4(rx(.5) * ry(.35)));

    geometry = march(r.origin, r.dir);
  }

#ifndef DEBUG_GEOMETRY
  if (geometry.dst < dstToSurf) {
    vec3 hitPos = r.origin + r.dir * geometry.dst;
    vec3 nrm = calcNormal(hitPos);
    color = makeColor(hitPos, nrm, r.dir, geometry.matID);
    color *= shadow(hitPos, normalize(vec3(-1.0, 1.0, 0.0)));
  }
#else
  if (geometry.dst < MAX_FLOAT) {
    vec3 nrm = calcNormal(r.origin + r.dir * geometry.dst);
    color = nrm;
  }
#endif

#ifndef DEBUG_GEOMETRY
  {
    float dst = min(geometry.dst, dstToSurf);
    const float fogDensity = 0.06;
    float exponentialFogFactor = 1. - exp(-fogDensity * dst);
    float fogFactor = exponentialFogFactor;

    color = mix(color, FOG_CLR, fogFactor);
  }

  {

    float Falloff = 0.45;
    float rf = length(vUV) * Falloff;
    float rf2_1 = rf * rf + 1.;
    float e = 1. / (rf2_1 * rf2_1);

    color *= e;
  }
#endif

  {
    vec2 fragCoord = vPosition.xy;
    fragCoord.x += .2;
    vec4 clr = vec4(0.0);

    color += clr.rgb;
  }

  gl_FragColor = vec4(color, 1);
}