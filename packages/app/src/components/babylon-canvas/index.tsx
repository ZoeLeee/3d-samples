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
    const clears = [];
    clears.push(RenderMap[par?.id]?.render(canvasRef.current));

    return () => {
      clears.forEach((c) => c());
    };
  }, [par?.id]);

  const renderContent = () => {
    return <canvas style={{ width: "100%", height: "100%" }} ref={canvasRef} />;
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
      }}
    >
      {renderContent()}
      <FloatButton
        onClick={() => console.log("click")}
        type="primary"
        icon={<RollbackOutlined />}
        href="/bjs"
      />
      <input
        id="myInput"
        type="file"
        style={{ visibility: "hidden", position: "fixed" }}
      />
    </div>
  );
}
