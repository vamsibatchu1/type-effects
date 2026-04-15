import React from 'react';
import { motion } from 'framer-motion';

const RAW_BINARY = Array(400).fill(0).map(() => Math.floor(Math.random() * 2)).join("");
const POLISHED_STRING = "Welcome to the seventh experiment. We are exploring the intersection of raw data and polished typography. Watch as the digital noise transforms into a clear stream of consciousness.";

// Create very long strings to ensure seamless streaming streaming visually
const LONG_RAW = Array(5).fill(RAW_BINARY).join("\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0");
const LONG_POLISHED = Array(15).fill(POLISHED_STRING).join("\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0");

const PILL_BARS = 9;
const waveforms = [
  [30, 70, 30, 90, 40],
  [50, 90, 50, 100, 60],
  [70, 100, 60, 80, 50],
  [90, 50, 100, 60, 90],
  [100, 70, 80, 50, 100],
  [80, 40, 90, 40, 80],
  [60, 80, 50, 90, 60],
  [40, 60, 30, 70, 40],
  [30, 50, 20, 50, 30],
];

const AudioPill = () => {
    return (
        <div className="relative flex items-center justify-center bg-[#FFF9C4] rounded-full h-[100px] py-[22px] px-10 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)] gap-[5px] border-[4px] border-[#FF8C00] z-50 min-w-[200px]">
            {Array.from({ length: PILL_BARS }).map((_, i) => (
                <div key={i} className="h-full flex items-center">
                    <motion.div
                        className="w-[7px] bg-[#1A1A1A] rounded-full"
                        animate={{
                            height: waveforms[i % 9].map(h => `${h}%`)
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 1.5,
                            ease: "easeInOut",
                            delay: i * 0.05
                        }}
                    />
                </div>
            ))}
        </div>
    );
};

export default function WavyTextEffect() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center font-sans overflow-hidden relative selection:bg-purple-200 selection:text-purple-900 bg-[#F0F0FF]">
      {/* Hand-drawn Grid Background */}
      <div 
        className="absolute inset-0 z-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(to right, #9382FF 2px, transparent 2px),
            linear-gradient(to bottom, #9382FF 2px, transparent 2px)
          `,
          backgroundSize: "60px 60px",
          filter: "url(#crayonEffect)"
        }}
      />
      
      {/* Paper Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply z-0" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')" }} />

      <svg className="absolute w-0 h-0 overflow-hidden pointer-events-none">
        <defs>
          <filter id="crayonEffect" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      

      {/* Center Flow Container */}
      <div className="relative w-full h-[400px] flex items-center justify-center mt-20 max-w-[1200px] 2xl:max-w-[1600px] mx-auto">
        
        {/* LEFT STREAM: RAW TEXT ON INVISIBLE WAVE */}
        <div 
          className="absolute left-0 w-1/2 h-full overflow-hidden"
          style={{ 
            maskImage: "linear-gradient(to right, transparent 0%, black 20%, black 100%)",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 20%, black 100%)"
          }}
        >
          <svg width="2000" height="400" viewBox="0 0 2000 400" className="absolute right-0 top-1/2 -translate-y-1/2">
             <path 
                id="leftWave"
                d="M 0 200 Q 200 300, 400 200 T 800 200 T 1200 200 T 1600 200 T 2000 200"
                fill="none"
                stroke="none"
             />
             <text fill="#A3A3A3" fontSize="22" fontWeight="400" dominantBaseline="middle" alignmentBaseline="middle" letterSpacing="0.05em" className="font-ibm-mono" dy="0.1em">
                 <motion.textPath 
                     href="#leftWave" 
                     animate={{ startOffset: [-8000, 0] }}
                     transition={{ repeat: Infinity, duration: 160, ease: "linear" }}
                 >
                     {LONG_RAW}
                 </motion.textPath>
             </text>
          </svg>
        </div>

        {/* THE PILL */}
        <div className="relative z-50">
          <AudioPill />
        </div>

        {/* RIGHT STREAM: POLISHED TEXT IN SOLID WAVE PIPELINE */}
        <div 
          className="absolute right-0 w-1/2 h-full overflow-hidden"
          style={{ 
            maskImage: "linear-gradient(to right, black 0%, black 80%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to right, black 0%, black 80%, transparent 100%)"
          }}
        >
          <svg width="2000" height="400" viewBox="0 0 2000 400" className="absolute left-0 top-1/2 -translate-y-1/2">
             <path 
                id="rightWave"
                d="M 0 200 Q 200 100, 400 200 T 800 200 T 1200 200 T 1600 200 T 2000 200"
                fill="none"
                stroke="#1A1A1A"
                strokeWidth="56"
                strokeLinecap="round"
             />
             <text fill="#ffffff" fontSize="24" fontWeight="500" dominantBaseline="middle" alignmentBaseline="middle" letterSpacing="-0.01em" className="font-sans" dy="0.1em">
                 <motion.textPath 
                     href="#rightWave" 
                     animate={{ startOffset: [-8000, 0] }}
                     transition={{ repeat: Infinity, duration: 140, ease: "linear" }}
                 >
                     {LONG_POLISHED}
                 </motion.textPath>
             </text>
          </svg>
        </div>

      </div>

    </div>
  );
}
