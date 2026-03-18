import React from "react";
import { EditorialLayout } from "../components/EditorialLayout";

export default function GravityEffect({ 
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
    <EditorialLayout 
      effect="split"
      isFalling={isFalling}
      fallingTrigger={fallingTrigger}
      isResetting={isResetting}
      handleTriggerFall={handleTriggerFall}
      handleReset={handleReset}
    />
  );
}
