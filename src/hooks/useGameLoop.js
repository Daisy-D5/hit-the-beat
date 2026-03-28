import { calcLength } from "framer-motion";
import { useEffect, useRef } from "react";

export default function useGameLoop(callback, active = true) {

  const requestRef = useRef();
  const previousTimeRef = useRef();
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  // always keep latest callback
  callbackRef.current = callback;

  const loop = (time) => {

    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
     
      // CALL THE STORED CALLBACK
      callbackRef.current(deltaTime);
    }

    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {

    if (!active) return;

    requestRef.current = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(requestRef.current);

  }, [active]);

}