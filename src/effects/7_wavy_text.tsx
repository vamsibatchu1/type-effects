import React from 'react';
import { motion } from 'framer-motion';

const RAW_BINARY = Array(400).fill(0).map(() => Math.floor(Math.random() * 2)).join("");
const POLISHED_STRING = "Welcome to the seventh experiment. We are exploring the intersection of raw data and polished typography. Watch as the digital noise transforms into a clear stream of consciousness.";

// Create very long strings to ensure seamless streaming visually
const LONG_RAW = Array(5).fill(RAW_BINARY).join("\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0");

// Reverse word order so it feeds logically into the document
const REVERSED_POLISHED = POLISHED_STRING.replace(/\./g, "").split(" ").reverse().join(" ");
const LONG_POLISHED = Array(15).fill(REVERSED_POLISHED).join("\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0");

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

const TypewriterText = ({ text, onType, isLive }: { text: string, onType?: (idx: number) => void, isLive: boolean }) => {
  const [displayText, setDisplayText] = React.useState("");
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (onType) onType(index);
  }, [index, onType]);

  React.useEffect(() => {
    if (text.length < index || (isLive && text === "")) {
       setDisplayText("");
       setIndex(0);
       return;
    }
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(text.slice(0, index + 1));
        setIndex(index + 1);
      }, 45);
      return () => clearTimeout(timeout);
    } else if (!isLive) {
      const timeout = setTimeout(() => {
        setDisplayText("");
        setIndex(0);
      }, 4000);
      return () => clearTimeout(timeout);
    }
  }, [index, text, isLive]);

  return (
    <>
      {displayText}
      <span className="inline-block w-[6px] h-[0.9em] bg-[#1a1a1a] ml-[2px] align-baseline animate-cursor" />
    </>
  );
};

const PaperFeeder = ({ text, isLive }: { text: string, isLive: boolean }) => {
  const [typeIndex, setTypeIndex] = React.useState(0);

  const charsPerLine = 27;
  const lineCount = Math.floor(typeIndex / charsPerLine);
  const yShift = -(lineCount * 21);

  const isTyping = typeIndex > 0 && typeIndex < text.length;
  const jitterX = isTyping ? (typeIndex % 2 === 0 ? 1 : -1) : 0;
  const jitterY = isTyping ? (typeIndex % 3 === 0 ? 1 : 0) : 0;

  return (
    <div className="absolute top-1/2 -translate-y-1/2 left-[360px] w-[260px] h-[320px] mt-[10px] rotate-[14deg] z-10 origin-left pointer-events-none">
      
      {/* Static Feeder Slot Bracket */}
      <div className="absolute top-1/2 -translate-y-1/2 -left-[4px] -mt-[24px] w-[14px] h-[70px] bg-[#1A1A1A] rounded-r-md z-20" />

      {/* Animated Paper */}
      <motion.div 
        animate={{ y: yShift + jitterY, x: jitterX }}
        transition={{ y: { type: "spring", stiffness: 400, damping: 25 }, x: { type: "tween", duration: 0.05 } }}
        className="w-full h-full bg-[#FDFCFB] shadow-[8px_16px_0px_rgba(147,130,255,0.2)] border-[2px] border-[#1A1A1A] p-6 flex flex-col overflow-hidden"
      >
        <div className="border-b-[2px] border-black/10 pb-3 mb-5 flex items-center justify-between relative z-10">
          <div className="text-[10px] font-ibm-mono font-bold tracking-widest text-[#9382FF] uppercase">Output_7.txt</div>
          <div className={`w-2 h-2 rounded-full animate-pulse ${isLive ? 'bg-red-500' : 'bg-[#1A1A1A]'}`} />
        </div>

        <div className="font-ibm-mono text-[13px] leading-[1.6] text-[#1a1a1a] relative z-10 text-justify">
          <TypewriterText text={text} onType={setTypeIndex} isLive={isLive} />
        </div>
      </motion.div>
    </div>
  );
};

export default function WavyTextEffect() {
  const [isLive, setIsLive] = React.useState(false);
  const [liveText, setLiveText] = React.useState("");
  const recognitionRef = React.useRef<any>(null);

  const toggleRecording = () => {
    if (isLive) {
      setIsLive(false);
      recognitionRef.current?.stop();
    } else {
      setIsLive(true);
      setLiveText("");
      
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setLiveText(transcript);
        };
        
        recognition.start();
        recognitionRef.current = recognition;
      } else {
        alert("Live Transcription requires Chrome Desktop.");
        setIsLive(false);
      }
    }
  };

  const activeText = isLive 
    ? (liveText || "Listening... Start speaking into your microphone.")
    : POLISHED_STRING;

  const ribbonTextPattern = activeText.replace(/\./g, "").split(" ").reverse().join(" ");
  const ribbonStream = Array(15).fill(ribbonTextPattern).join("\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0");

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
      <div className="relative w-full h-[400px] mt-20 max-w-[1200px] 2xl:max-w-[1600px] mx-auto">
        
        {/* LEFT STREAM: RAW TEXT ON INVISIBLE WAVE */}
        <div 
          className="absolute left-0 w-[30%] h-full overflow-hidden"
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

        {/* THE PILL AND BUTTON */}
        <div className="absolute top-1/2 left-[30%] -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col items-center mt-[16px]">
          <AudioPill />
          <button 
            onClick={toggleRecording}
            className={`mt-4 px-4 py-2 border-[2px] border-[#1A1A1A] text-[10px] font-bold tracking-[0.1em] uppercase shadow-[4px_4px_0_0_#1A1A1A] active:translate-y-[2px] active:translate-x-[2px] active:shadow-[2px_2px_0_0_#1A1A1A] transition-all whitespace-nowrap cursor-pointer ${isLive ? 'bg-red-400 text-white border-red-500 shadow-[4px_4px_0_0_#B91C1C]' : 'bg-[#FFF9C4] text-black hover:bg-[#FF8C00]'}`}
          >
            {isLive ? "Stop Speaking" : "Start Speaking"}
          </button>
        </div>

        {/* RIGHT STREAM: POLISHED TEXT IN SOLID WAVE PIPELINE */}
        <div className="absolute right-0 w-[70%] h-full">
          
          {/* Wave Pipeline */}
          <svg width="2000" height="400" viewBox="0 0 2000 400" className="absolute left-0 top-1/2 -translate-y-1/2 z-0 pointer-events-none">
             <path 
                id="rightWave"
                d="M 0 200 C 133 133, 266 133, 400 200"
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
                     {ribbonStream}
                 </motion.textPath>
             </text>
          </svg>

          <PaperFeeder text={activeText} isLive={isLive} />
        </div>

      </div>

    </div>
  );
}
