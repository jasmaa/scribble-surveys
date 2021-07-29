import { useEffect, useRef } from 'react';
import CanvasDraw from 'react-canvas-draw';
import demoItems from './demoItems.json';

let currItemIdx = 0;

export default function Demo({ timeDelta }) {

  const canvasRef = useRef(null);

  useEffect(() => {
    startDemo(currItemIdx);
  }, []);

  const startDemo = itemIdx => {
    const item = demoItems[itemIdx];
    let totalTime = 0;

    // Type out name
    for (let i = 0; i < item['class'].length; i++) {
      setTimeout(() => {
        const el = document.getElementById('demo-name');
        el.innerHTML = item['class'].substring(0, i + 1);
      }, totalTime);
      totalTime += timeDelta;
    }

    // Draw
    totalTime += 10 * timeDelta;
    setTimeout(() => canvasRef.current.loadSaveData(item['entry']), totalTime)

    // Call next demo
    totalTime += 50 * timeDelta;
    currItemIdx = (currItemIdx + 1) % demoItems.length;
    setTimeout(() => {
      startDemo(currItemIdx);
    }, totalTime);
  }

  return (
    <div className="d-flex flex-column align-items-center my-5">
      <h2 className="mb-3"><strong>Draw "<span id="demo-name"></span>"</strong></h2>
      <CanvasDraw
        ref={canvasRef}
        lazyRadius={0}
        disabled
      />
    </div>
  );
}