import { useEffect, useRef, useState } from "react";
import "../render-bjs/material";
import { useParams } from "react-router-dom";
import { RenderMap } from "./map";
import { FloatButton } from "antd";
import { RollbackOutlined } from "@ant-design/icons";

export function BabylonCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const par = useParams();

  useEffect(() => {
    const dispose = RenderMap[par?.id]?.render(canvasRef.current);

    return () => {
      dispose?.();
    };
  }, [par?.id]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <canvas style={{ width: "100%", height: "100%" }} ref={canvasRef} />
      <FloatButton
        onClick={() => console.log("click")}
        type="primary"
        icon={<RollbackOutlined rev />}
        href="/bjs"
      />
    </div>
  );
}
