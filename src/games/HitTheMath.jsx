import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import GamePageLayout from "../components/GamePageLayout";
import DrumButton from "../components/DrumButton";
import ComboMeter from "../components/ComboMeter";
import useGameEngine from "../hooks/useGameEngine";
import useFiveSecondTimer from "../hooks/useFiveSecondTimer";
import useAudioSystem from "../hooks/useAudioSystem";
import { useComboSystem } from "../hooks/useComboSystem";
import { drums } from "../data/drumData";
import { DESIGNS } from "../data/designs";
import { BEATS } from "../data/beats";


export default function HitTheMath({design, setDesign}) {
  
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
  const [padsVisible, setPadsVisible] = useState(false);
  const [inputLocked, setInputLocked] = useState(false);
  // const [ hits, setHits ] = useState(0);
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

  const LEVELS = { easy: 1300, medium: 1000, hard: 800, expert: 600, master: 400, auto: "auto" };
  const [selectedLevel, setSelectedLevel] = useState("easy"); // UI choice
  const [effectiveLevel, setEffectiveLevel] = useState("easy"); // actual difficulty when auto is selected
  
  const [reactionTime, setReactionTime] = useState(LEVELS.easy); // derived from effective level

  const currentDesign = DESIGNS[design];

  const audioCtx = useRef(null);

  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([null, null, null, null]);
  const [tablesTimerEnabled, setTablesTimerEnabled] = useState(false);
  const [showPerfect, setShowPerfect] = useState(false);
  const [showTimeout, setShowTimeout] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

  // 5 Second Timer
  const {
    timeLeft,
    phase: timerPhase,
    resetTimer,
    stopTimeout
  } = useFiveSecondTimer({
    enabled: tablesTimerEnabled,
    gameState,

    onDanger: () => {
      playSound("/sounds/tick.mp3");
    },

    onTick: () => {
      playSound("/sounds/tick.mp3");
    },

    onTimeout: () => {

      setInputLocked(true);
      setShowCorrectAnswer(true);
      setShowTimeout(true);
      fadeOutMusic();
      resetCombo();
      
      new Audio("/sounds/timeout.mp3").play();

      setTimeout(() => {
        setShowCorrectAnswer(false);
        setInputLocked(false);
        setQuestion(null);
        setShowTimeout(false);
        endGame();
      }, 1500);

    }
  });

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
  

  // EFFECT: Drum pads 'mount' at the start
  useEffect(() => {
    const t = setTimeout(() => {
        setPadsVisible(true);
    }, 100); // small delay feels nicer

    return () => clearTimeout(t);
  }, []);


  // EFFECT: Settings - pause on open
  useEffect(() => {
    if (settingsOpen && gameState === "running") {
        setGameState("paused");
    }

    if (!settingsOpen && gameState === "paused") {
      startResumeCountdown();
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

  
  // EFFECT: Auto Hide PERFECT text
  useEffect(() => {
    if (!showPerfect) return;

    const t = setTimeout(() => {
      setShowPerfect(false);
    }, 600);

    return () => clearTimeout(t);
  }, [showPerfect]);


  // EFFECT: auto increase difficulty based on score
  useEffect(() => {
    if (selectedLevel !== "auto") return;

    let newLevel = "easy";
    
    if (score >= 125) newLevel = "master";
    else if (score >= 90) newLevel = "expert";
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

  // FUNCTION: QUESTION generator
  function generateQuestion(level) {
    let max = 5;

    if (level === "medium") max = 8;
    if (level === "hard") max = 10;
    if (level === "expert") max = 12;
    if (level === "master") max = 12;

    const x = Math.floor(Math.random() * max) + 1;
    const y = Math.floor(Math.random() * max) + 1;

    if (level === "master") {      
      // ~ optional for clarity. You can use const x and y from above ~
      // const answer = Math.floor(Math.random() * max) + 1;
      // const divisor = Math.floor(Math.random() * max) + 1;
      const operator = Math.random() < 0.6 ? "x" : "÷"; // 60% multiplication, 40% division

        // MASTER - multiplication 
        if (operator === "x") {
          return {
            x,
            y,
            operator,
            correct: x * y,
          }
        }

        // MASTER - division
        return {
          // x: answer * divisor,  // dividend
          // y: divisor,
          // correct: answer
          x: x * y,
          y: y,
          operator,
          correct: x,
        }; 
    }

    // Normal multiplication in all levels other than 'master'
    return {
      x,
      y,
      operator: "x",
      correct: x * y,
    };
  }

  // FUNCTION: ANSWER generator - NO duplicates
  function generateAnswers(correct) {
    const answers = new Set();
    answers.add(correct);

    while (answers.size < 4) {
      const offset = Math.floor(Math.random() * 10) - 5;
      const wrong = correct + offset;

      if (wrong > 0) {
        answers.add(wrong);
      }
    }

    return Array.from(answers).sort(() => Math.random() - 0.5);
  }


  // FUNCTION: start game
  function startMathGame() {
    setPadsVisible(false);
    setTimeout(() => setPadsVisible(true), 50);
    
    resetGame();
    startGame();
    resetTimer();
    resetCombo();
    //setHits(0);
    setFeedback(null);
    restartMusic();

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
    if (gameState !== "running" || inputLocked) return;
    
    if (key === activeKey) {
        // STOP timeout race
        stopTimeout();

        //PERFECT BONUS
        let perfectBonus = 0;

        if (tablesTimerEnabled && timerPhase === "normal") {
            perfectBonus = 5;
            setShowPerfect(true);
            playSound("/sounds/correct-perfect1.mp3");
        } else {
            playSound("/sounds/correct1.mp3")
        }

        const result = applyCombo(score + perfectBonus);

        setScore(result.score);

        if (result.combo > 0) {
            if (result.tier === "warm") playSound(currentDesign.comboSounds.warm);
            if (result.tier === "hot") playSound(currentDesign.comboSounds.hot);
            if (result.tier === "mega") playSound(currentDesign.comboSounds.mega);
            if (result.tier === "super" || result.tier === "master") playSound(currentDesign.comboSounds.super);
            setCombo(result.combo);
            setComboTier(result.tier);
            setShowCombo(true);
            vibrate(HAPTICS[result.tier] ?? 30);
        }
          
        setActiveKey(null);
        setFeedback({ key, type: "correct" });
      
        setTimeout(() => {
            setFeedback(null);
            nextRound();
        }, 300)

    } else {
        setInputLocked(true)
        setShowCorrectAnswer(true);
        playSound("/sounds/wrong-math.mp3");
        setFeedback({ key, type: "wrong" });
        vibrate([100, 50, 100]);
        stopTimeout();
        fadeOutMusic();
        
        // 1.5 second delay showing correct answer before game over
        setTimeout(() => {
            setInputLocked(false)
            setShowCorrectAnswer(false)
            setActiveKey(null);
            setQuestion(null);
            endGame();
            resetCombo();
        }, 1500)      
    }
  }

  // FUNCTION: add next round
  function nextRound() {
      // reset 5 second timer bar in tables
      resetTimer();

      // reset showCorrect answer
      setShowCorrectAnswer(false);

      const q = generateQuestion(effectiveLevel);
      const options = generateAnswers(q.correct);

      setQuestion(q);
      setAnswers(options);
      setActiveKey(q.correct); // correct answer value

      /* ===== ALTERNATIVE 5-SECOND TIMER (without using hook) =====
      if (tablesTimerEnabled) {
          setTimerPhase("normal");
          setTimeLeft(5000);

          
          // Switch to 'danger' phase at 3s
          dangerTimeoutRef.current = setTimeout(() => {
              setTimerPhase("danger")
              playSound("/sounds/tick.mp3");
              
              
              // Multiple Ticks in final 2 seconds
              let ticks = 3;
              tickIntervalRef.current = setInterval(() => {
                  playSound("/sounds/tick.mp3");
                  ticks--;
                  if (ticks <= 0) clearInterval(tickIntervalRef.current);
              }, 500);      
          }, 3000);
          
          // 5 SECONDS TIMEOUT 
          timeoutRef.current = setTimeout(() => {
            // Lock input
            setInputLocked(true);
            // Reveal correct answer
            setShowCorrectAnswer(true);
            
            setShowTimeout(true);
            setTimerPhase("normal");
            new Audio('/sounds/timeout.mp3').play();

            clearTimeout(timeoutRef.current)
            clearTimeout(dangerTimeoutRef.current);
            clearInterval(tickIntervalRef.current)
            
            // 1.5 second delay showing correct answer before game over
            setTimeout(() => {
              setShowCorrectAnswer(false)
              setInputLocked(false);
              setQuestion(null);
              setGameState("gameover");
              fadeOutMusic();
              setShowTimeout(false);
            }, 1500)

          }, 5000);
          
      } 
      */
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
    <div className="game-content theme-tables">
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
                mode: "tables", 
                tablesTimerEnabled,
                setTablesTimerEnabled,
                soundVolume,
                setSoundVolume,
                musicVolume,
                setMusicVolume,
                hapticsEnabled,
                setHapticsEnabled,
                supportsHaptics,
                setDesign,
                design
            }}
        >

        
            {/* ============= Animated Game Content =============== */}
            <motion.div
                key="tables-page"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className={`anim-game-content ${settingsOpen ? "blurred" : ""}`}
            >
                <h1 id="title">Hit the Math</h1>

                {/* start button */}
                <div className="start-btn-wrap">
                    {(gameState === "idle" || gameState === "gameover") && (
                    <button 
                        onClick={startMathGame} 
                        className={`start-btn ${gameState === "running" ? "hidden" : ""}`}
                    >
                        {gameState === "gameover" ? "Restart" : "Start"}
                    </button>
                    )}
                </div>

                    {/* SCORE and hits display */}
                    <p className={`
                        p-score-math
                        ${feedback?.type ?? ""}
                        ${showCombo ? "score-fade" : ""}
                    `}
                    >
                    {/* <span className="p-hits-inner">🎯 {hits} hits</span> 
                        <br />  */}
                        <span className="p-score-inner">Score: {score}</span>
                    </p>

                {/* level display indicator */}
                <div className="level-indicator-wrap">
                    <div className={selectedLevel === "auto" ? "level-indicator" : "level-indicator-off"}>
                        Auto Level: {" "}
                          {selectedLevel === "auto"
                          ? `${effectiveLevel.toUpperCase()}`
                          : ""}
                    </div>
                </div>
       

                {/* DRUMS container */}
                <div className="container-wrap">
                    <div className="math-container-center">
                            {/* LEVELS selector */}
                            <form>
                                <fieldset className="tables-field-level">
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
                                        <option value="master">MASTER</option>
                                        <option value="auto">AUTO</option>
                                    </select>
                                </fieldset>
                            </form>

                                      {/* Combo */}
                                      {showCombo && (
                                          <ComboMeter combo={combo} tier={comboTier} />
                                      )}
                              
                                      {/* MATHS Question */}
                                      {question && (
                                      <div className="math-question">
                                          
                                          {question.x} {question.operator} {question.y}
                              
                                        
                                          {/* TIMER - Tables Mode */}
                                          {tablesTimerEnabled && gameState === "running" && (
                                          <div className={`timer-wrapper ${timerPhase}`}>
                                              <div 
                                                  className="timer-bar" 
                                                  style={{width: `${(timeLeft / 5000) * 100}%`}} /* timer bar UI tied to real timer */
                                              >
                                              </div>
                                          </div>
                                          )}

                                          {/* PERFECT Bonus */}
                                          {showPerfect && (
                                          <div className="perfect-text">PERFECT!</div>
                                          )}

                                          {/* TIMEOUT */}
                                          {showTimeout && (
                                          <div className="timeout-text">TIME OUT!</div>
                                          )}

                                      </div>
                                      )}

                            {/* BEATS selector */}
                            <form>
                                <fieldset className="tables-field-beat">
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

                    <div className="math-container">
                        
                        {/* drums */}
                        {drums.slice(0, 4).map((drum, index) => {
                    
                            const value = answers?.[index];

                            return (
                                <DrumButton
                                    mode='tables' 
                                    className={padsVisible ? "pad-visible" : "pad-hidden"}
                                    style={{transitionDelay: `${index * 80}ms`}}
                                    key={drum.key} 
                                    drum={drum}
                                    answerValue={gameState === "running" ? answers[index] : null}
                                    onHit={handleHit}
                                    active={showCorrectAnswer && answers[index] === question?.correct}
                                    inactive={gameState !== "running"}
                                    feedback={feedback?.key === value ? feedback.type : "" }
                                    currentDesign={currentDesign}
                                />
                            );
                        })}
                    </div>
                </div>
            </motion.div> 
        </GamePageLayout>
    </div>
  );
}
