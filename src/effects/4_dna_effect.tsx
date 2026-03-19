import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";

const WORDS = [
  "Obscuring",
  "Redundancy",
  "Mobility",
  "Fluidity",
  "Structure",
  "Dynamics",
  "Entanglement",
  "Sequence",
  "Kinetic",
  "Synthesis",
  "Evolution",
  "Helical"
];

const DNAWord: React.FC<{ text: string; index: number; scrollProgress: any }> = ({ text, index, scrollProgress }) => {
  // Stagger the phase of each word in the helix
  const phaseOffset = index * 0.4;
  
  // Create a continuous rotation based on scroll, offset by word index
  const rotation = useTransform(scrollProgress, [0, 1], [0 + phaseOffset, Math.PI * 4 + phaseOffset]);
  
  // Sine-wave X movement (Cylinder effect)
  const x = useTransform(rotation, (r) => Math.sin(r) * 120);
  
  // Scale based on Z-depth (front vs back)
  const scale = useTransform(rotation, (r) => {
    const depth = Math.cos(r); // Front is 1, Back is -1
    return 0.7 + (depth + 1) * 0.2; // Ranges from 0.7 to 1.1
  });
  
  // Opacity based on Z-depth
  const opacity = useTransform(rotation, (r) => {
    const depth = Math.cos(r);
    return 0.3 + (depth + 1) * 0.35; // Ranges from 0.3 to 1.0
  });

  // zIndex to ensure front words are above back words
  const zIndex = useTransform(rotation, (r) => Math.round(Math.cos(r) * 100));

  return (
    <motion.div
      style={{
        x,
        scale,
        opacity,
        zIndex,
      }}
      className="text-6xl lg:text-[88px] font-bold uppercase tracking-tighter whitespace-nowrap text-[#B88AFF] mb-4"
    >
      {text}
    </motion.div>
  );
};

export default function DNAEffect() {
  const { scrollYProgress } = useScroll();
  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Automatic slow rotation if not scrolling
  const [autoRotate, setAutoRotate] = useState(0);
  
  useEffect(() => {
    let frameId: number;
    const animate = (time: number) => {
      setAutoRotate(time * 0.0005);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div className="w-full h-full bg-[#2D5A27] font-sans overflow-y-auto selection:bg-[#B88AFF] selection:text-[#2D5A27]">
      {/* Spacer to allow scrolling */}
      <div className="h-[300vh] w-full relative">
        <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center pointer-events-none">
          {/* Legend/Context info in corners */}
          <div className="absolute top-12 left-12 text-[#B88AFF] opacity-60 text-sm font-bold uppercase tracking-widest">
            Type.Flow / DNA Series
          </div>
          <div className="absolute top-12 right-12 text-[#B88AFF] opacity-60 text-sm font-bold uppercase tracking-widest text-right">
            Helical Rotation<br />Study V2.01
          </div>
          
          <div className="absolute bottom-12 left-12 text-[#B88AFF] opacity-40 text-[10px] uppercase max-w-[200px] leading-tight">
            Vertical interaction mapping the scroll progress to a 3D cylindrical spine.
          </div>

          {/* The Helix Strand */}
          <div className="flex flex-col items-center justify-center">
             {WORDS.map((word, i) => (
               <DNAWord 
                 key={`${word}-${i}`} 
                 text={word} 
                 index={i} 
                 scrollProgress={smoothScroll} 
               />
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
