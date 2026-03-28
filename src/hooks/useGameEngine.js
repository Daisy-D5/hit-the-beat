import { useState, useRef } from "react";

export default function useGameEngine() {

  const [gameState, setGameState] = useState("idle");
  const [activeKey, setActiveKey] = useState(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [comboTier, setComboTier] = useState(null);
  const [showCombo, setShowCombo] = useState(false);

  const timeoutRef = useRef(null);
 
  function resetGame() {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    setScore(0);
    setCombo(0);
    setComboTier(null);
    setShowCombo(false);
    setGameState("idle");
  }

  function startGame() {
    setGameState("running");
  }

  function endGame() {
    clearTimeout(timeoutRef.current);
    setGameState("gameover");
  }

  return {
    gameState,
    setGameState,
    activeKey,
    setActiveKey,
    score,
    setScore,
    combo,
    setCombo,
    comboTier,
    setComboTier,
    showCombo,
    setShowCombo,
    timeoutRef,
    startGame,
    endGame,
    resetGame
  };
}