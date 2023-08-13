import imgUrl from "../../assets/threejs-preview/room.png";
import { renderCoverSnow } from "../../engine/babylonjs/render-list/snow";

export const ThreeRenderMap = {
  room: {
    render: renderCoverSnow,
    title: "室内布局",
    image: imgUrl,
  },
};
