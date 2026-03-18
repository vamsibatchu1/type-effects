import React from "react";
import { motion } from "motion/react";
import { FallingText, InteractiveWord } from "./Typography";
import { EffectType } from "../types";

export const EditorialLayout: React.FC<{
  effect: EffectType;
  isFalling: boolean;
  fallingTrigger: string | null;
  isResetting: boolean;
  handleTriggerFall: (word: string) => void;
  handleReset: () => void;
}> = ({ effect, isFalling, fallingTrigger, isResetting, handleTriggerFall, handleReset }) => {
  return (
    <div className="px-12 py-12 flex flex-col h-full bg-[#fdfcfb]">
      <header className="mb-4 flex-shrink-0">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={isFalling ? { opacity: 0, scale: 0.95 } : { opacity: 1, y: 0, scale: 1 }}
          className="text-4xl md:text-6xl font-serif font-light tracking-tight text-gray-900"
        >
          The Mechanics of Fluid Dynamics
        </motion.h1>
      </header>

      <div className="flex-grow relative">
        <motion.div 
          layout
          className="editorial-columns editorial-text text-[18px] leading-relaxed text-gray-800 h-full"
        >
          <p className="mb-4">
            <span className="first-letter:text-5xl first-letter:font-serif first-letter:mr-2 first-letter:float-left first-letter:leading-none first-letter:text-gray-900">
              <FallingText text="F" isFalling={isFalling} startIndex={0} />
            </span>
            <FallingText text="luid dynamics is a subdiscipline of fluid mechanics that describes the flow of fluids—liquids and gases. It has several subdisciplines, including aerodynamics and hydrodynamics. Fluid dynamics has a wide range of applications, including calculating forces and moments on aircraft, determining the mass flow rate of petroleum through pipelines, predicting weather patterns, and understanding nebulae in interstellar space. The fundamental laws of fluid dynamics are the conservation laws, specifically, conservation of mass, conservation of linear momentum, and conservation of energy. These are based on classical mechanics and are modified in quantum mechanics and general relativity. They are expressed using the Reynolds transport theorem." isFalling={isFalling} startIndex={1} />
          </p>

          <p className="mb-4">
            <FallingText text="In addition to the aforementioned conservation laws, fluids are assumed to obey the continuum assumption. Fluids are composed of molecules that collide with one another and solid objects. However, the continuum assumption considers fluids to be continuous, rather than discrete. Consequently, properties such as density, temperature, and velocity are taken to be well-defined at infinitely small points in space and vary continuously from one point to another. The fact that the fluid is made of discrete molecules is ignored." isFalling={isFalling} startIndex={500} />
          </p>

          <p className="mb-4">
            <FallingText text="One of the most important properties of a fluid is its " isFalling={isFalling} startIndex={750} />
            <InteractiveWord 
              word="viscosity" 
              imageSrc="https://picsum.photos/seed/viscosity/800/500" 
              effect={effect}
              onTriggerFall={handleTriggerFall}
              onReset={handleReset}
              isFalling={isFalling}
              isTrigger={fallingTrigger === "viscosity"}
              isResetting={isResetting}
              startIndex={790}
              definition={{
                type: "noun",
                phonetic: "/vɪˈskɒsɪti/",
                text: "The state of being thick, sticky, and semi-fluid in consistency, due to internal friction. It is a measure of a fluid's resistance to deformation at a given rate."
              }}
            />
            <FallingText text=", which determines the amount of internal friction present during flow. A fluid with high viscosity, such as honey, resists motion because its molecular makeup gives it a lot of internal friction. A fluid with low viscosity, such as water, flows easily because its molecular makeup results in very little friction when it is in motion." isFalling={isFalling} startIndex={800} />
          </p>
          
          <p className="mb-4">
            <FallingText text="Another key concept in fluid dynamics is the distinction between different types of flow regimes. When a fluid flows in parallel layers, with no disruption between the layers, it is described as laminar flow. In this state, the fluid moves smoothly and predictably. However, as the velocity of the fluid increases, or as it encounters obstacles, the flow can become unstable. This instability leads to " isFalling={isFalling} startIndex={1200} />
            <InteractiveWord 
              word="turbulence" 
              imageSrc="https://picsum.photos/seed/turbulence/800/500" 
              effect={effect}
              onTriggerFall={handleTriggerFall}
              onReset={handleReset}
              isFalling={isFalling}
              isTrigger={fallingTrigger === "turbulence"}
              isResetting={isResetting}
              startIndex={1480}
              definition={{
                type: "noun",
                phonetic: "/ˈtəːbjʊl(ə)ns/",
                text: "Violent or unsteady movement of air or water, or of some other fluid. It is characterized by chaotic changes in pressure and flow velocity."
              }}
            />
            <FallingText text=", a regime characterized by chaotic changes in pressure and flow velocity. Turbulence is a complex phenomenon that remains one of the greatest unsolved problems in classical physics. It involves the formation of eddies and vortices of many different sizes, which interact with each other in a non-linear fashion. The transition from laminar to turbulent flow is often predicted by the Reynolds number, a dimensionless quantity that represents the ratio of inertial forces to viscous forces. A low Reynolds number indicates laminar flow, while a high Reynolds number suggests that the flow will be turbulent. Understanding these transitions is crucial for engineers designing everything from racing cars to heart valves." isFalling={isFalling} startIndex={1500} />
          </p>

          <p className="mb-4">
            <FallingText text="The study of fluid dynamics also involves the analysis of compressible and incompressible flows. All fluids are compressible to some extent; that is, changes in pressure or temperature cause changes in density. However, in many situations, the changes in pressure and temperature are sufficiently small that the changes in density are negligible. In this case, the flow can be modeled as an incompressible flow. Otherwise, the more general compressible flow equations must be used. For example, the flow of air over a wing at low speeds can often be treated as incompressible, but as the speed approaches the speed of sound, compressibility effects become dominant. This leads to the formation of shock waves, which are thin regions where the fluid properties change abruptly." isFalling={isFalling} startIndex={2200} />
          </p>

          <p className="mb-4">
            <FallingText text="Another important aspect is " isFalling={isFalling} startIndex={2750} />
            <InteractiveWord 
              word="laminar flow" 
              imageSrc="https://picsum.photos/seed/laminar/800/600" 
              effect={effect}
              onTriggerFall={handleTriggerFall}
              onReset={handleReset}
              isFalling={isFalling}
              isTrigger={fallingTrigger === "laminar flow"}
              isResetting={isResetting}
              startIndex={2780}
              definition={{
                type: "noun",
                phonetic: "/ˈlæmɪnə fləʊ/",
                text: "A type of fluid flow in which the fluid travels smoothly or in regular paths. The velocity, pressure, and other flow properties at each point in the fluid remain constant."
              }}
            />
            <FallingText text=" control, which is a technique used in aerodynamics to reduce drag on an aircraft's surface. By maintaining laminar flow over as much of the wing as possible, engineers can significantly improve fuel efficiency. This is achieved through careful shaping of the wing and sometimes by using active suction to remove the boundary layer. The challenges of maintaining laminar flow are significant, as even small imperfections on the surface can trigger the transition to turbulence." isFalling={isFalling} startIndex={2800} />
          </p>
        </motion.div>
      </div>
    </div>
  );
};
