import React, { useEffect, useRef, useState } from 'react';
import { HandData } from '../types';

// Declare globals loaded from CDN
declare global {
  interface Window {
    Camera: any;
    Hands: any;
  }
}

interface HandManagerProps {
  onHandUpdate: (data: HandData | null) => void;
}

const HandManager: React.FC<HandManagerProps> = ({ onHandUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!videoRef.current || !window.Hands || !window.Camera) return;

    const hands = new window.Hands({
      locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results: any) => {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        
        // 4 = Thumb Tip, 8 = Index Tip
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const wrist = landmarks[0];

        // Calculate distance between thumb and index (Pinch/Open magnitude)
        const distance = Math.sqrt(
          Math.pow(thumbTip.x - indexTip.x, 2) +
          Math.pow(thumbTip.y - indexTip.y, 2)
        );

        // Normalize distance (approximate range usually 0.02 to 0.3 for a hand)
        // We map 0.05 -> 0 (closed), 0.25 -> 1 (open)
        let normalizedDist = (distance - 0.02) / 0.2;
        normalizedDist = Math.max(0, Math.min(1, normalizedDist));

        onHandUpdate({
          isOpen: normalizedDist > 0.5,
          pinchDistance: normalizedDist,
          palmPosition: { x: wrist.x, y: wrist.y },
        });
      } else {
        onHandUpdate(null);
      }
    });

    const camera = new window.Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current) {
          await hands.send({ image: videoRef.current });
        }
      },
      width: 640,
      height: 480,
    });

    camera.start()
      .then(() => setIsReady(true))
      .catch((err: any) => console.error("Camera error:", err));

    return () => {
      // Cleanup if necessary, though MediaPipe doesn't have a strict stop method exposed easily here
    };
  }, [onHandUpdate]);

  return (
    <div className="fixed bottom-4 right-4 w-32 h-24 rounded-lg overflow-hidden border-2 border-white/20 shadow-lg z-50 bg-black">
       <video
         ref={videoRef}
         className="w-full h-full object-cover transform scale-x-[-1]" // Mirror video
         playsInline
       />
       {!isReady && (
         <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-xs text-white">
           Loading AI...
         </div>
       )}
    </div>
  );
};

export default HandManager;
