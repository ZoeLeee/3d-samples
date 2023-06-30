import { useEffect, useRef } from 'react';
import './App.css';
import { BabylonCanvas } from './components/babylon-canvas';
import { initThreejs } from './engine/initThree';

function App() {
  const canvas2Ref = useRef<HTMLCanvasElement>(null);


  useEffect(() => {
    if (canvas2Ref.current!)
      initThreejs(canvas2Ref.current!);
  }, []);

  return (
    <div className='canvas-container'>
      {/* <canvas ref={canvas2Ref} /> */}
      <BabylonCanvas />
    </div>
  );
}

export default App;
