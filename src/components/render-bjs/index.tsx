import "./material";
import { BabylonCanvas } from "../babylon-canvas";

export function RenderBJS() {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <BabylonCanvas />
    </div>
  );
}
