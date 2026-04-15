import React, { useEffect, useRef } from "react";
// @ts-ignore
import { prepareWithSegments, layoutNextLine } from "@chenglou/pretext";
import scriptureImgSrc from "../images/scripture.jpeg";

const TEXT_BASE = `he era of ubiquitous computation has brought forth endless algorithms capable of generating flawless imagery, harmonious melodies, and syntactic prose at staggering speeds. 2 And the critics cried out that the brush was dead, and the canvas obsolete; and darkness was upon the face of human ingenuity. But the Spirit of human taste moved upon the face of the latent space. 3 And the Creators said, Let there be curation: and there was taste. 4 And the Creators saw the taste, that it was good: and they divided the soulless generation from the intentional art. 5 And the curators called the intentional art Masterpiece, and the synthetic noise they called Spam. And the evening and the morning were the first paradigm shift. 6 And the artists said, Let there be a clear vision in the midst of the prompts, and let it divide the derivative loops from the genuine novelties. 7 And the humans made the vision, and divided the outputs which were under their control from the outputs which were merely statistically probable: and it was so. 8 And the curators called the vision Style. And the evening and the morning were the second enlightenment. 9 And the creators said, Let the infinite outputs under the neural networks be gathered together into one refined collection, and let the human perspective appear: and it was so. 10 And the creators called the perspective Taste; and the gathering together of the algorithms called they Tools: and the artists saw that it was good. 11 And the humans said, Let the mind bring forth original thought, the soul yielding emotion, and the hand yielding craft after his kind, whose essence is in itself, upon the digital canvas: and it was so. 12 And the mind brought forth original thought, and soul yielding emotion after his kind, and the hand yielding craft, whose essence was in itself, after his kind: and humanity saw that it was good. 13 And the evening and the morning were the third iteration. 14 And the critics said, Let there be arbiters in the firmament of the culture to divide the sublime from the mediocre; and let them be for signs, and for epochs, and for days, and years: 15 And let them be for lights in the firmament of the culture to give meaning upon the earth: and it was so. 16 And the society made two great virtues; the greater virtue to rule the creation, and the lesser virtue to rule the curation: they made the tastemakers also. 17 And society set them in the firmament of the culture to give meaning upon the earth, 18 And to rule over the art and over the noise, and to divide the meaning from the emptiness: and the humans saw that it was good.`;
const LOREM = TEXT_BASE + " " + TEXT_BASE + " " + TEXT_BASE;

export default function ScriptureLayoutEffect() {
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
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const fontFamily = '"OldLondon", serif'; 
    const fontStr = `normal 24px ${fontFamily}`;
    const lineHeight = 36;

    // Wait until OldLondon font is actually loaded via CSS font-face, then prepare layout
    document.fonts.load(`20px "OldLondon"`).then(() => {
        // We do nothing specific here, but the browser will render it naturally
    });

    // Variables for layout and state
    let mouseX = -1000;
    let mouseY = -1000;
    const MOUSE_RADIUS = 120;
    let targetMouseX = -1000;
    let targetMouseY = -1000;
    
    // State management for async assets
    let isFontLoaded = false;
    let prepared: any = null;
    let isImageLoaded = false;
    let isMagnifier = false; // Toggle state: Repeller vs Magnifier
    let animationFrameId: number;

    // Robust image loading using Vite's URL constructor
    const scriptureImg = new Image();
    scriptureImg.onload = () => { isImageLoaded = true; };
    try {
      scriptureImg.src = new URL('../images/scripture.jpeg', import.meta.url).href;
    } catch (e) {
      scriptureImg.src = scriptureImgSrc;
    }

    // Async initialization with timeout for font loading
    const init = async () => {
      try {
        const fontPromise1 = document.fonts.load(`24px "OldLondon"`);
        const fontPromise2 = document.fonts.load(`24px "Newsreader"`);
        const fontPromise3 = document.fonts.load(`10px "IBM Plex Mono"`);
        const timeoutPromise = new Promise(res => setTimeout(res, 1500));
        await Promise.race([Promise.all([fontPromise1, fontPromise2, fontPromise3]), timeoutPromise]);
      } catch (e) {
        console.error("Font load error", e);
      } finally {
        isFontLoaded = true;
        prepared = prepareWithSegments(LOREM, fontStr);
      }
    };

    init();

    const getWarpedPoint = (x: number, y: number) => {
        let cx = x;
        let cy = y;

        // Only warp/repel when NOT in magnifier mode
        if (!isMagnifier) {
            const dx = cx - mouseX;
            const dy = cy - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const MOUSE_RADIUS_RULERS = MOUSE_RADIUS * 1.5;

            if (dist < MOUSE_RADIUS_RULERS) {
                const force = Math.max(0, 1 - dist / MOUSE_RADIUS_RULERS);
                const push = force * force * (MOUSE_RADIUS_RULERS * 0.5); 
                const angle = Math.atan2(dy, dx);
                cx += Math.cos(angle) * push;
                cy += Math.sin(angle) * push;
            }
        }
        return { x: cx, y: cy };
    };

    const drawBendingLine = (x1: number, y1: number, x2: number, y2: number) => {
        ctx.beginPath();
        const steps = 100;

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const pt = getWarpedPoint(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t);

            if (i === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
    };

    const drawHeader = (startY: number, addHLine: (y: number) => void) => {
        const headerFont = '"Newsreader", serif';
        // Draw the title
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = "#1c1913"; // faded black
        
        let currentY = startY;
        addHLine(currentY); // Top of header block
        
        currentY += 40;
        ctx.font = `italic 28px ${headerFont}`;
        ctx.fillText("The First Book of THE ALGORITHM,", width / 2, currentY - 20);
        addHLine(currentY);
        
        currentY += 40;
        ctx.font = `tracking-widest 14px ${headerFont}`;
        ctx.fillText("C A L L E D", width / 2, currentY - 20);
        addHLine(currentY);

        currentY += 80;
        ctx.font = `normal 75px ${headerFont}`;
        ctx.fillText("TASTE.", width / 2, currentY - 40);
        addHLine(currentY);

        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        return currentY;
    };

    const computeColumnLayout = (startXCol: number, colWidth: number, startY: number, MOUSE_RADIUS: number, colIndex: number) => {
        let cursor = { segmentIndex: 0, graphemeIndex: 0 };
        let y = startY;
        let linesData: {text: string, x: number, w: number, y: number}[] = [];

        // Reserved area for Drop Cap 'I' in col 0
        const dropCapSize = 130;
        const dropCapMargin = 15;
        const dropCapRect = { 
            x: startXCol, 
            y: startY, 
            w: dropCapSize + dropCapMargin, 
            h: dropCapSize + dropCapMargin 
        };

        while (true) {
          const lineCenterY = y + lineHeight / 2;
          let blockedAreas: {left: number, right: number}[] = [];

          // 1. Check Drop Cap block
          if (colIndex === 0 && lineCenterY >= dropCapRect.y && lineCenterY <= dropCapRect.y + dropCapRect.h) {
              blockedAreas.push({ left: dropCapRect.x, right: dropCapRect.x + dropCapRect.w });
          }

          // 2. Check Mouse block - ONLY if NOT in magnifier mode
          if (!isMagnifier) {
              const dy = Math.abs(lineCenterY - mouseY);
              if (dy < MOUSE_RADIUS) {
                const dx = Math.sqrt(MOUSE_RADIUS * MOUSE_RADIUS - dy * dy);
                blockedAreas.push({ left: mouseX - dx - 20, right: mouseX + dx + 20 });
              }
          }

          // Merge and compute gaps
          const colEnd = startXCol + colWidth;
          let gaps: { x: number, w: number }[] = [];
          
          if (blockedAreas.length > 0) {
              // Sort blocks left to right
              blockedAreas.sort((a, b) => a.left - b.left);
              
              let currentLeft = startXCol;
              for (const b of blockedAreas) {
                  if (b.left > currentLeft) {
                      gaps.push({ x: currentLeft, w: b.left - currentLeft });
                  }
                  currentLeft = Math.max(currentLeft, b.right);
              }
              if (currentLeft < colEnd) {
                  gaps.push({ x: currentLeft, w: colEnd - currentLeft });
              }
          } else {
              gaps.push({ x: startXCol, w: colWidth });
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
                linesData.push({ text: line.text, x: gap.x, w: gap.w, y });
             }
             cursor = line.end;
          }

          if (finishedText) break;
          y += lineHeight;
          if (y > height + 100) break;
        }

        return linesData;
    };

    const drawEverything = (isZoomPass = false) => {
      const marginX = width * 0.15;
      const contentWidth = width - (marginX * 2);
      const colGap = 40;
      const colWidth = (contentWidth - colGap) / 2;
      const startX1 = marginX;
      const startX2 = startX1 + colWidth + colGap;

      const headerTopY = 60;
      let imagePlaceholderHeight = 250; 
      if (isImageLoaded || scriptureImg.complete) {
          const ratio = scriptureImg.naturalHeight / scriptureImg.naturalWidth;
          imagePlaceholderHeight = contentWidth * ratio;
      }

      ctx.strokeStyle = "rgba(180, 60, 40, 0.4)";
      ctx.lineWidth = 1;

      const hLines: number[] = [];
      const vLines: number[] = [];
      const addHLine = (y: number) => { hLines.push(y); drawBendingLine(0, y, width, y); };
      const addVLine = (x: number) => { vLines.push(x); drawBendingLine(x, 0, x, height); };

      addVLine(startX1 - 40);         
      addVLine(startX1);         
      addVLine(startX2 + colWidth);  
      addVLine(startX2 + colWidth + 40);  
      addVLine(startX1 + colWidth + (colGap/2)); 

      addHLine(headerTopY);
      addHLine(headerTopY + imagePlaceholderHeight);

      if (isImageLoaded || scriptureImg.complete) {
          ctx.drawImage(scriptureImg, startX1, headerTopY, contentWidth, imagePlaceholderHeight);
      } else {
          ctx.fillStyle = "rgba(180, 60, 40, 0.1)";
          ctx.fillRect(startX1, headerTopY, contentWidth, imagePlaceholderHeight);
      }

      const contentStartY = drawHeader(headerTopY + imagePlaceholderHeight + 20, addHLine);

      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = "#1e1b15";
      ctx.font = fontStr;

      const linesCol1 = computeColumnLayout(startX1, colWidth, contentStartY, MOUSE_RADIUS, 0);
      const linesCol2 = computeColumnLayout(startX2, colWidth, contentStartY, MOUSE_RADIUS, 1);

      // Height sync: only on main pass
      if (!isZoomPass) {
          const maxTextY = Math.max(
              linesCol1.length > 0 ? linesCol1[linesCol1.length - 1].y + lineHeight : 0,
              linesCol2.length > 0 ? linesCol2[linesCol2.length - 1].y + lineHeight : 0
          );
          const targetCanvasHeight = Math.max(container.clientHeight, maxTextY + 100);
          if (Math.abs(height - targetCanvasHeight) > 50) {
              height = targetCanvasHeight;
              canvas.height = height * dpr;
              ctx.scale(dpr, dpr);
              canvas.style.height = `${height}px`;
          }
      }

      const dropCapX = startX1;
      const dropCapY = contentStartY;
      ctx.strokeStyle = "#1e1b15";
      ctx.lineWidth = 1.5;
      
      let dCx = dropCapX;
      let dCy = dropCapY;
      
      if (!isMagnifier) {
          const dxDC = (dCx + 65) - mouseX;
          const dyDC = (dCy + 65) - mouseY;
          const distDC = Math.sqrt(dxDC*dxDC + dyDC*dyDC);
          if (distDC < MOUSE_RADIUS) {
              const push = (MOUSE_RADIUS - distDC) * 0.2;
              const a = Math.atan2(dyDC, dxDC);
              dCx += Math.cos(a) * push;
              dCy += Math.sin(a) * push;
          }
      }

      ctx.strokeRect(dCx, dCy, 130, 130);
      ctx.fillStyle = "rgba(0,0,0,0.02)";
      ctx.fillRect(dCx, dCy, 130, 130);
      
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `normal 120px "Newsreader", serif`;
      ctx.fillStyle = "#1e1b15";
      ctx.fillText("T", dCx + 65, dCy + 65);

      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.font = fontStr;
      
      for (const line of linesCol1) ctx.fillText(line.text, line.x, line.y);
      for (const line of linesCol2) ctx.fillText(line.text, line.x, line.y);

      // Metrics
      ctx.fillStyle = "rgba(180, 60, 40, 0.6)";
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      hLines.sort((a, b) => a - b);
      vLines.sort((a, b) => a - b);

      for (let i = 0; i < hLines.length - 1; i++) {
          const y1 = hLines[i], y2 = hLines[i+1], dist = Math.abs(y2 - y1);
          if (dist > 15) { 
             const ptL = getWarpedPoint(startX1 - 40, (y1+y2)/2);
             ctx.fillText(`${Math.round(dist)}`, ptL.x, ptL.y);
             const ptR = getWarpedPoint(startX2 + colWidth + 40, (y1+y2)/2);
             ctx.fillText(`${Math.round(dist)}`, ptR.x, ptR.y);
          }
      }
      for (let i = 0; i < vLines.length - 1; i++) {
          const x1 = vLines[i], x2 = vLines[i+1], dist = Math.abs(x2 - x1);
          if (dist > 25) {
             const ptT = getWarpedPoint((x1+x2)/2, headerTopY - 20);
             ctx.fillText(`${Math.round(dist)}`, ptT.x, ptT.y);
             const ptB = getWarpedPoint((x1+x2)/2, height - 20);
             ctx.fillText(`${Math.round(dist)}`, ptB.x, ptB.y);
          }
      }
    };

    const render = () => {
      const dx = targetMouseX - mouseX;
      const dy = targetMouseY - mouseY;
      mouseX += dx * 0.15;
      mouseY += dy * 0.15;

      ctx.fillStyle = "#EAE3CD"; 
      ctx.fillRect(0, 0, width, height);
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, "rgba(255, 235, 180, 0.05)");
      grad.addColorStop(1, "rgba(0,0,0, 0.1)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      if (!isFontLoaded || !prepared) {
          ctx.fillStyle = "#1e1b15";
          ctx.font = `italic 20px "Newsreader", serif`;
          ctx.textAlign = "center";
          ctx.fillText("Loading Scripture Layout...", width/2, height/2);
          animationFrameId = requestAnimationFrame(render);
          return;
      }

      // 1. BASE PASS
      drawEverything(false);

      // 2. MAGNIFIER PASS
      if (isMagnifier && mouseX > -500) {
          ctx.save();
          // Circular clip
          ctx.beginPath();
          ctx.arc(mouseX, mouseY, MOUSE_RADIUS, 0, Math.PI * 2);
          ctx.clip();

          // Magnified draw
          const zoom = 1.6;
          ctx.translate(mouseX, mouseY);
          ctx.scale(zoom, zoom);
          ctx.translate(-mouseX, -mouseY);
          
          // Clear background inside clip to avoid ghosting
          ctx.fillStyle = "#EAE3CD";
          ctx.fillRect(mouseX - MOUSE_RADIUS, mouseY - MOUSE_RADIUS, MOUSE_RADIUS*2, MOUSE_RADIUS*2);
          
          drawEverything(true);
          ctx.restore();

              // Red Bezel (Updated from grey)
              ctx.beginPath();
              ctx.arc(mouseX, mouseY, MOUSE_RADIUS, 0, Math.PI * 2);
              const bezel = ctx.createRadialGradient(mouseX, mouseY, MOUSE_RADIUS * 0.85, mouseX, mouseY, MOUSE_RADIUS);
              bezel.addColorStop(0, "rgba(180, 60, 40, 0)");
              bezel.addColorStop(0.7, "rgba(180, 60, 40, 0.1)");
              bezel.addColorStop(1, "rgba(180, 60, 40, 0.4)");
              ctx.strokeStyle = bezel;
              ctx.lineWidth = 8;
              ctx.stroke();

              // Solid Red Inner Border
              ctx.beginPath();
              ctx.arc(mouseX, mouseY, MOUSE_RADIUS, 0, Math.PI * 2);
              ctx.strokeStyle = "rgba(180, 60, 40, 0.6)";
              ctx.lineWidth = 2;
              ctx.stroke();

              // Concave Optical Effect (Inner Shadow)
              const concave = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, MOUSE_RADIUS);
              concave.addColorStop(0, "rgba(0,0,0,0.08)"); // Darker center
              concave.addColorStop(0.5, "rgba(0,0,0,0.03)");
              concave.addColorStop(1, "rgba(0,0,0,0)"); // Fades to edge
              ctx.fillStyle = concave;
              ctx.beginPath();
              ctx.arc(mouseX, mouseY, MOUSE_RADIUS, 0, Math.PI * 2);
              ctx.fill();

              // Glass shine
              ctx.beginPath();
              ctx.arc(mouseX, mouseY, MOUSE_RADIUS * 0.96, -Math.PI/4, -Math.PI/2, true);
              ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
              ctx.lineWidth = 3;
              ctx.stroke();
          } else {
              // REPELLER MODE: Advanced "Surveyor" Lens Details
              const ringRotation = Date.now() * 0.001;
              
              // 1. Primary Force Ring (Thicker)
              ctx.beginPath();
              ctx.arc(mouseX, mouseY, MOUSE_RADIUS, 0, Math.PI * 2);
              ctx.strokeStyle = "rgba(180, 60, 40, 0.4)";
              // @ts-ignore
              if (ctx.setLineDash) ctx.setLineDash([8, 12]);
              ctx.lineWidth = 2;
              ctx.stroke();
              // @ts-ignore
              if (ctx.setLineDash) ctx.setLineDash([]); 

              // 2. Rotating Degree Ring (Thicker)
              ctx.save();
              ctx.translate(mouseX, mouseY);
              ctx.rotate(ringRotation);
              ctx.strokeStyle = "rgba(180, 60, 40, 0.35)";
              ctx.lineWidth = 2;
              for (let i = 0; i < 8; i++) {
                  ctx.rotate(Math.PI / 4);
                  ctx.beginPath();
                  ctx.moveTo(MOUSE_RADIUS - 12, 0); 
                  ctx.lineTo(MOUSE_RADIUS + 8, 0);
                  ctx.stroke();
              }
              ctx.restore();

              // 3. Central Crosshair (Thicker)
              ctx.beginPath();
              ctx.moveTo(mouseX - 15, mouseY); ctx.lineTo(mouseX + 15, mouseY);
              ctx.moveTo(mouseX, mouseY - 15); ctx.lineTo(mouseX, mouseY + 15);
              ctx.strokeStyle = "rgba(180, 60, 40, 0.6)"; 
              ctx.lineWidth = 2;
              ctx.stroke();

              // 4. Live Coordinate Readout (INTERNAL & IBM PLEX MONO)
              ctx.fillStyle = "rgba(180, 60, 40, 0.9)";
              ctx.font = "bold 9px 'IBM Plex Mono', monospace";
              ctx.textAlign = "left";
              ctx.textBaseline = "top";
              ctx.fillText(`X:${Math.round(mouseX)}`, mouseX + 8, mouseY + 8);
              ctx.fillText(`Y:${Math.round(mouseY)}`, mouseX + 8, mouseY + 20);
              
              // 5. Outer Faint Halo
              ctx.beginPath();
              ctx.arc(mouseX, mouseY, MOUSE_RADIUS * 1.5, 0, Math.PI * 2);
              ctx.strokeStyle = "rgba(180, 60, 40, 0.08)"; 
              ctx.lineWidth = 1;
              ctx.stroke();
          }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
    };

    // Also check for window-level overrides from the overlay
    const mouseSyncLoop = () => {
        // @ts-ignore
        if (window.__scriptureMouseX !== undefined) {
             // @ts-ignore
            targetMouseX = window.__scriptureMouseX;
             // @ts-ignore
            targetMouseY = window.__scriptureMouseY;
        }
        requestAnimationFrame(mouseSyncLoop);
    };
    mouseSyncLoop();

    const handleMouseLeave = () => {
      targetMouseX = -1000;
      targetMouseY = -1000;
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

    const handleClick = () => {
        isMagnifier = !isMagnifier;
        if (container) {
            container.style.cursor = isMagnifier ? 'zoom-in' : 'crosshair';
        }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('click', handleClick);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col font-serif" style={{ fontFamily: '"OldLondon", serif' }}>
      <div 
        ref={containerRef} 
        className="flex-1 w-full h-full relative overflow-y-auto bg-[#EAE3CD] cursor-crosshair"
        onMouseMove={(e) => {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (rect) {
                // @ts-ignore
                window.__scriptureMouseX = e.clientX - rect.left;
                // @ts-ignore
                window.__scriptureMouseY = e.clientY - rect.top;
            }
        }} 
        onMouseLeave={() => {
            // @ts-ignore
            window.__scriptureMouseX = -1000;
            // @ts-ignore
            window.__scriptureMouseY = -1000;
        }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 z-10 block pointer-events-none" />
      </div>
    </div>
  );
}
