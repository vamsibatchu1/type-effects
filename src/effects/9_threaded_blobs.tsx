import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const BG_COLOR = '#EAE8E3'; // Nerdy off-white
const STROKE_COLOR = '#1A1A1A'; // Brutalist black
const THREAD_COLOR = '#FF3366'; // Neon pink for the active connection

interface PropertyNode {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  hole: { x: number; y: number };
  label: string;
  color: string;
  content: string;
}

const NODES: PropertyNode[] = [
  {
    id: 'system',
    x: 100, y: 100, w: 200, h: 100,
    hole: { x: 285, y: 115 },
    label: "SYS_CORE",
    color: "#4CAF50", // Green
    content: "INITIALIZING SYSTEM PROTOCOLS. AWAITING INPUT SEQUENCES."
  },
  {
    id: 'data',
    x: 750, y: 120, w: 180, h: 120,
    hole: { x: 915, y: 135 },
    label: "DATA_STREAM",
    color: "#2196F3", // Blue
    content: "01000100 01000001 01010100 01000001 - FLUX NOMINAL."
  },
  {
    id: 'logic',
    x: 120, y: 600, w: 220, h: 110,
    hole: { x: 325, y: 615 },
    label: "LOGIC_GATE",
    color: "#9C27B0", // Purple
    content: "IF (CONNECTION == TRUE) { RENDER_TRUTH(); } ELSE { NULL; }"
  },
  {
    id: 'chaos',
    x: 700, y: 550, w: 200, h: 140,
    hole: { x: 885, y: 565 },
    label: "ENTROPY",
    color: "#FF5722", // Orange
    content: "CRITICAL FAILURE IMMINENT. CONTAINMENT BREACH DETECTED IN SECTOR 7."
  }
];

const MAIN_NODE = {
  x: 350, y: 300, w: 300, h: 200,
  hole: { x: 630, y: 320 }
};

export default function ThreadedBlobsEffect() {
  const [activeProp, setActiveProp] = useState<string | null>('system');
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Drag state target
  const targetX = useMotionValue(NODES[0].hole.x);
  const targetY = useMotionValue(NODES[0].hole.y);

  // The tip of the wire
  const tipX = useSpring(targetX, { stiffness: 400, damping: 25, mass: 0.5 });
  const tipY = useSpring(targetY, { stiffness: 400, damping: 25, mass: 0.5 });

  // A lagging point to calculate velocity/momentum for the wavy whip effect
  const lagX = useSpring(tipX, { stiffness: 100, damping: 15, mass: 1 });
  const lagY = useSpring(tipY, { stiffness: 100, damping: 15, mass: 1 });

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging && svgRef.current) {
      const pt = svgRef.current.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const cursorPt = pt.matrixTransform(svgRef.current.getScreenCTM()!.inverse());
      targetX.set(cursorPt.x);
      targetY.set(cursorPt.y);
    }
  };

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
      
      let closestNode: string | null = null;
      let minD = Infinity;
      
      NODES.forEach(node => {
        const dx = node.hole.x - targetX.get();
        const dy = node.hole.y - targetY.get();
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100 && dist < minD) {
          minD = dist;
          closestNode = node.id;
        }
      });
      
      setActiveProp(closestNode);
      if (closestNode) {
        const targetNode = NODES.find(n => n.id === closestNode)!;
        targetX.set(targetNode.hole.x);
        targetY.set(targetNode.hole.y);
      } else {
        // Disconnected: Fall physics
        targetX.set(MAIN_NODE.hole.x + (Math.random() * 80 - 40)); // Random sway
        targetY.set(MAIN_NODE.hole.y + 400); // Hang down
      }
    }
  };

  const activeNode = activeProp ? NODES.find(n => n.id === activeProp) : null;
  const isConnected = !isDragging && activeNode;
  const mainColor = isConnected ? activeNode.color : '#1A1A1A';
  
  const targetText = isConnected 
    ? activeNode.content 
    : 'NO SIGNAL DETECTED. PLEASE CONNECT WIRE TO A DATA SOURCE.';

  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    setDisplayedText("");
    
    const interval = setInterval(() => {
      setDisplayedText(prev => targetText.slice(0, prev.length + 1));
      i++;
      if (i >= targetText.length) {
        clearInterval(interval);
      }
    }, 15);

    return () => clearInterval(interval);
  }, [targetText]);

  // Wavy / Whip String Physics Path
  const threadPath = useTransform([tipX, tipY, lagX, lagY], ([endX, endY, lx, ly]) => {
    const startX = MAIN_NODE.hole.x;
    const startY = MAIN_NODE.hole.y;
    
    // Distances and sag
    const dx = endX - startX;
    const dy = endY - startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const tension = Math.min(1, dist / 800);
    const gravitySag = Math.max(60, 300 * (1 - tension));
    
    // Calculate momentum from the lagging point
    const momentumX = endX - lx;
    const momentumY = endY - ly;
    
    // Control points react to momentum to create an S-curve whip
    const ctrl1X = startX + (momentumX * 0.1);
    const ctrl1Y = startY + gravitySag + (momentumY * 0.1);

    const ctrl2X = endX - (momentumX * 1.2);
    const ctrl2Y = endY + gravitySag - (momentumY * 1.2);
    
    return `M ${startX} ${startY} C ${ctrl1X} ${ctrl1Y}, ${ctrl2X} ${ctrl2Y}, ${endX} ${endY}`;
  });

  return (
    <div className="w-full h-full bg-[#EAE8E3] relative overflow-hidden select-none touch-none font-ibm-mono text-[#1A1A1A]">
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#1A1A1A 1px, transparent 1px), linear-gradient(90deg, #1A1A1A 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <svg 
        ref={svgRef}
        viewBox="0 0 1000 800" 
        className="w-full h-full relative z-10"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Layer 1: Nodes */}
        {NODES.map(node => (
          <g key={`node-${node.id}`}>
            {/* Offset Shadow */}
            <rect x={node.x + 8} y={node.y + 8} width={node.w} height={node.h} fill={STROKE_COLOR} />
            {/* Main Box */}
            <rect x={node.x} y={node.y} width={node.w} height={node.h} fill="#FFFFFF" stroke={STROKE_COLOR} strokeWidth="3" />
            {/* Header Area */}
            <rect x={node.x} y={node.y} width={node.w} height="30" fill={STROKE_COLOR} />
            <text x={node.x + 10} y={node.y + 20} fill="#FFFFFF" fontSize="14" fontWeight="bold" className="font-ibm-mono">{node.label}</text>
          </g>
        ))}

        <g>
          {/* Offset Shadow */}
          <rect x={MAIN_NODE.x + 12} y={MAIN_NODE.y + 12} width={MAIN_NODE.w} height={MAIN_NODE.h} fill={STROKE_COLOR} />
          {/* Main Box */}
          <rect x={MAIN_NODE.x} y={MAIN_NODE.y} width={MAIN_NODE.w} height={MAIN_NODE.h} fill={mainColor} stroke={STROKE_COLOR} strokeWidth="4" className="transition-colors duration-300" />
          
          <rect x={MAIN_NODE.x} y={MAIN_NODE.y} width={MAIN_NODE.w} height="40" fill={STROKE_COLOR} />
          <text x={MAIN_NODE.x + 15} y={MAIN_NODE.y + 25} fill="#FFFFFF" fontSize="18" fontWeight="bold" className="font-big-shoulders tracking-wider">
            PROCESS_UNIT // {isConnected ? activeNode.id.toUpperCase() : 'OFFLINE'}
          </text>

          {/* Main Blob Text Content */}
          <foreignObject x={MAIN_NODE.x + 10} y={MAIN_NODE.y + 50} width={MAIN_NODE.w - 20} height={MAIN_NODE.h - 60}>
            <div className="flex items-start justify-start w-full h-full text-[#FFFFFF] p-2 font-ibm-mono text-[14px] leading-relaxed">
              <div className="transition-opacity duration-300">
                {">"} {displayedText}
                <span className="inline-block w-[8px] h-[1em] bg-white ml-2 animate-pulse align-middle" />
              </div>
            </div>
          </foreignObject>
        </g>

        {/* Layer 2: Threads */}
        <motion.path 
          d={threadPath} 
          fill="none" 
          stroke={THREAD_COLOR} 
          strokeWidth="6" 
          strokeLinecap="round"
        />

        {/* Layer 3: Connection Ports (drawn over thread to hide endpoints) */}
        {NODES.map(node => (
          <g key={`port-${node.id}`}>
            <circle cx={node.hole.x} cy={node.hole.y} r="8" fill="#FFFFFF" />
            <circle cx={node.hole.x} cy={node.hole.y} r="4" fill={STROKE_COLOR} />
          </g>
        ))}

        <g>
          <circle cx={MAIN_NODE.hole.x} cy={MAIN_NODE.hole.y} r="10" fill="#FFFFFF" />
          <circle cx={MAIN_NODE.hole.x} cy={MAIN_NODE.hole.y} r="5" fill={mainColor} className="transition-colors duration-300" />
        </g>

        {/* Layer 4: Interactive Drag Handle */}
        <motion.path 
          d={threadPath}
          fill="none"
          stroke="transparent"
          strokeWidth="60"
          className={`cursor-grab ${isDragging ? 'active:cursor-grabbing' : ''}`}
          onPointerDown={(e) => {
            e.stopPropagation();
            if (svgRef.current) {
              const pt = svgRef.current.createSVGPoint();
              pt.x = e.clientX;
              pt.y = e.clientY;
              const cursorPt = pt.matrixTransform(svgRef.current.getScreenCTM()!.inverse());
              targetX.set(cursorPt.x);
              targetY.set(cursorPt.y);
              setIsDragging(true);
            }
          }}
        />

      </svg>

      {/* Floating Instructions */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center pointer-events-none bg-white border-2 border-[#1A1A1A] p-2 shadow-[4px_4px_0_0_#1A1A1A]">
        <p className="font-ibm-mono text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">Click and drag the connection wire</p>
      </div>
    </div>
  );
}
