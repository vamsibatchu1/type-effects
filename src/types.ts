export type EffectType = "push" | "split" | "kinetic";

export interface InteractiveWordProps {
  word: string;
  imageSrc: string;
  effect: EffectType;
  definition?: {
    type: string;
    phonetic: string;
    text: string;
  };
  className?: string;
}

export interface EffectEntry {
  id: EffectType;
  label: string;
  description: string;
}
