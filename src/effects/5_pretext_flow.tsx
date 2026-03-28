import React, { useEffect, useRef } from "react";
// @ts-ignore - The types might be missing depending on package configuration
import { prepareWithSegments, layoutNextLine } from "@chenglou/pretext";

const LOREM_TEXT = `My dear front-end developers (and anyone who is interested in the future of interfaces): I have crawled through depths of hell to bring you, for the foreseeable years, one of the more important foundational pieces of UI engineering. 

This text you are reading right now is not laid out by the browser's DOM. It is completely pre-calculated using pure TypeScript arithmetic and rendered to a Canvas element. Notice how as you move your cursor, the text flawlessly wraps around the repeller bubble. Doing this with standard HTML/CSS would cause massive layout thrashing and frame drops. 

Here, we completely bypass the DOM's measurement cycle and calculate the exact text boundaries line by line on every single frame. This unlocks new paradigms for virtualization, masonry layouts, and text wrapping in Canvas or WebGL environments without ever suffering from the performance penalties of getBoundingClientRect or offsetHeight. 

Move your cursor around to witness 120fps text reflowing, driven purely by JavaScript! 

` + `We can keep repeating this text to fill out the page. Once you abstract away the constraints of standard CSS multiline measurement, you begin to imagine a future where the browser is simply a fast paint target, and complex application logic handles the math. Virtualization becomes trivial because you no longer need placeholder heights—you mathematically know exactly where every word is before it mounts. That's the power of Cheng Lou's Pretext engine. `.repeat(15);

export default function PretextFlowEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = container.clientWidth;
    let height = container.clientHeight;
    
    // High DPI display support
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Styling configuration
    const fontSize = 28; // Increased font size for dramatic impact
    const lineHeight = 36;
    const fontFamily = '"Playfair Display", serif'; 
    const fontStr = `italic ${fontSize}px ${fontFamily}`;
    
    // 1. PRETEXT PREPARATION PASS
    // One time operation - computes widths using a hidden canvas context internally.
    const prepared = prepareWithSegments(LOREM_TEXT, fontStr);

    let mouseX = -1000;
    let mouseY = -1000;
    const RADIUS = 140; // The radius of our interactive repeller

    let animationFrameId: number;

    const render = () => {
      // Clear background
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#4F2C23'; // Dark brown background from image
      ctx.fillRect(0, 0, width, height);

      // Draw the interactive repeller bubble (Glassmorphism circle)
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, RADIUS - 20, 0, Math.PI * 2);
      
      const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, RADIUS);
      gradient.addColorStop(0, 'rgba(184, 147, 222, 0.4)'); // Purple glow
      gradient.addColorStop(0.5, 'rgba(184, 147, 222, 0.1)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fill();

      // Configure text rendering
      ctx.font = fontStr;
      ctx.fillStyle = '#B893DE'; // Purple text color from image
      ctx.textBaseline = 'top';

      // 2. PRETEXT DYNAMIC ROUTING PASS
      // Initialize cursors for pretext's layoutNextLine
      let cursor = { segmentIndex: 0, graphemeIndex: 0 };
      let y = 60; // top padding
      const columnPadding = 60;

      while (true) {
        let availableWidth = width - (columnPadding * 2);
        let startX = columnPadding;

        // Check horizontal intersection with our mouse circle sphere
        const lineCenterY = y + lineHeight / 2;
        const dy = Math.abs(lineCenterY - mouseY);

        // If the line falls within the vertical bounds of the bubble
        if (dy < RADIUS) {
          // Pythagorean theorem to find horizontal intersection boundaries
          const dx = Math.sqrt(RADIUS * RADIUS - dy * dy);
          
          if (mouseX > width / 2) {
            // Mouse is on the right side of the screen - shrink available width
            const rightBound = mouseX - dx - 30; // 30px padding from bubble edge
            if (rightBound > startX) {
               availableWidth = rightBound - startX;
            } else {
               availableWidth = 0; // Completely blocked
            }
          } else {
            // Mouse is on the left side of the screen - shift startX rightward
            const leftBound = mouseX + dx + 30;
            if (leftBound < width - columnPadding) {
              startX = leftBound;
              availableWidth = width - columnPadding - startX;
            } else {
              availableWidth = 0;
            }
          }
        }

        // Just in case width calculates negative due to extreme resizing
        if (availableWidth <= 0) availableWidth = 0;

        // Bypassing the DOM perfectly calculating width arithmetic purely in JS
        const line = layoutNextLine(prepared, cursor, availableWidth);
        
        // Null signifies we reached the end of the text paragraph
        if (line === null) break;

        // Render the pre-calculated slice text onto Canvas!
        if (availableWidth > 0 && line.text.trim().length > 0) {
           ctx.fillText(line.text, startX, y);
        }
        
        // Advance cursor
        cursor = line.end;
        y += lineHeight;

        // Break if we rendered past the visible screen (simple occlusion culling)
        if (y > height + 100) break;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      // Calculate perfect local coords
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      // Park the mouse way off screen smoothly
      mouseX = -1000;
      mouseY = -1000;
    };

    const handleResize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-[#4F2C23] text-[#B893DE] font-serif" style={{ fontFamily: '"Playfair Display", serif' }}>
      <div ref={containerRef} className="flex-1 w-full h-full relative overflow-hidden cursor-crosshair">
        <canvas ref={canvasRef} className="absolute inset-0 z-10 block" />
      </div>
    </div>
  );
}
