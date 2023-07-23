import { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import { initThreejs } from "../engine/initThree";
import { initBabylon } from "../engine/init";
import { renderHome } from "../engine/babylonjs/home";

export default function Root() {
  const canvas2Ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let dispose;
    if (canvas2Ref.current!) {
      dispose = renderHome(canvas2Ref.current!);
    }
    return () => {
      dispose?.();
    };
  }, []);

  return (
    <div id="detail">
      <canvas style={{ width: "100%", height: "100%" }} ref={canvas2Ref} />
    </div>
  );
}
