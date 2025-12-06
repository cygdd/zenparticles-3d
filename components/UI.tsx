import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { ShapeType } from '../types';
import { Maximize2, Minimize2, Palette, Hand, Settings2 } from 'lucide-react';

interface UIProps {
  currentShape: ShapeType;
  onShapeChange: (shape: ShapeType) => void;
  currentColor: string;
  onColorChange: (color: string) => void;
  handDetected: boolean;
}

const UI: React.FC<UIProps> = ({ 
  currentShape, 
  onShapeChange, 
  currentColor, 
  onColorChange,
  handDetected
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <>
      {/* Top Left Title & Status */}
      <div className="absolute top-6 left-6 z-40">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          ZenParticles
        </h1>
        <div className="flex items-center gap-2 mt-2">
           <div className={`w-3 h-3 rounded-full ${handDetected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
           <span className="text-xs text-gray-400 uppercase tracking-wider">
             {handDetected ? 'Hand Detected' : 'No Hand Detected'}
           </span>
        </div>
      </div>

      {/* Main Control Panel */}
      <div className={`absolute top-6 right-6 z-40 transition-all duration-300 ${isCollapsed ? 'w-12 h-12' : 'w-72'}`}>
         <div className="bg-glass backdrop-blur-md border border-glassBorder rounded-2xl p-4 shadow-2xl overflow-hidden">
            
            {/* Header/Toggle */}
            <div className="flex justify-between items-center mb-4">
               {!isCollapsed && <h2 className="text-sm font-semibold text-gray-200">Controls</h2>}
               <button 
                 onClick={() => setIsCollapsed(!isCollapsed)}
                 className="p-2 hover:bg-white/10 rounded-lg transition-colors ml-auto"
               >
                 <Settings2 size={18} />
               </button>
            </div>

            {!isCollapsed && (
              <div className="space-y-6">
                
                {/* Shape Selector */}
                <div>
                   <label className="text-xs text-gray-400 mb-2 block uppercase tracking-wide">Model</label>
                   <div className="grid grid-cols-3 gap-2">
                      {Object.values(ShapeType).map((shape) => (
                        <button
                          key={shape}
                          onClick={() => onShapeChange(shape)}
                          className={`
                            px-2 py-2 text-xs rounded-lg transition-all duration-200 border
                            ${currentShape === shape 
                              ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/20' 
                              : 'bg-white/5 border-transparent hover:bg-white/10 text-gray-300'}
                          `}
                        >
                          {shape}
                        </button>
                      ))}
                   </div>
                </div>

                {/* Color Selector */}
                <div>
                  <label className="text-xs text-gray-400 mb-2 block uppercase tracking-wide">Color Theme</label>
                  <div className="flex items-center gap-3">
                     <div 
                       className="w-10 h-10 rounded-full border-2 border-white/20 cursor-pointer shadow-inner"
                       style={{ backgroundColor: currentColor }}
                       onClick={() => setShowColorPicker(!showColorPicker)}
                     />
                     <span className="text-sm text-gray-300 font-mono">{currentColor}</span>
                     <button 
                       onClick={() => setShowColorPicker(!showColorPicker)}
                       className="ml-auto p-2 bg-white/5 rounded-lg hover:bg-white/10"
                     >
                        <Palette size={16} />
                     </button>
                  </div>
                  
                  {showColorPicker && (
                    <div className="mt-4 animate-in fade-in zoom-in duration-200">
                      <HexColorPicker color={currentColor} onChange={onColorChange} style={{ width: '100%' }} />
                    </div>
                  )}
                </div>

                {/* Fullscreen Toggle */}
                <div className="pt-4 border-t border-white/10">
                   <button 
                     onClick={toggleFullscreen}
                     className="w-full py-2 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm"
                   >
                     {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                     {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                   </button>
                </div>

              </div>
            )}
         </div>
      </div>

      {/* Instructions Overlay (Bottom Left) */}
      <div className="absolute bottom-6 left-6 z-30 max-w-sm pointer-events-none hidden md:block">
         <div className="bg-glass backdrop-blur-xs p-4 rounded-xl border border-glassBorder text-sm text-gray-300">
            <div className="flex items-start gap-3">
               <Hand className="text-blue-400 shrink-0 mt-1" size={20} />
               <div>
                 <p className="font-semibold text-white mb-1">Gesture Control</p>
                 <p className="leading-relaxed opacity-80">
                   Show your hand to the camera. <br/>
                   <span className="text-white">Pinch fingers</span> to contract particles. <br/>
                   <span className="text-white">Open palm</span> to explode/expand them.
                 </p>
               </div>
            </div>
         </div>
      </div>
    </>
  );
};

export default UI;
