import React, { useState } from "react";
import { EffectType, EffectEntry } from "./types";
import PushFlowEffect from "./effects/1_push_flow";
import GravityEffect from "./effects/2_gravity";
import KineticFocusEffect from "./effects/3_kinetic_focus";

const EFFECTS: EffectEntry[] = [
  { 
    id: "push", 
    label: "Push Flow", 
    description: "Expand content gracefully by pushing text columns aside with smooth spring physics." 
  },
  { 
    id: "split", 
    label: "Gravity", 
    description: "Dismantle the layout letter-by-letter as characters succumb to simulated gravitational forces." 
  },
  { 
    id: "kinetic", 
    label: "Kinetic Focus", 
    description: "Elastic gaps open letter-by-letter to accommodate a dynamic, moving subject word." 
  },
];

export default function App() {
  const [activeEffect, setActiveEffect] = useState<EffectType>("push");
  const [searchQuery, setSearchQuery] = useState("");
  const [fallingTrigger, setFallingTrigger] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const isFalling = fallingTrigger !== null;

  const handleEffectChange = (id: EffectType) => {
    setActiveEffect(id);
    setFallingTrigger(null);
    setIsResetting(false);
  };

  const handleTriggerFall = (word: string) => {
    setFallingTrigger(word);
    setIsResetting(false);
  };

  const handleReset = () => {
    setIsResetting(true);
    setTimeout(() => {
      setFallingTrigger(null);
      setIsResetting(false);
    }, 600);
  };

  const filteredEffects = EFFECTS.filter(effect => 
    effect.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    effect.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#fdfcfb] selection:bg-orange-100 overflow-hidden">
      {/* Sidebar - 20% */}
      <aside className="w-[20%] border-r border-gray-200 p-8 flex flex-col h-screen sticky top-0 bg-[#fdfcfb] z-20 font-ibm-mono">
        <div className="mb-12">
          <div className="text-xl font-medium mb-6 tracking-tighter text-gray-900 pb-2 flex items-center">
            type.effects
            <span className="inline-block w-[8px] h-[0.9em] bg-black ml-1.5 animate-cursor" />
          </div>
          
          <div className="mb-10">
            <input 
              type="text"
              placeholder="Search effects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-black rounded-none px-3 py-3 text-[11px] focus:outline-none transition-all placeholder:text-gray-400"
            />
          </div>

          <nav className="space-y-4">
            {filteredEffects.map((effect) => (
              <button
                key={effect.id}
                onClick={() => handleEffectChange(effect.id)}
                className={`group block text-left w-full p-4 border transition-all duration-300 rounded-none ${
                    activeEffect === effect.id 
                    ? "border-black bg-black text-white" 
                    : "border-black bg-transparent text-black hover:bg-gray-100 hover:-translate-y-0.5 active:translate-y-0"
                } transform-gpu`}
              >
                <div className={`text-[12px] font-medium mb-1 transition-colors ${
                  activeEffect === effect.id ? "text-white" : "text-black"
                }`}>
                  {effect.label}
                </div>
                <div className={`text-[10px] leading-relaxed transition-colors line-clamp-2 overflow-hidden ${
                  activeEffect === effect.id ? "text-gray-300" : "text-gray-700"
                }`}>
                  {effect.description}
                </div>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content - 80% */}
      <main className="w-[80%] h-screen flex flex-col relative overflow-hidden">
        {activeEffect === "push" && (
          <PushFlowEffect 
            isFalling={isFalling}
            fallingTrigger={fallingTrigger}
            isResetting={isResetting}
            handleTriggerFall={handleTriggerFall}
            handleReset={handleReset}
          />
        )}
        {activeEffect === "split" && (
          <GravityEffect 
            isFalling={isFalling}
            fallingTrigger={fallingTrigger}
            isResetting={isResetting}
            handleTriggerFall={handleTriggerFall}
            handleReset={handleReset}
          />
        )}
        {activeEffect === "kinetic" && <KineticFocusEffect />}
      </main>
    </div>
  );
}
