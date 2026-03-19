import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";

const PURPLE = "#B88AFF";
const TEXT_CONTENT = "Dynamic Layout Architecture: Responsive design systems require fluid distribution of space. By employing spring-based physics for width allocation, components can adapt to user interactions without jarring transitions. This approach ensures that the visual hierarchy remains balanced as elements are resized. The underlying mathematical model calculates proportional offsets to maintain the relative importance of each content block. Advanced layout engines use these principles to create interfaces that feel organic and responsive. Modern web applications benefit from these dynamic systems, allowing for a more immersive and interactive user experience. The ability to manipulate the workspace directly creates a sense of empowerment and control for the end-user. Designers and developers can collaborate to define the constraints and behaviors that guide these fluid layouts, resulting in more robust and versatile digital products.";

const PUFF_COLORS = [
  "#C0A0E0", // Purple
  "#106040", // Dark Green
  "#C09040", // Gold
  "#602030", // Maroon
  "#B0D0F0", // Light Blue
  "#FF8050", // Orange
  "#F5F5DC", // Beige/Light
];

const PuffPixelGrid = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const pixelSize = 20;

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Pre-generate a stable world of blocks
  const worldBlocks = React.useMemo(() => {
    const worldRows = 50;
    const worldCols = 50;
    const cells = Array(worldRows).fill(null).map(() => Array(worldCols).fill(null));
    const blocks: {r: number, c: number, rs: number, cs: number, color: string}[] = [];

    // Simple pseudo-random for world generation
    let seed = 42;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    for (let r = 0; r < worldRows; r++) {
      for (let c = 0; c < worldCols; c++) {
        if (cells[r][c]) continue;

        // Try to create a block of random size
        const rs = Math.min(Math.floor(random() * 3) + 1, worldRows - r);
        const cs = Math.min(Math.floor(random() * 4) + 1, worldCols - c);
        
        let available = true;
        for (let i = 0; i < rs; i++) {
          for (let j = 0; j < cs; j++) {
            if (cells[r + i][c + j]) { available = false; break; }
          }
          if (!available) break;
        }

        if (available) {
          const color = PUFF_COLORS[Math.floor(random() * PUFF_COLORS.length)];
          for (let i = 0; i < rs; i++) {
            for (let j = 0; j < cs; j++) {
              cells[r + i][c + j] = color;
            }
          }
          blocks.push({ r, c, rs, cs, color });
        } else {
          const color = PUFF_COLORS[Math.floor(random() * PUFF_COLORS.length)];
          cells[r][c] = color;
          blocks.push({ r, c, rs: 1, cs: 1, color });
        }
      }
    }
    return blocks;
  }, []);

  const colsCount = Math.ceil(dimensions.width / pixelSize);
  const rowsCount = Math.ceil(dimensions.height / pixelSize);

  // Filter blocks that are within or partially within the visible area
  const visibleBlocks = worldBlocks.filter(b => b.r < rowsCount && b.c < colsCount);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-transparent">
      <div 
        className="grid absolute top-0 left-0"
        style={{ 
          gridTemplateColumns: `repeat(${colsCount}, ${pixelSize}px)`,
          gridTemplateRows: `repeat(${rowsCount}, ${pixelSize}px)`,
        }}
      >
        {visibleBlocks.map((block, i) => (
          <div 
            key={i} 
            style={{ 
              backgroundColor: block.color,
              gridRowStart: block.r + 1,
              gridRowEnd: Math.min(block.r + block.rs, rowsCount) + 1,
              gridColumnStart: block.c + 1,
              gridColumnEnd: Math.min(block.c + block.cs, colsCount) + 1,
            }} 
            className="w-full h-full" 
          />
        ))}
      </div>
    </div>
  );
};

const EDITORIAL_WORDS = [
  "SOFTWARE", "FOR", "ARTISTS", "DAY", "(S4AD)", "IS", "AN", "EVENT", "THAT", 
  "ENCOURAGES", "TECHNOLOGISTS", "TO", "IDENTIFY", "THEMSELVES", "AS", 
  "ARTISTS,", "AND", "ARTISTS", "AS", "TECHNOLOGISTS.", "SOFTWARE", "FOR", "ARTISTS"
];

const TerminalText = () => {
  const text = "SOFTWARE FOR ARTISTS DAY (S4AD) IS AN EVENT THAT ENCOURAGES TECHNOLOGISTS TO IDENTIFY THEMSELVES AS ARTISTS, AND ARTISTS AS TECHNOLOGISTS. SOFTWARE FOR ARTISTS DAY (S4AD) IS AN EVENT THAT ENCOURAGES TECHNOLOGISTS TO IDENTIFY THEMSELVES AS ARTISTS, AND ARTISTS AS TECHNOLOGISTS. SOFTWARE FOR ARTISTS DAY (S4AD) IS AN EVENT THAT ENCOURAGES TECHNOLOGISTS TO IDENTIFY THEMSELVES AS ARTISTS, AND ARTISTS AS TECHNOLOGISTS. SOFTWARE FOR ARTISTS DAY (S4AD) IS AN EVENT THAT ENCOURAGES TECHNOLOGISTS TO IDENTIFY THEMSELVES AS ARTISTS, AND ARTISTS AS TECHNOLOGISTS.";

  return (
    <div className="w-full h-full bg-white font-ibm-mono overflow-hidden leading-[2.2] text-[12px] lg:text-[14px]">
      <div className="relative">
        <span className="bg-[#0000FF] text-white py-0.5 px-0 leading-[2.2] box-decoration-clone inline">
          {text}
        </span>
      </div>
      
      {/* Texture Layer (Subtle Scanlines) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
        <div className="w-full h-full bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,black_1px,black_2px)]" />
      </div>
    </div>
  );
};

interface BoxConfig {
  bgColor?: string;
  className?: string;
  textClassName?: string;
  content?: React.ReactNode;
}

interface ResizableRowProps {
  initialWidths: number[];
  configs?: BoxConfig[];
}

const ResizableRow = ({ initialWidths, configs = [] }: ResizableRowProps) => {
  const [widths, setWidths] = useState<number[]>(initialWidths);
  const containerRef = useRef<HTMLDivElement>(null);
  const [resizingIdx, setResizingIdx] = useState<number | null>(null);

  const handleMouseDown = (idx: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    setResizingIdx(idx);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizingIdx === null || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const mouseXRelative = (e.clientX - containerRect.left) / containerRect.width * 100;
      
      // All boxes before the handle have their widths locked or fixed.
      let prevTotal = 0;
      for (let i = 0; i < resizingIdx; i++) {
        prevTotal += widths[i];
      }

      // The new width of the block being dragged
      const newWidth = Math.max(5, Math.min(mouseXRelative - prevTotal, 95 - prevTotal));
      
      // Now, redistribute the REMAINING width among the boxes to the right
      const remainingTotalWidthInput = 100 - (prevTotal + newWidth);
      const oldRemainingTotal = 100 - (prevTotal + widths[resizingIdx]);
      
      const newWidths = [...widths];
      newWidths[resizingIdx] = newWidth;
      
      // Proportional redistribution for the rest
      if (oldRemainingTotal > 0) {
        for (let i = resizingIdx + 1; i < widths.length; i++) {
          newWidths[i] = (widths[i] / oldRemainingTotal) * remainingTotalWidthInput;
        }
      }

      setWidths(newWidths);
    };

    const handleMouseUp = () => setResizingIdx(null);

    if (resizingIdx !== null) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizingIdx, widths]);

  return (
    <div ref={containerRef} className="flex-grow flex h-full w-full relative">
      {widths.map((w, i) => {
        const config = configs[i] || {};
        return (
          <React.Fragment key={i}>
            <motion.div
              layout
              style={{ width: `${w}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`h-full border p-3 relative overflow-hidden flex flex-col rounded-none scrollbar-hide ${config.bgColor || "bg-transparent"} ${config.className || ""} ${config.bgColor === "bg-white" ? "border-black/10" : "border-white/30"}`}
            >
              <div className={`leading-tight font-medium text-justify whitespace-normal break-all h-full overflow-hidden opacity-90 ${config.textClassName || "text-white text-[10px] lg:text-[11px]"}`}>
                 {config.content ? config.content : (
                   <>
                     {/* Use repeated text to ensure it looks FULLY filled */}
                     {new Array(10).fill(TEXT_CONTENT).join(" ")}
                   </>
                 )}
              </div>
            
            {/* Draggable Handle (Right Side) */}
            {i < widths.length - 1 && (
              <div
                onMouseDown={handleMouseDown(i)}
                className={`absolute top-0 right-[-4px] w-[8px] h-full cursor-col-resize z-50 transition-colors ${
                  config.bgColor === "bg-white" 
                    ? resizingIdx === i ? "bg-black/40" : "hover:bg-black/10"
                    : resizingIdx === i ? "bg-white/40" : "hover:bg-white/10"
                }`}
              />
            )}
            </motion.div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default function DynamicLayoutEffect() {
  return (
    <div className="w-full h-full bg-[#FFAEE8] flex items-center justify-center p-6 lg:p-12 overflow-hidden selection:bg-[#B88AFF] selection:text-white">
      <div className="relative">
        {/* Main 800x600 Box */}
        <div 
          className="flex flex-col overflow-hidden" 
          style={{ width: '800px', height: '600px' }}
        >
          {/* Row 1: 3 Boxes */}
          <div className="h-[65%] flex w-full">
            <ResizableRow 
              initialWidths={[33.3, 33.3, 33.3]} 
              configs={[
                { bgColor: "bg-black", textClassName: "text-white text-[40px] font-big-shoulders leading-none uppercase" },
                { bgColor: "bg-white", textClassName: "p-0", content: <PuffPixelGrid /> },
                { bgColor: "bg-white", content: <TerminalText /> }
              ]}
            />
          </div>
          
          {/* Row 2: 2 Boxes */}
          <div className="h-[35%] flex w-full">
            <ResizableRow 
              initialWidths={[50, 50]} 
              configs={[
                { bgColor: "bg-white", textClassName: "text-black text-[10px] lg:text-[11px]" },
                { bgColor: "bg-white", textClassName: "text-black text-[10px] lg:text-[11px]" }
              ]}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
