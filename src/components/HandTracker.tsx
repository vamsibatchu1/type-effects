import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    Hands: any;
    Camera: any;
  }
}

const PINCH_THRESHOLD = 0.05;

export const HandTracker = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const isPinchingRef = useRef(false);
  const pinchConfirmationFrames = useRef(0);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const [displayPinching, setDisplayPinching] = useState(false);
  const [status, setStatus] = useState("Initializing Hand Tracking...");

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current || !overlayCanvasRef.current) return;

    const hands = new window.Hands({
      locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.75, // Increased Confidence
      minTrackingConfidence: 0.75
    });

    const onResults = (results: any) => {
      // 1. Update small preview
      if (canvasRef.current) {
        const previewCtx = canvasRef.current.getContext('2d')!;
        previewCtx.save();
        previewCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        previewCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);
        previewCtx.restore();
      }

      // 2. Update full-screen overlay
      const overlayCtx = overlayCanvasRef.current!.getContext('2d')!;
      overlayCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];

        // Screen coordinates with heavy Smoothing (LERP)
        const targetX = (1 - thumbTip.x) * window.innerWidth;
        const targetY = thumbTip.y * window.innerHeight;
        
        // Slightly slower LERP for stability
        const smoothX = lastPosRef.current.x + (targetX - lastPosRef.current.x) * 0.3;
        const smoothY = lastPosRef.current.y + (targetY - lastPosRef.current.y) * 0.3;
        lastPosRef.current = { x: smoothX, y: smoothY };

        // Draw hand landmarks
        overlayCtx.strokeStyle = isPinchingRef.current ? '#00FF00' : '#B88AFF';
        overlayCtx.lineWidth = 5;
        overlayCtx.beginPath();
        const connections = [[0, 1, 2, 3, 4], [0, 5, 6, 7, 8], [5, 9, 13, 17, 0], [9, 10, 11, 12], [13, 14, 15, 16], [17, 18, 19, 20]];
        connections.forEach(path => {
          overlayCtx.moveTo((1 - landmarks[path[0]].x) * window.innerWidth, landmarks[path[0]].y * window.innerHeight);
          for (let i = 1; i < path.length; i++) {
            overlayCtx.lineTo((1 - landmarks[path[i]].x) * window.innerWidth, landmarks[path[i]].y * window.innerHeight);
          }
        });
        overlayCtx.stroke();

        [4, 8].forEach(idx => {
          overlayCtx.fillStyle = isPinchingRef.current ? '#00FF00' : '#B88AFF';
          overlayCtx.beginPath();
          overlayCtx.arc((1 - landmarks[idx].x) * window.innerWidth, landmarks[idx].y * window.innerHeight, 9, 0, 2 * Math.PI);
          overlayCtx.fill();
        });

        // Double-sided Arrow Feedback when pinching
        if (isPinchingRef.current) {
          overlayCtx.save();
          overlayCtx.translate(smoothX, smoothY - 50);
          overlayCtx.fillStyle = '#00FF00';
          overlayCtx.font = 'bold 32px Inter, sans-serif';
          overlayCtx.textAlign = 'center';
          overlayCtx.fillText('↔', 0, 0);
          overlayCtx.restore();
        }

        const dx = thumbTip.x - indexTip.x;
        const dy = thumbTip.y - indexTip.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Pinch Debouncing
        const isCurrentlyClose = dist < PINCH_THRESHOLD;
        if (isCurrentlyClose) {
          pinchConfirmationFrames.current = Math.min(10, pinchConfirmationFrames.current + 1);
        } else {
          pinchConfirmationFrames.current = Math.max(0, pinchConfirmationFrames.current - 1);
        }

        const shouldBePinching = pinchConfirmationFrames.current > 3;

        if (shouldBePinching && !isPinchingRef.current) {
          const element = document.elementFromPoint(smoothX, smoothY);
          if (element) {
             const event = new MouseEvent('mousedown', { 
               bubbles: true, cancelable: true, 
               clientX: smoothX, clientY: smoothY,
               screenX: smoothX, screenY: smoothY,
               button: 0,
               buttons: 1, 
               view: window 
             });
             element.dispatchEvent(event);
          }
          isPinchingRef.current = true;
          setDisplayPinching(true);
        } else if (shouldBePinching && isPinchingRef.current) {
          window.dispatchEvent(new MouseEvent('mousemove', { 
            bubbles: true, cancelable: true, 
            clientX: smoothX, clientY: smoothY,
            screenX: smoothX, screenY: smoothY,
            button: 0,
            buttons: 1, 
            view: window 
          }));
        } else if (!shouldBePinching && isPinchingRef.current) {
          window.dispatchEvent(new MouseEvent('mouseup', { 
            bubbles: true, cancelable: true, 
            clientX: smoothX, clientY: smoothY,
            screenX: smoothX, screenY: smoothY,
            button: 0,
            buttons: 0, 
            view: window 
          }));
          isPinchingRef.current = false;
          setDisplayPinching(false);
        }
      }
    };

    hands.onResults(onResults);

    const camera = new window.Camera(videoRef.current, {
      onFrame: async () => {
        await hands.send({ image: videoRef.current! });
      },
      width: 640,
      height: 480
    });

    camera.start().then(() => {
        setIsActive(true);
        setStatus("Hand Tracking Active: Pinch Edge to Drag");
    }).catch((err: any) => {
        setStatus("Camera Error: " + err.message);
    });

    const handleResize = () => {
      if (overlayCanvasRef.current) {
        overlayCanvasRef.current.width = window.innerWidth;
        overlayCanvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      camera.stop();
      hands.close();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      <canvas 
        ref={overlayCanvasRef} 
        className="fixed inset-0 z-[9999] pointer-events-none w-screen h-screen" 
      />

      <div className="fixed bottom-6 left-6 z-[100] flex flex-col items-start gap-3 select-none">
        <div className={`px-4 py-2 text-[10px] font-mono uppercase tracking-widest rounded-full border shadow-lg transition-all duration-500 flex items-center gap-2 ${
            isActive ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-200'
        }`}>
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-300'}`} />
          {status}
          {displayPinching && <span className="ml-2 text-green-400 font-bold">[PINCH]</span>}
        </div>
        
        <div className={`overflow-hidden rounded-xl border-2 border-black/10 shadow-2xl transition-all duration-1000 origin-bottom-left ${
            isActive ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-10'
        }`}>
          <video ref={videoRef} className="hidden" />
          <canvas 
            ref={canvasRef} 
            width={240} 
            height={180} 
            className="scale-x-[-1] opacity-60 bg-gray-100" 
          />
        </div>
      </div>
    </>
  );
};
