import { useEffect, useRef, useState } from "react";
import { initBabylon } from "../../engine/init";
import "./material";

export function BabylonCanvas() {
    const [index, setIndex] = useState(2);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const callback = () => {
            engine.resize();
        };
        const engine = initBabylon(canvasRef.current, index);
        window.addEventListener("resize", callback);

        return () => {
            engine.dispose();
            window.removeEventListener("resize", callback);
        };
    }, [index]);

    return <div style={{ position: "relative" }}>
        <div style={{
            position: "absolute",
            left: 10,
            top: 10,
        }}>
            <button onClick={() => setIndex(0)}>效果0</button>
            <button onClick={() => setIndex(1)}>效果1</button>
            <button onClick={() => setIndex(2)}>效果2</button>
            <button onClick={() => setIndex(3)}>效果3</button>
        </div>
        <canvas style={{ width: "100%", height: "100%" }} ref={canvasRef} />
        <button onClick={() => window["debug"]()} style={{ position: "fixed", right: 10, top: 10 }}>调试</button>
    </div>;
}