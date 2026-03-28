
import { useEffect, useState } from "react";

export default function DrumButton({mode="rhythm", answerValue, drum, onHit, active, inactive, feedback, currentDesign, }) {
  
  function hit() {
     if (mode === "tables") {
      onHit(answerValue);
    } else {
      onHit(drum.key);
    }
   /*
    const audio = new Audio(`/sounds/${drum.sound}`);
    audio.currentTime = 0;
    audio.play();
   */
  }

  return (
    <>
      <button
        className={`
            ${mode === "rhythm" && currentDesign.drumClass}
            ${mode === "rhythm" && drum.key}
            ${mode === "tables" ? "math-drum" : "drum"}
            ${active ? "pressed" : ""} 
            ${inactive ? "inactive" : ""}
            ${feedback === "correct" ? "correct" : ""}
            ${feedback === "wrong" ? "wrong" : ""}
          `}
        onClick={hit}
      >
        {mode === "tables" ? (answerValue ?? "") : (drum.key.toUpperCase())}
      </button>
    </>
  );
}
