import { useEffect, useRef, useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { initBabylon } from './engine/init';
import { initThreejs } from './engine/initThree';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvas2Ref = useRef<HTMLCanvasElement>(null);


  useEffect(() => {
    //初始化Babylonjs
    initBabylon(canvasRef.current!);
    if (canvas2Ref.current!)
      initThreejs(canvas2Ref.current!);
  }, []);

  return (
    <div className='canvas-container'>
      <canvas ref={canvasRef} />
      <canvas ref={canvas2Ref} />
    </div>
  );
}

export default App;
