import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import GamePageLayout from "../components/GamePageLayout";
import DrumButton from "../components/DrumButton"
import ComboMeter from "../components/ComboMeter";
import useGameEngine from "../hooks/useGameEngine";
import useAudioSystem from "../hooks/useAudioSystem";
import { useComboSystem } from "../hooks/useComboSystem";
import { drums } from "../data/drumData";
import { DESIGNS } from "../data/designs";
import { BEATS } from "../data/beats";


export default function HitTheBeat({design, setDesign}) {

  const {
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
        } = useGameEngine();
  

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [resumeCountdown, setResumeCountdown] = useState(null);
  const { applyCombo, resetCombo } = useComboSystem();
  const [feedback, setFeedback] = useState(null); // {key, type} "correct" | "wrong"

  const HAPTICS = {
                    warm: 30,
                    hot: [30, 30, 30],
                    mega: [50, 35, 50],
                    super: [30, 20, 30, 20, 60],
                  };
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const supportsHaptics = "vibrate" in navigator;

  const [soundVolume, setSoundVolume] = useState(0.7);
  const [musicVolume, setMusicVolume] = useState(0.7);
  
  const LEVELS = { easy: 1300, medium: 1000, hard: 800, expert: 600, auto: "auto" };
  const [selectedLevel, setSelectedLevel] = useState("easy"); // UI choice
  const [effectiveLevel, setEffectiveLevel] = useState("easy"); // actual difficulty when auto is selected
  
  const [reactionTime, setReactionTime] = useState(LEVELS.easy); // derived from effective level

  const currentDesign = DESIGNS[design];

  const audioCtx = useRef(null);

  // Beats and Music System
  const {
        beat, 
        setBeat,
        musicRef,
        musicOff,
        resetMusic,
        playMusic,
        restartMusic,
        fadeOutMusic,
  } = useAudioSystem();
  
    
  // EFFECT: RESET on mount
  useEffect(() => {
    return () => {
      resetGame();
      resetMusic();
    };
  }, []);


  // EFFECT: Settings - pause on open
  useEffect(() => {
    if (settingsOpen && gameState === "running") {
      clearTimeout(timeoutRef.current);
      setGameState("paused");
    }

    if (!settingsOpen && gameState === "paused") {
      startResumeCountdown()
    }

    if (!musicRef.current) return;

    if (settingsOpen) {
      musicRef.current.volume = musicVolume * 0.3;
    } else {
      musicRef.current.volume = musicVolume;
    }
  }, [settingsOpen]);


  // EFFECT: Haptics - toggle vibration
  useEffect(() => {
    const saved = localStorage.getItem("haptics");

    if (saved !== null) {
      setHapticsEnabled(saved === "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("haptics", hapticsEnabled);
  }, [hapticsEnabled]);


  // EFFECT: keyboard input
  useEffect(() => {
    function onKey(e) {
      handleHit(e.key);
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeKey, gameState]);


  // EFFECT: ESC key
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === "Escape") {
        setSettingsOpen(false);
      }
    }

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);


  // EFFECT: set feetback - {key, type} "correct" | "wrong"
  useEffect(() => {
    if (!feedback) return;

    const t = setTimeout(() => setFeedback(null), 400);
    return () => clearTimeout(t);
  }, [feedback]);

  
  // EFFECT: Combo
  useEffect(() => {
    if (!showCombo) return;

    // Auto-hide combo after 1s
    const t = setTimeout(() => {
      setShowCombo(false);
      setCombo(0);
      setComboTier(null);
    }, 1000);

    return () => clearTimeout(t);

  }, [showCombo]);


  // EFFECT: auto increase difficulty based on score
  useEffect(() => {
    if (selectedLevel !== "auto") return;

    let newLevel = "easy";
    
    if (score >= 100) newLevel = "expert";
    else if (score >= 55) newLevel = "hard";
    else if (score >= 20) newLevel = "medium";

    setEffectiveLevel(newLevel);
    setReactionTime(LEVELS[newLevel])
  }, [score, selectedLevel]);


  // EFFECT: non-auto levels
  useEffect(() => {
    if (selectedLevel === "auto") return;

    setEffectiveLevel(selectedLevel);
    setReactionTime(LEVELS[selectedLevel]);
  }, [selectedLevel]);

  
 // EFFECT: Play music when game starts
  useEffect(() => { 
    if (beat === "off") {
      resetMusic();
      return;
    }

    const file = BEATS[beat];
    if (!file) return;

    playMusic(`/sounds/music/${file}`);

  }, [beat]);


  //EFFECT: sync volume changes
  useEffect(() => {
    if (musicRef.current) {
      musicRef.current.volume = musicVolume;
    }
  }, [musicVolume]);


  // EFFECT: helper to play short sounds
  useEffect(() => {
    audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
  }, []);

  // FUNCTION: helper to play short sounds
  async function playSound(url) {
    const ctx = audioCtx.current;
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(buffer);

    const source = ctx.createBufferSource();
    const gainNode = ctx.createGain();

    gainNode.gain.value = soundVolume;

    source.buffer = audioBuffer;
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start();
  }


  // FUNCTION: start game
  function startBeatGame() {
    clearTimeout(timeoutRef.current); 
    resetGame();
    startGame();
    resetCombo();
    //setHits(0);
    setFeedback(null);
    restartMusic()

    setTimeout(() => nextRound(), 200);
        
    // 'auto' level start with 'easy'
    if (selectedLevel === "auto") {
      setEffectiveLevel("easy");
      setReactionTime(LEVELS.easy);
    } else {
      setEffectiveLevel(selectedLevel);
      setReactionTime(LEVELS[selectedLevel]);
    } 
  }

  // FUNCTION: player hit
  function handleHit(key) {
      if (gameState !== "running") return;

      clearTimeout(timeoutRef.current);

      const drumObj = drums.find(d => d.key === key)
    
          if (key === activeKey) { 
              setActiveKey(null);
              setFeedback({ key, type: "correct" });
              playSound(currentDesign.hitSound(drumObj))

              // setHits(prev => prev + 1);  
              const result = applyCombo(score);

              setScore(result.score);

              if (result.combo > 0) {
              if (result.tier === "warm") playSound(currentDesign.comboSounds.warm);
              if (result.tier === "hot") playSound(currentDesign.comboSounds.hot);
              if (result.tier === "mega") playSound(currentDesign.comboSounds.mega);
              if (result.tier === "super") playSound(currentDesign.comboSounds.super);
              setCombo(result.combo);
              setComboTier(result.tier);
              setShowCombo(true);
              vibrate(HAPTICS[result.tier] ?? 30);
              }

              setTimeout(() => {
                  setFeedback(null);
                  nextRound();
              }, 300)
              
          } else {
              resetCombo();
              resetMusic();
              setActiveKey(null);
              setFeedback({ key, type: "wrong" });
              playSound(currentDesign.wrongSound);
              fadeOutMusic();
              endGame();
              vibrate([100, 50, 100])
          }
  }

  // FUNCTION: add next round
  function nextRound() {
      clearTimeout(timeoutRef.current);
    
      const randomDrum = drums[Math.floor(Math.random() * drums.length)];
      setActiveKey(randomDrum.key);

      timeoutRef.current = setTimeout(() => {
          endGame();
          new Audio('/sounds/wrong.mp3').play();
          setFeedback({key: randomDrum.key, type: "wrong"})
          setActiveKey(null);
          fadeOutMusic();
      }, reactionTime);
  }

  // FUNCTION: Countdown on resume
  function startResumeCountdown() {
      let count = 3;
      setResumeCountdown(count);
      
      const interval = setInterval(() => {
        count--;
      
        if (count === 0) {
          clearInterval(interval);
          setResumeCountdown(null);
          setGameState("running");
          nextRound();
        } else {
          setResumeCountdown(count);
        }
      }, 800);
  }

  // FUNCTION: vibration
  function vibrate(pattern) {
    if (!hapticsEnabled) return;
    if (!navigator.vibrate) return;
    
    navigator.vibrate(pattern);
  }


  return (    
    <div className={`game-content ${DESIGNS[design].bodyClass}`}> 
        {/* EVERYTHING BLURRED except settings panel */}
        {/* PAUSED text */}
        {gameState === "paused" && !resumeCountdown && (
        <div className="paused-text">PAUSED</div>
        )}

        {resumeCountdown && (
        <div className="countdown-text-wrap">
          <span className="countdown-text">{resumeCountdown}</span>
        </div>
        )}
        
        <GamePageLayout
            settingsOpen={settingsOpen}
            setSettingsOpen={setSettingsOpen}
            settingsProps={{
              mode: "rhythm",
              soundVolume,
              setSoundVolume,
              musicVolume,
              setMusicVolume,
              hapticsEnabled,
              setHapticsEnabled,
              supportsHaptics,
              setDesign,
              design,
            }}
        >
          
            
            {/* ============= Animated Game Content =============== */}
            <motion.div
                key="rhythm-page"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className={`anim-game-content theme-${design} ${settingsOpen ? "blurred" : ""}`}
            > 
                <h1 id="title">Hit The Beat</h1>
                
                {/* start button */}
                <div className="start-btn-wrap">
                    {(gameState === "idle" || gameState === "gameover") && (
                  <button 
                      onClick={startBeatGame} 
                      className={`start-btn ${gameState === "running" ? "hidden" : ""}`}
                  >
                      {gameState === "gameover" ? "Restart" : "Start"}
                  </button>
                  )}
                </div>

                  {/* level display indicator */}
                <div className="level-indicator-wrap">
                    <div className={selectedLevel === "auto" ? "level-indicator" : "level-indicator-off"}>
                        Auto Level: {" "}
                          {selectedLevel === "auto"
                          ? `${effectiveLevel.toUpperCase()}`
                          : "" }
                     </div>
                </div>

                {/* DRUMS container */}
                <div className="container-wrap">
                    <div className={`rhythm-container ${currentDesign.containerClass}`}>
                        <div className="container-center">
                            
                            {/* LEVELS selector */}
                            <form>
                            <fieldset className="field-level">
                                <legend>Level:</legend>
                                <select 
                                    id="level" 
                                    name="level" 
                                    value={selectedLevel} 
                                    onChange={(e) => {setSelectedLevel(e.target.value)}}
                                    //disabled={gameState === 'running'}
                                >
                                <option value="easy">EASY</option>
                                <option value="medium">MEDIUM</option>
                                <option value="hard">HARD</option>
                                <option value="expert">EXPERT</option>
                                <option value="auto">AUTO</option>
                                </select>
                            </fieldset>
                            </form>


                            {/* SCORE and hits display */}
                            <p className={`
                                p-score 
                                ${feedback?.type ?? ""}
                                ${showCombo ? "score-fade" : ""}
                            `}
                            >
                              {/* <span className="p-hits-inner">🎯 {hits} hits</span> 
                              <br />  */}
                              <span className="p-score-inner">Score: {score}</span>
                            </p>

                            {/* Combo */}
                            {showCombo && (
                                <ComboMeter combo={combo} tier={comboTier} />
                            )}


                            {/* BEATS selector */}
                            <form>
                            <fieldset className="field-beat">
                                <legend>Beat:</legend>
                                <select 
                                    id="beat" 
                                    name="beat"
                                    value={beat}
                                    onChange={(e) => {setBeat(e.target.value)}}
                                    //disabled={gameState === "running"}
                                >
                                <option value="off">OFF</option>
                                <option value="beat1">BEAT 1</option>
                                <option value="beat2">BEAT 2</option>
                                <option value="beat3">BEAT 3</option>
                                <option value="beat4">BEAT 4</option>
                                <option value="beat5">BEAT 5</option>
                                </select>
                            </fieldset>
                            </form>

                           
                        </div>

                        {/* drums */}
                        {drums.map((drum) => (
                                <DrumButton 
                                    mode="rhythm"
                                    key={drum.key} 
                                    drum={drum}
                                    onHit={handleHit}
                                    active={activeKey === drum.key}
                                    feedback={feedback?.key === drum.key ? feedback.type : "" }
                                    currentDesign={currentDesign}
                                />
                        ))}
                    </div>
                </div> 
            </motion.div> 
        </GamePageLayout>
    </div>
  );
}
