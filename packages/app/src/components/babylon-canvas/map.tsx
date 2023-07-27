import { renderRadarEffect } from "../../engine/babylonjs/render-list/radar";
import { renderScanEffect } from "../../engine/babylonjs/render-list/scan";
import { renderCoverSnow } from "../../engine/babylonjs/render-list/snow";
import imgUrl from "../../assets/southeast.jpg";
import radarimgUrl from "../../assets/radar.png";

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
    iamge: radarimgUrl,
  },
};
