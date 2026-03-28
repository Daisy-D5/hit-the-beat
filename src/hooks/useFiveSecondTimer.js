import { useState, useRef } from "react";
import useGameLoop from "./useGameLoop";

export default function useFiveSecondTimer({
  enabled,
  gameState,
  duration = 5000,
  dangerTime = 2000,
  tickInterval = 500,
  onDanger,
  onTick,
  onTimeout
}) {

  const [timeLeft, setTimeLeft] = useState(duration);
  const [phase, setPhase] = useState("normal");

  const timeoutTriggered = useRef(false);
  const tickTimer = useRef(0);

  function resetTimer() {
    timeoutTriggered.current = false;
    tickTimer.current = 0;
    setTimeLeft(duration);
    setPhase("normal");
  }

  useGameLoop((delta) => {

    if (!enabled) return;
    if (gameState !== "running") return;

    setTimeLeft((t) => {

      if (timeoutTriggered.current) return t;

      const next = t - delta;

      // enter danger phase
      if (next <= dangerTime && phase !== "danger") {
        setPhase("danger");
        tickTimer.current = 0;
        onDanger?.();
      }

      // repeating tick
      if (next <= dangerTime) {
        tickTimer.current += delta;

        if (tickTimer.current >= tickInterval) {
          tickTimer.current = 0;
          onTick?.();
        }
      }

      // timeout
      if (next <= 0 && !timeoutTriggered.current) {
        timeoutTriggered.current = true;
        setPhase("normal");
        onTimeout?.();
        return 0;
      }

      return next;

    });

  });

  return {
    timeLeft,
    phase,
    resetTimer,
    stopTimeout: () => { timeoutTriggered.current = true; }
  };
}