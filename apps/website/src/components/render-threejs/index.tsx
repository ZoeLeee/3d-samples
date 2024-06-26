import { RenderRoom } from "@/engine/viewer/Render";
import { ThreeViewer } from "@/engine/viewer/ThreeViewer";
import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

export function RenderTJS() {
  const param = useParams();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const viewer = new ThreeViewer(containerRef.current!);
    new RenderRoom(viewer);
  }, [param?.id]);

  return (
    <div
      style={{ position: "relative", width: "100%", height: "100%" }}
      ref={containerRef}
    ></div>
  );
}
