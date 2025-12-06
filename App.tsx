import React, { useState } from 'react';
import Visualizer from './components/Visualizer';
import HandManager from './components/HandManager';
import UI from './components/UI';
import { ShapeType, HandData } from './types';

const App: React.FC = () => {
  const [handData, setHandData] = useState<HandData | null>(null);
  const [currentShape, setCurrentShape] = useState<ShapeType>(ShapeType.HEART);
  const [currentColor, setCurrentColor] = useState<string>('#4f8cff');

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans select-none">
      
      {/* The 3D World */}
      <div className="absolute inset-0 z-10">
        <Visualizer 
          handData={handData} 
          shapeType={currentShape}
          color={currentColor}
        />
      </div>

      {/* Hand Tracking Logic (Hidden/Preview corner) */}
      <HandManager onHandUpdate={setHandData} />

      {/* UI Overlay */}
      <UI 
        currentShape={currentShape} 
        onShapeChange={setCurrentShape}
        currentColor={currentColor}
        onColorChange={setCurrentColor}
        handDetected={!!handData}
      />
    </div>
  );
};

export default App;
