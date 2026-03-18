import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const CHIP_COLORS = [
  { r: 255, g: 95, b: 31 },   // Orange
  { r: 63, g: 191, b: 127 },  // Green
  { r: 255, g: 127, b: 191 }, // Pink
  { r: 255, g: 223, b: 0 },   // Yellow
  { r: 95, g: 159, b: 255 },  // Blue
  { r: 191, g: 95, b: 255 },  // Purple
  { r: 0, g: 255, b: 255 },   // Cyan
  { r: 255, g: 0, b: 0 },     // Red
];

export default function KineticFocusEffect() {
  const [mouseY, setMouseY] = useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMouseY(e.clientY - rect.top);
    }
  };

  const lines = [
    { left: "Movement is", right: "by design" },
    { left: "Words allow", right: "to explore" },
    { left: "Typography is", right: "to express" },
    { left: "Interfaces are", right: "to interact" },
    { left: "Click is", right: "to trigger" },
    { left: "Code is", right: "to build" },
    { left: "Physics are", right: "to simulate" },
    { left: "Gaps are", right: "to fill" },
    { left: "Design is", right: "to communicate" },
    { left: "Stay curious", right: "to discover" },
  ];

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="w-full h-full flex flex-col justify-center items-center bg-black cursor-none select-none overflow-hidden"
    >
      <div className="flex flex-col items-center space-y-0 relative">
        {lines.map((line, i) => {
          const lineRef = React.useRef<HTMLDivElement>(null);
          const [lineY, setLineY] = useState(0);

          React.useEffect(() => {
            if (lineRef.current) {
              setLineY(lineRef.current.offsetTop + lineRef.current.offsetHeight / 2);
            }
          }, []);

          const distance = Math.abs(mouseY - lineY);
          const maxDistance = 150;
          const strength = 1 - Math.min(distance / maxDistance, 1);
          const gap = 5 + strength * 140; 
          const scale = 1 + strength * 0.4;
          const opacity = 1.0;
          
          const color = CHIP_COLORS[i % CHIP_COLORS.length];
          const isFocussed = strength > 0.4;

          return (
            <motion.div
              key={i}
              ref={lineRef}
              animate={{ 
                height: 40 + strength * 40,
                scale: scale,
                opacity: opacity
              }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="flex items-center justify-center font-serif text-white whitespace-nowrap overflow-visible relative"
              style={{ fontSize: '24px' }}
            >
              <motion.span 
                animate={{ 
                  x: -gap,
                  backgroundColor: isFocussed ? `rgb(${color.r}, ${color.g}, ${color.b})` : "rgba(255,255,255,0)",
                  color: isFocussed ? "black" : "white",
                  padding: isFocussed ? "4px 16px" : "4px 0px",
                  borderRadius: isFocussed ? "100px" : "0px"
                }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="inline-block"
              >
                {line.left}
              </motion.span>
              
              <AnimatePresence>
                {strength > 0.6 && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5, y: distance > 0 ? 20 : -20 }}
                    animate={{ opacity: 1, scale: 1.2, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="absolute font-serif italic text-white text-[56px] z-10 pointer-events-none"
                    style={{ fontStyle: 'italic', fontFamily: 'Cormorant Garamond' }}
                  >
                    hover
                  </motion.span>
                )}
              </AnimatePresence>

              <motion.span 
                animate={{ 
                  x: gap,
                  backgroundColor: isFocussed ? `rgb(${color.r}, ${color.g}, ${color.b})` : "rgba(255,255,255,0)",
                  color: isFocussed ? "black" : "white",
                  padding: isFocussed ? "4px 16px" : "4px 0px",
                  borderRadius: isFocussed ? "100px" : "0px"
                }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="inline-block"
              >
                {line.right}
              </motion.span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
