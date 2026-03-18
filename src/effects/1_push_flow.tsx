import React from "react";
import { motion } from "motion/react";
import { InteractiveWord } from "../components/Typography";

const ClockIcon = ({ isDark = false }: { isDark?: boolean }) => (
  <div className={`w-28 h-28 rounded-full border border-black relative overflow-hidden ${isDark ? 'bg-[#212121]' : 'bg-white'} mb-6`}>
     {/* Clock hands */}
     <div className={`absolute top-1/2 left-1/2 w-8 h-[1px] ${isDark ? 'bg-white' : 'bg-black'} origin-left -translate-y-[0.5px]`} style={{ transform: 'rotate(-10deg)' }} />
     <div className={`absolute top-1/2 left-1/2 w-8 h-[1px] ${isDark ? 'bg-yellow-400' : 'bg-yellow-400'} origin-left -translate-y-[0.5px]`} style={{ transform: 'rotate(-120deg)' }} />
     <div className={`absolute top-1/2 left-1/2 w-10 h-[1px] ${isDark ? 'bg-white/40' : 'bg-black/40'} origin-left -translate-y-[0.5px]`} style={{ transform: 'rotate(50deg)' }} />
     {/* Center Dot */}
     <div className={`absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full ${isDark ? 'bg-white' : 'bg-black'} -translate-x-1/2 -translate-y-1/2`} />
  </div>
);

const UnderlineStyle = "border-b-[4px] border-black inline-block leading-[0.85] h-fit -mb-1 cursor-pointer hover:bg-black hover:text-white transition-all";

export default function PushFlowEffect({ 
  isFalling, 
  fallingTrigger, 
  isResetting, 
  handleTriggerFall, 
  handleReset 
}: {
  isFalling: boolean;
  fallingTrigger: string | null;
  isResetting: boolean;
  handleTriggerFall: (word: string) => void;
  handleReset: () => void;
}) {
  return (
    <div className="w-full h-full bg-[#fae100] overflow-hidden font-sans text-black selection:bg-black selection:text-[#fae100] flex flex-col pt-12 lg:pt-24">
      {/* Main Content Area */}
      <div className="flex-grow overflow-y-auto px-6 lg:px-12 pb-32 flex flex-row gap-12 lg:gap-32 scroll-smooth">
        {/* Left Column: Icons & Contact */}
        <div className="w-[180px] lg:w-[220px] flex-shrink-0 pt-0">
           <div className="mb-24">
              <ClockIcon />
              <div className="text-[10px] lg:text-[12px] leading-[1.3] text-black/90">
                <p className="font-bold text-[12px] lg:text-[14px] mb-1">The Shire Branch (Hobbiton)</p>
                <p>Regional Office</p>
                <br />
                <p>Bag End</p>
                <p>Under-hill,</p>
                <p>Hobbiton, The Shire</p>
                <p>Middle-earth</p>
                <br />
                <p>+001-RING-442</p>
                <p className="border-b border-black w-fit">frodo@fellowship.org</p>
              </div>
           </div>

           <div className="mb-24">
              <ClockIcon isDark />
              <div className="text-[10px] lg:text-[12px] leading-[1.3] text-black/90">
                <p className="font-bold text-[12px] lg:text-[14px] mb-1">Minas Tirith (Gondor)</p>
                <p>Capital Headquarters</p>
                <br />
                <p>Seventh Level</p>
                <p>The White Tower,</p>
                <p>Minas Tirith, Gondor</p>
                <p>Middle-earth</p>
                <br />
                <p className="border-b border-black w-fit">king.return@gondor.gov</p>
              </div>
           </div>
        </div>

        {/* Right Column: About Paragraphs */}
        <div className="flex-grow max-w-[1200px]">
           <motion.div 
             layout
             className="columns-2 gap-12 lg:gap-16 text-[18px] lg:text-[23px] leading-[1.3] tracking-normal font-medium text-justify"
           >
              <p className="mb-8 break-inside-avoid">
                The Lord of the Rings is an epic high-fantasy novel by J. R. R. Tolkien. Set in {" "}
                <InteractiveWord 
                  word="Middle-earth [1]" 
                  imageSrc="https://picsum.photos/seed/middle_earth/1200/800"
                  effect="push"
                  isFalling={false}
                  startIndex={1}
                  className={UnderlineStyle}
                />
                , the story began as a sequel to Tolkien's 1937 children's book The Hobbit, but eventually developed into a much larger work. The {" "}
                <InteractiveWord 
                  word="Fellowship [2]" 
                  imageSrc="https://picsum.photos/seed/fellowship/1200/800"
                  effect="push"
                  isFalling={false}
                  startIndex={100}
                  className={UnderlineStyle}
                />
                {" "} of the ring was formed to protect the {" "}
                <InteractiveWord 
                  word="One Ring [3]" 
                  imageSrc="https://picsum.photos/seed/one_ring/1200/800"
                  effect="push"
                  isFalling={false}
                  startIndex={200}
                  className={UnderlineStyle}
                />
                {" "} from falling into the hands of the Dark Lord Sauron at his fortress in Mordor.
              </p>

              <p className="mb-8 break-inside-avoid">
                The narrative follows the journey of the hobbit Frodo Baggins as he and his {" "}
                <InteractiveWord 
                  word="companions [4]" 
                  imageSrc="https://picsum.photos/seed/frodo/1200/800"
                  effect="push"
                  isFalling={false}
                  startIndex={300}
                  className={UnderlineStyle}
                />
                {" "} travel across vast landscapes from the Shire to Mount Doom. Their quest is for the preservation of freedom and the destruction of the weapon that could enslave all of civilization. Its themes of friendship, courage, and the corruptive nature of power have made it one of the most influential works in modern literature.
              </p>

              <p className="mb-8 break-inside-avoid text-black/60 italic">
                In addition to the main narrative, the legendarium includes the Silmarillion and the histories of the Third Age, providing a deep mythological foundation for the events of the Ring.
              </p>
           </motion.div>
        </div>
      </div>
    </div>
  );
}
