import { renderRadarEffect } from "../../engine/babylonjs/render-list/radar";
import { renderScanEffect } from "../../engine/babylonjs/render-list/scan";
import { renderCoverSnow } from "../../engine/babylonjs/render-list/snow";
import imgUrl from "../../assets/southeast.jpg";
import radarimgUrl from "../../assets/radar.png";
import { renderMeshOptimize } from "../../engine/babylonjs/render-list/mesh-optimize";
import { renderClip2ParticleEffect } from "../../engine/babylonjs/render-list/clip-particles";

import prev2 from "../../assets/preview2.png";

export const RenderMap = {
  coverSnow: {
    render: renderCoverSnow,
    title: "积雪效果",
    image: imgUrl,
  },
  scan: {
    render: renderScanEffect,
    title: "扫描效果",
    image: "https://hcwl-cdn.cdn.bcebos.com/hc3d/static/images/scan_map.png",
  },
  radar: {
    render: renderRadarEffect,
    title: "雷达光柱扩散效果",
    image: radarimgUrl,
  },
  clip2Particle:{
    render: renderClip2ParticleEffect,
    title: "裁剪转粒子",
    image: prev2,
  },
  meshOptimize: {
    render: renderMeshOptimize,
    title: "gltf压缩",
  },
};
