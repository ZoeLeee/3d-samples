import { useEffect, useRef } from "react";
import { initBabylon } from "../../engine/init";
import "./material"

export function BabylonCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasRef2 = useRef<HTMLCanvasElement>(null);
    const canvasRef3 = useRef<HTMLCanvasElement>(null);
    const canvasRef4 = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        //初始化Babylonjs
        initBabylon(canvasRef.current!,0);
        initBabylon(canvasRef2.current!,1);
    }, []);

    return <div style={{position:"relative"}}>
        <canvas style={{width:"50%",height:"100%"}} ref={canvasRef} />
        <canvas style={{width:"50%",height:"100%"}} ref={canvasRef2} />
        {/* <canvas style={{width:"50%",height:"50%"}} ref={canvasRef3} />
        <canvas style={{width:"50%",height:"50%"}} ref={canvasRef4} /> */}
    </div>;
}