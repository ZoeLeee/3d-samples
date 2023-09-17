import { useEffect, useRef, useState } from "react";
import "../render-bjs/material";
import { useParams } from "react-router-dom";
import { RenderMap } from "./map";
import { FloatButton } from "antd";
import { RollbackOutlined } from "@ant-design/icons";
import { NodeTree } from "../node-list";
import { useStores } from "@/stores";

export function BabylonCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const par = useParams();
  const [nodes, scene] = useStores((state) => [state.nodes, state.scene]);

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
    <div className="w-full h-full relative flex">
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
      {nodes && (
        <div
          style={{
            position: "absolute",
            left: 10,
            top: 10,
            height: "80%",
            overflow: "auto",
          }}
        >
          <NodeTree nodes={nodes} scene={scene} />
        </div>
      )}
    </div>
  );
}
