import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RotateCcw } from "lucide-react";
import { InteractiveWordProps, EffectType } from "../types";

export const FallingCharacter: React.FC<{ char: string; isFalling: boolean; index: number; isUnderlined?: boolean }> = ({ char, isFalling, index, isUnderlined }) => {
  const staggerDelay = (index % 500) * 0.001; 
  const randomX = (Math.random() - 0.5) * 300;
  const randomRotate = (Math.random() - 0.5) * 180;
  const randomYOffset = Math.random() * 60; 
  
  return (
    <motion.span
      animate={isFalling ? {
        y: `calc(70vh + ${randomYOffset}px)`,
        x: randomX,
        rotate: randomRotate,
        opacity: 1,
      } : {
        y: 0,
        x: 0,
        rotate: 0,
        opacity: 1
      }}
      transition={isFalling ? {
        duration: 2.5,
        delay: staggerDelay + Math.random() * 0.3,
        type: "spring",
        damping: 15,
        stiffness: 35
      } : { 
        duration: 1.5,
        delay: staggerDelay * 0.5,
        ease: "circOut"
      }}
      className={`inline-block whitespace-pre relative z-10 ${isUnderlined && !isFalling ? 'underline decoration-black underline-offset-4' : ''}`}
    >
      {char}
    </motion.span>
  );
};

export const FallingText: React.FC<{ text: string; isFalling: boolean; startIndex: number }> = ({ text, isFalling, startIndex }) => {
  return (
    <>
      {text.split("").map((char, i) => (
        <FallingCharacter key={i} char={char} isFalling={isFalling} index={startIndex + i} />
      ))}
    </>
  );
};

const renderEffect = (effect: EffectType, isOpen: boolean, imageSrc: string, word: string) => {
  switch (effect) {
    case "push":
      return (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              layout
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "45%", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="float-right ml-6 mb-4 mt-2 overflow-hidden"
            >
              <img src={imageSrc} alt={word} className="w-full h-auto block" referrerPolicy="no-referrer" />
            </motion.div>
          )}
        </AnimatePresence>
      );
    case "split":
      return null;
    default:
      return null;
  }
};

export const InteractiveWord: React.FC<InteractiveWordProps & { 
  onTriggerFall?: (word: string) => void;
  onReset?: () => void;
  isFalling: boolean;
  isTrigger?: boolean;
  isResetting?: boolean;
  startIndex: number;
}> = ({ 
  word, 
  imageSrc, 
  effect,
  onTriggerFall,
  onReset,
  isFalling,
  isTrigger,
  isResetting,
  definition,
  startIndex,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    if (effect === "split" && onTriggerFall) {
      onTriggerFall(word);
      return; 
    }
    setIsOpen(!isOpen);
  };

  return (
    <span className="relative inline">
      <span 
        onClick={handleClick}
        className="cursor-pointer inline text-gray-900 z-10 relative"
      >
        {effect === "split" ? (
          word.split("").map((char, i) => (
            <FallingCharacter 
              key={i} 
              char={char} 
              isFalling={isFalling && !isTrigger} 
              index={startIndex + i} 
              isUnderlined={true}
            />
          ))
        ) : (
          <span className={className || "underline decoration-black underline-offset-4"}>{word}</span>
        )}
      </span>

      <AnimatePresence>
        {isFalling && isTrigger && !isResetting && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1.5, duration: 0.4 }}
            onClick={(e) => {
              e.stopPropagation();
              onReset?.();
            }}
            style={{ left: "calc(100% + 6px)" }}
            className="inline-flex items-center justify-center p-1 rounded-full hover:bg-orange-50 text-orange-600 transition-colors z-20 absolute top-0"
            title="Reset Gravity"
          >
            <RotateCcw size={16} />
          </motion.button>
        )}
      </AnimatePresence>

      {renderEffect(effect, isOpen, imageSrc, word)}
      
      <AnimatePresence>
        {isFalling && isTrigger && definition && !isResetting && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ 
              opacity: { duration: isResetting ? 0.4 : 0.8, delay: isResetting ? 0 : 1.5 },
              y: { duration: 0.8, delay: isResetting ? 0 : 1.5 }
            }}
            className="absolute left-0 top-full mt-4 w-[200px] z-50 pointer-events-none"
          >
            <div className="font-serif text-gray-900">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="italic text-sm text-gray-500">{definition.type}</span>
                <span className="text-xs text-gray-400 font-mono tracking-wider">{definition.phonetic}</span>
              </div>
              <p className="text-[15px] leading-tight text-gray-700 italic">
                {definition.text}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
};
