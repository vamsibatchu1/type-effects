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
  const isDraggingRef = useRef(false);
  const pinchConfirmationFrames = useRef(0);
  const [lerpPos, setLerpPos] = useState({ x: 0, y: 0 });
  const lastPosRef = useRef({ x: 0, y: 0 });
  const [currentStatus, setCurrentStatus] = useState<"TRACKING" | "PINCHING" | "DRAGGING">("TRACKING");

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
      minDetectionConfidence: 0.75,
      minTrackingConfidence: 0.75
    });

    const onResults = (results: any) => {
      if (canvasRef.current) {
        const previewCtx = canvasRef.current.getContext('2d')!;
        previewCtx.save();
        previewCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        previewCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);
        previewCtx.restore();
      }

      const overlayCtx = overlayCanvasRef.current!.getContext('2d')!;
      overlayCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];

        const targetX = (1 - thumbTip.x) * window.innerWidth;
        const targetY = thumbTip.y * window.innerHeight;
        
        const smoothX = lastPosRef.current.x + (targetX - lastPosRef.current.x) * 0.3;
        const smoothY = lastPosRef.current.y + (targetY - lastPosRef.current.y) * 0.3;
        lastPosRef.current = { x: smoothX, y: smoothY };
        setLerpPos({ x: smoothX, y: smoothY });

        // Unified Color Logic based on State
        const handColor = isDraggingRef.current ? '#A855F7' : isPinchingRef.current ? '#22C55E' : '#F97316';

        // Draw hand landmarks
        overlayCtx.strokeStyle = handColor;
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
          overlayCtx.fillStyle = handColor;
          overlayCtx.beginPath();
          overlayCtx.arc((1 - landmarks[idx].x) * window.innerWidth, landmarks[idx].y * window.innerHeight, 9, 0, 2 * Math.PI);
          overlayCtx.fill();
        });

        // Double-sided Arrow Feedback
        if (isDraggingRef.current) {
          overlayCtx.save();
          overlayCtx.translate(smoothX, smoothY - 50);
          overlayCtx.fillStyle = '#A855F7';
          overlayCtx.font = 'bold 32px Inter, sans-serif';
          overlayCtx.textAlign = 'center';
          overlayCtx.fillText('↔', 0, 0);
          overlayCtx.restore();
        }

        const dx = thumbTip.x - indexTip.x;
        const dy = thumbTip.y - indexTip.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        const isCurrentlyClose = dist < PINCH_THRESHOLD;
        if (isCurrentlyClose) {
          pinchConfirmationFrames.current = Math.min(10, pinchConfirmationFrames.current + 1);
        } else {
          pinchConfirmationFrames.current = Math.max(0, pinchConfirmationFrames.current - 1);
        }

        const shouldBePinching = pinchConfirmationFrames.current > 3;

        if (shouldBePinching && !isPinchingRef.current) {
          // Pinch Started
          isPinchingRef.current = true;
          setCurrentStatus("PINCHING");

          // Attempt to find handle
          const handles = Array.from(document.querySelectorAll('.cursor-col-resize'));
          let closestHandle: Element | null = null;
          let minDist = 40;

          handles.forEach(h => {
            const rect = h.getBoundingClientRect();
            const hCenterX = rect.left + rect.width / 2;
            const dx = Math.abs(smoothX - hCenterX);
            const isInVertical = smoothY >= rect.top && smoothY <= rect.bottom;

            if (dx < 30 && isInVertical && dx < minDist) {
              minDist = dx;
              closestHandle = h;
            }
          });

          if (closestHandle) {
             const event = new MouseEvent('mousedown', { 
               bubbles: true, cancelable: true, 
               clientX: smoothX, clientY: smoothY,
               screenX: smoothX, screenY: smoothY,
               button: 0, buttons: 1, 
               view: window 
             });
             closestHandle.dispatchEvent(event);
             isDraggingRef.current = true;
             setCurrentStatus("DRAGGING");
          }
        } else if (shouldBePinching && isPinchingRef.current) {
          // Continuous Event during pinch
          if (isDraggingRef.current) {
            window.dispatchEvent(new MouseEvent('mousemove', { 
              bubbles: true, cancelable: true, 
              clientX: smoothX, clientY: smoothY,
              screenX: smoothX, screenY: smoothY,
              button: 0, buttons: 1, 
              view: window 
            }));
          }
        } else if (!shouldBePinching && isPinchingRef.current) {
          // Release
          if (isDraggingRef.current) {
            window.dispatchEvent(new MouseEvent('mouseup', { 
              bubbles: true, cancelable: true, 
              clientX: smoothX, clientY: smoothY,
              screenX: smoothX, screenY: smoothY,
              button: 0, buttons: 0, 
              view: window 
            }));
            isDraggingRef.current = false;
          }
          isPinchingRef.current = false;
          setCurrentStatus("TRACKING");
        }
      } else {
        // No hand detected
        if (isDraggingRef.current) {
          window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, clientX: lastPosRef.current.x, clientY: lastPosRef.current.y, view: window }));
          isDraggingRef.current = false;
        }
        isPinchingRef.current = false;
        setCurrentStatus("TRACKING");
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
    }).catch((err: any) => {
        console.error("Camera Error:", err);
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

  const StatusIcon = () => {
    if (currentStatus === "TRACKING") return <div className="w-2.5 h-2.5 bg-orange-500 rounded-[2px] animate-pulse" />;
    if (currentStatus === "PINCHING") return <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />;
    // Triangle with rounded corners
    return (
      <div className="w-3 h-3 bg-purple-500 animate-pulse" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', borderRadius: '4px' }} />
    );
  };

  return (
    <>
      <canvas 
        ref={overlayCanvasRef} 
        className="fixed inset-0 z-[9999] pointer-events-none w-screen h-screen" 
      />

      {isActive && (lerpPos.x > 0) ? (
        <div 
          className="fixed z-[10000] pointer-events-none flex flex-col items-center gap-2 select-none"
          style={{ 
            left: lerpPos.x, 
            top: lerpPos.y + 60, 
            transform: 'translateX(-50%)'
          }}
        >
          <div className={`px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] rounded-full border shadow-2xl flex items-center gap-3 bg-black text-white border-black`}>
            <StatusIcon />
            <span>{currentStatus}</span>
          </div>
        </div>
      ) : null}

      <div className="fixed bottom-6 left-6 z-[100] flex flex-col items-start gap-3 select-none">
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
