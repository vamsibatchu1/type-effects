import React, { useEffect, useRef } from "react";
// @ts-ignore - The types might be missing depending on package configuration
import { prepareWithSegments, layoutNextLine } from "@chenglou/pretext";

const LOREM_MAIN = `For decades, the web has been fundamentally bound by the constraints of the Document Object Model. Every time a complex layout changes, the browser is forced to immediately calculate constraints, reflow boundaries, and traverse a massive structural tree of hierarchical nodes. The DOM is incredibly powerful, but it was historically designed for static document routing, not for highly reactive geometric canvases or uncompromising mathematical visualizations. 

Enter the Pretext engine. By surgically decoupling text measurement from rigid CSS styling, we finally unlock the ability to orchestrate fluid typography exactly like any other low-level raw graphical asset. We bypass the browser's expensive layout thrashing cycle entirely, performing raw deterministic constraint calculations via pure TypeScript. The text you are reading right now does not technically "exist" as HTML nodes. It is dynamically evaluated, mathematically sliced, and routed precisely into the available visual gaps avoiding the sphere, rasterized in real-time onto a Canvas at a flawless 120 frames per second. 

This unlocks entirely new paradigms for creative coding and high-performance user interface architecture. Virtualization becomes completely trivial because row heights are mathematically exact well before they ever require painting. Complex interactive geometries—like the spherical repeller magnetically pushing these very characters seamlessly out of its path—require absolutely zero expensive shape-outside CSS hacks or legacy float manipulations. The browser simply acts as a lightning-fast display target, blurring the distinct boundary between robust structural typography and cinematic computational graphics. We can finally imagine native web environments limited exclusively by our algorithmic imagination. `.repeat(3);

const LOREM_SUB = `A PARADIGM FOR VIRTUALIZATION. When typography is treated as computational data rather than rigid DOM elements, traditional performance bottlenecks simply evaporate. Bypassing getBoundingClientRect completely prevents synchronous layout thrashing, meaning massive data sets can be parsed flawlessly off the main execution thread. 

120FPS DYNAMIC REFLOW. Notice how the text wrapping around the interactive repeller bubble isn't staggered or jagged. The geometric intersection boundaries are evaluated mathematically per-line on every single requestAnimationFrame cycle, effortlessly splitting horizontal rows into perfectly aligned typographic gaps in less than a millisecond. 

SHATTERING THE LAYOUT. Because we fully own the exact measurement and sizing layer, we can easily treat words as literal independent physical bodies. By clicking the screen, the Pretext engine seamlessly passes its final positional coordinates directly into a discrete 2D rigid-body logic structure, instantly transforming static sentences into interactive cascading particles governed purely by velocity, momentum, and gravity. `.repeat(4);

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
    const fontFamily = '"Newsreader", serif'; 
    
    const fontStrMain = `normal 32px ${fontFamily}`;
    const mainLineHeight = 40;
    
    const fontStrSub = `normal 15px ${fontFamily}`;
    const subLineHeight = 22;
    
    // 1. PRETEXT PREPARATION PASS
    const preparedMain = prepareWithSegments(LOREM_MAIN, fontStrMain);
    const preparedSub = prepareWithSegments(LOREM_SUB, fontStrSub);

    let mouseX = -1000;
    let mouseY = -1000;
    const RADIUS = 140; // The radius of our interactive repeller

    // Interaction states
    let ripples: {x: number, y: number, radius: number, speed: number, intensity: number, isTrigger: boolean}[] = [];
    let animationFrameId: number;

    // Gravity state 
    let isGravityMode = false;
    let physicsBodies: {text: string, fontStr: string, width: number, x: number, y: number, vx: number, vy: number, angle: number, vangle: number, delayFrames: number}[] = [];

    // Unified helper for mathematically resolving dynamic column bounds avoiding the sphere
    const computeColumnLayout = (prepared: any, startXCol: number, colWidth: number, lineHeight: number) => {
        let cursor = { segmentIndex: 0, graphemeIndex: 0 };
        let y = 60;
        let linesRenderData: {text: string, gap: {x: number, w: number}, y: number}[] = [];
        const bubbleMargin = 30;

        while (true) {
          let gaps: { x: number, w: number }[] = [];
          const lineCenterY = y + lineHeight / 2;
          const dy = Math.abs(lineCenterY - mouseY);
          const colEnd = startXCol + colWidth;

          if (dy < RADIUS) {
            const dx = Math.sqrt(RADIUS * RADIUS - dy * dy);
            const blockedLeft = mouseX - dx - bubbleMargin;
            const blockedRight = mouseX + dx + bubbleMargin;
            
            if (blockedLeft <= startXCol && blockedRight >= colEnd) {
                // completely blocked row
            } else if (blockedLeft > colEnd || blockedRight < startXCol) {
                gaps.push({ x: startXCol, w: colWidth });
            } else {
                if (blockedLeft > startXCol) {
                    gaps.push({ x: startXCol, w: blockedLeft - startXCol });
                }
                if (blockedRight < colEnd) {
                    gaps.push({ x: Math.max(blockedRight, startXCol), w: colEnd - Math.max(blockedRight, startXCol) });
                }
            }
          } else {
            gaps.push({ x: startXCol, w: colWidth });
          }

          if (gaps.length === 0) {
             y += lineHeight;
             if (y > height + 100) break;
             continue;
          }

          let finishedText = false;
          for (const gap of gaps) {
             if (gap.w < 20) continue; 
             const line = layoutNextLine(prepared, cursor, gap.w);
             if (line === null) {
                finishedText = true;
                break;
             }
             if (line.text.trim().length > 0) {
                linesRenderData.push({ text: line.text, gap, y });
             }
             cursor = line.end;
          }
          if (finishedText) break;
          y += lineHeight;
          if (y > height + 100) break;
        }
        return linesRenderData;
    };

    const triggerGravity = () => {
      isGravityMode = true;
      physicsBodies = [];
      let globalWordIndex = 0;
      
      const linesMain = computeColumnLayout(preparedMain, width * 0.35, width * 0.55, mainLineHeight);
      const linesSub = computeColumnLayout(preparedSub, width * 0.05, width * 0.22, subLineHeight);

      const spawnBodies = (lines: any[], fontStr: string, isRightAligned: boolean) => {
        ctx.font = fontStr;
        for (const lineObj of lines) {
          let startX = lineObj.gap.x;
          if (isRightAligned) {
             startX = lineObj.gap.x + lineObj.gap.w - ctx.measureText(lineObj.text).width;
          }
          
          let currentX = startX;
          const words = lineObj.text.split(/(\s+)/);
          for (let i = 0; i < words.length; i++) {
             const word = words[i];
             const wordWidth = ctx.measureText(word).width;
             if (word.trim().length > 0) {
                physicsBodies.push({
                   text: word, fontStr, width: wordWidth,
                   x: currentX, y: lineObj.y,
                   vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 1.5) * 4,
                   angle: 0, vangle: 0, delayFrames: Math.floor(globalWordIndex * 0.05)
                });
                globalWordIndex++;
             }
             currentX += wordWidth;
          }
        }
      };

      spawnBodies(linesMain, fontStrMain, false);
      spawnBodies(linesSub, fontStrSub, true); 
    };

    const render = () => {
      // Clear background
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#4F2C23'; // Dark brown background 
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

      ctx.fillStyle = '#B893DE'; // Purple text color 
      ctx.textBaseline = 'top';

      if (!isGravityMode) {
        
        const linesMain = computeColumnLayout(preparedMain, width * 0.35, width * 0.55, mainLineHeight);
        const linesSub = computeColumnLayout(preparedSub, width * 0.05, width * 0.22, subLineHeight);

        const renderLines = (lines: any[], fontStr: string, isRightAligned: boolean) => {
          ctx.font = fontStr;
          for (const lineObj of lines) {
             let startX = lineObj.gap.x;
             if (isRightAligned) {
                startX = lineObj.gap.x + lineObj.gap.w - ctx.measureText(lineObj.text).width;
             }
             let renderX = startX;
             let renderY = lineObj.y;
             
             // Apply ripple
             for (const r of ripples) {
                 const lineCenterX = lineObj.gap.x + lineObj.gap.w/2;
                 const lineCenterY = lineObj.y + 15;
                 const dxRip = lineCenterX - r.x;
                 const dyRip = lineCenterY - r.y;
                 const dist = Math.sqrt(dxRip*dxRip + dyRip*dyRip);
                 if (Math.abs(dist - r.radius) < 120) {
                    const phase = (Math.abs(dist - r.radius) / 120) * Math.PI;
                    const amplitude = Math.sin(phase) * 18 * r.intensity;
                    const angle = Math.atan2(dyRip, dxRip);
                    renderX += Math.cos(angle) * amplitude;
                    renderY += Math.sin(angle) * amplitude;
                 }
             }
             ctx.fillText(lineObj.text, renderX, renderY);
          }
        };

        renderLines(linesMain, fontStrMain, false); // Standard alignment
        renderLines(linesSub, fontStrSub, true); // Right aligned sub-column

      } else {
        // 3. HIGH PERFORMANCE GRAVITY PHYSICS
        let currentFont = "";
        
        for (const body of physicsBodies) {
           // Synchronize Context API state minimally
           if (currentFont !== body.fontStr) {
               ctx.font = body.fontStr;
               currentFont = body.fontStr;
           }

           // Handle sequential delay stagger
           if (body.delayFrames > 0) {
              body.delayFrames--;
              ctx.fillText(body.text, body.x, body.y);
              continue;
           }

           if (body.vy !== 0 || body.vx !== 0) {
              body.vy += 0.8; // Gravity
              body.vx *= 0.99; // Air resistance
              body.vy *= 0.99; // Terminal velocity cap
              
              body.x += body.vx;
              body.y += body.vy;

              if (body.y > height - 36) {
                body.y = height - 36;
                body.vy *= -0.3; // Bounce dampening
                body.vx *= 0.7; // Rubbing friction
                
                if (Math.abs(body.vy) < 0.2) body.vy = 0;
                if (Math.abs(body.vx) < 0.2) body.vx = 0;
              }
           }

           ctx.fillText(body.text, body.x, body.y);
        }
      }

      // Render ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += r.speed;
        r.intensity *= 0.988; 
        
        ctx.beginPath();
        ctx.arc(r.x, r.y, Math.max(0, r.radius), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(184, 147, 222, ${0.4 * r.intensity})`; 
        ctx.lineWidth = 2 + (5 * r.intensity);
        ctx.stroke();

        if (r.intensity < 0.01) {
          if (r.isTrigger && !isGravityMode) {
             triggerGravity();
          }
          ripples.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };
    
    const handleClick = (e: MouseEvent) => {
      if (isGravityMode) {
         isGravityMode = false;
         physicsBodies = [];
         return;
      }
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      ripples.push({x: cx, y: cy, radius: 0, speed: 10, intensity: 1, isTrigger: true});
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
    canvas.addEventListener('click', handleClick);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-[#4F2C23] text-[#B893DE] font-serif" style={{ fontFamily: '"Newsreader", serif' }}>
      <div ref={containerRef} className="flex-1 w-full h-full relative overflow-hidden cursor-crosshair">
        <canvas ref={canvasRef} className="absolute inset-0 z-10 block" />
      </div>
    </div>
  );
}
