
import React, { useState, useEffect, useRef } from 'react';
import { SystemState, HandData, GestureType } from './types';
import Experience from './components/Experience';
import LoadingScreen from './components/LoadingScreen';
import HUD from './components/HUD';
import { analyzeGesture, getPalmCenter, getPointingDirection } from './services/gestureLogic';

const App: React.FC = () => {
  const [state, setState] = useState<SystemState>({
    isLoaded: false,
    isCameraActive: false,
    swordCount: 300,
    detectedHands: []
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const handsRef = useRef<any>(null);

  useEffect(() => {
    // Initialize MediaPipe Hands
    const setupHands = async () => {
      // @ts-ignore
      const hands = new window.Hands({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });

      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.6
      });

      hands.onResults((results: any) => {
        const detected: HandData[] = [];
        if (results.multiHandLandmarks) {
          results.multiHandLandmarks.forEach((landmarks: any[], index: number) => {
            const gesture = analyzeGesture(landmarks);
            const palmCenter = getPalmCenter(landmarks);
            const direction = getPointingDirection(landmarks);
            detected.push({ landmarks, gesture, palmCenter, direction });
          });
        }
        setState(prev => ({ ...prev, detectedHands: detected }));
      });

      handsRef.current = hands;

      if (videoRef.current) {
        // @ts-ignore
        const camera = new window.Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current) {
              await hands.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480
        });
        camera.start().then(() => {
          setState(prev => ({ ...prev, isCameraActive: true, isLoaded: true }));
        }).catch((err: any) => {
          console.error("Camera failed to start:", err);
          setState(prev => ({ ...prev, isLoaded: true })); // Proceed to show UI even if camera fails
        });
      }
    };

    setupHands();
  }, []);

  return (
    <div className="relative w-full h-full bg-[#000814] overflow-hidden">
      {!state.isLoaded && <LoadingScreen />}
      
      <Experience 
        hands={state.detectedHands} 
        swordCount={state.swordCount} 
      />

      <HUD 
        hands={state.detectedHands} 
        isCameraActive={state.isCameraActive}
      />

      {/* Hidden elements for tracking */}
      <video
        ref={videoRef}
        className="hidden"
        playsInline
      />
      
      {/* Title */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-center select-none">
        <h1 className="text-4xl md:text-6xl font-black chinese-font tracking-widest text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">
          VIZAVISUAL
        </h1>
        <p className="text-sm md:text-xl uppercase tracking-[0.4em] text-cyan-100/50 mt-2 font-light">
          万剑归宗 · TEN THOUSAND SWORDS
        </p>
      </div>
    </div>
  );
};

export default App;
