import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";

const PURPLE = "#B88AFF";
const TEXT_CONTENT = "DNA Sequence Analysis: The structure of DNA is a double helix, which is composed of two linear strands that run opposite to each other and twist together. Each strand is a long polymer made of repeating units called nucleotides. The nitrogenous bases of the two strands are bound together by hydrogen bonds, forming base pairs. This genetic code is the blueprint for all living organisms, determining hereditary traits and biological functions. Molecular dynamics simulations show how these strands interact under various physical forces, ensuring the preservation of information across generations. DNA is often compared to a digital code, a massive dataset representing the building blocks of life itself. The sequence of G, A, T, and C nucleotides stores a vast library of biological instructions that direct the synthesis of proteins. Scientists use advanced bioinformatics to map these complex sequences, unlocking mysteries of human health and the evolutionary history of the planet.";

interface ResizableRowProps {
  initialWidths: number[];
}

const ResizableRow = ({ initialWidths }: ResizableRowProps) => {
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
    <div ref={containerRef} className="flex-grow flex h-full w-full gap-2 relative">
      {widths.map((w, i) => (
        <React.Fragment key={i}>
          <motion.div
            layout
            style={{ width: `${w}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="h-full bg-[#B88AFF] rounded-sm p-3 relative overflow-hidden flex flex-col"
          >
            <div className="text-[10px] lg:text-[11px] leading-tight text-[#2D5A27] font-extrabold text-justify whitespace-normal break-all h-full overflow-hidden">
               {/* Use repeated text to ensure it looks FULLY filled */}
               {new Array(5).fill(TEXT_CONTENT).join(" ")}
            </div>
            
            {/* Draggable Handle (Right Side) */}
            {i < widths.length - 1 && (
              <div
                onMouseDown={handleMouseDown(i)}
                className={`absolute top-0 right-[-4px] w-[8px] h-full cursor-col-resize z-50 transition-colors ${resizingIdx === i ? 'bg-white/50' : 'hover:bg-white/20'}`}
              />
            )}
          </motion.div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default function DNAEffect() {
  return (
    <div className="w-full h-full bg-[#2D5A27] flex items-center justify-center p-6 lg:p-12 overflow-hidden selection:bg-white selection:text-[#B88AFF]">
      <div className="relative">
        {/* Title Decor */}
        <div className="absolute -top-10 left-0 text-[#B88AFF] font-bold uppercase tracking-widest text-[12px]">
          Interactive.Sequence // DNA Lab
        </div>
        
        {/* Main 800x600 Box */}
        <div 
          className="bg-black/20 p-2 flex flex-col gap-2 rounded-md shadow-2xl" 
          style={{ width: '800px', height: '600px' }}
        >
          {/* Row 1: 3 Boxes */}
          <div className="h-[48.5%] flex w-full">
            <ResizableRow initialWidths={[33.3, 33.3, 33.3]} />
          </div>
          
          {/* Row 2: 2 Boxes */}
          <div className="h-[48.5%] flex w-full">
            <ResizableRow initialWidths={[50, 50]} />
          </div>
        </div>

        {/* Footer Decor */}
        <div className="absolute -bottom-10 right-0 text-[#B88AFF]/50 font-mono text-[10px] uppercase text-right">
          Dynamic Width Allocation<br />Drag edges to mutate sequence
        </div>
      </div>
    </div>
  );
}
