import { useState } from "react";

const COMBO_MILESTONES = { 
                            25: { bonus: 5, tier: "warm"},
                            50: { bonus: 5, tier: "warm" }, 
                            75: { bonus: 5, tier: "warm" }, 
                            100: { bonus: 10, tier: "hot" }, 
                            125: { bonus: 10, tier: "hot" },
                            150: { bonus: 15, tier: "hot" }, 
                            175: { bonus: 15, tier: "hot" },
                            200: { bonus: 20, tier: "mega" }, 
                            225: { bonus: 20, tier: "mega" },
                            250: { bonus: 25, tier: "mega" },
                            275: { bonus: 25, tier: "mega" },
                            300: { bonus: 30, tier: "super"} 
                          };
const EXTRA = {
  start: 300,
  interval: 50,
  bonus: 30,
}

export function useComboSystem() {
  const [hits, setHits] = useState(0);
  const [nextExtraAt, setNextExtraAt ] = useState(null);

  function resetCombo() {
    setHits(0);
    setNextExtraAt(null);
  } 

  function applyCombo(scoreBeforeCombo) {
    const newHits = hits + 1;
    setHits(newHits);

    let score = scoreBeforeCombo + 1;
    let combo = 0;
    let tier = null;
    let milestones = COMBO_MILESTONES[newHits];

    // normal milestones
    if (milestones) {
      score += milestones.bonus;
      combo = milestones.bonus;
      tier = milestones.tier;
    }

    // start EXTRA system
    if ( newHits === EXTRA.start ) {
      setNextExtraAt(newHits + EXTRA.interval);
    }

    // repeating EXTRA
    if (nextExtraAt !== null && newHits === nextExtraAt ) {
      score += EXTRA.bonus;
      combo = EXTRA.bonus;
      tier = "super";
      setNextExtraAt(nextExtraAt + EXTRA.interval);
    }

    return { score, combo, tier };
  }

  return { applyCombo, resetCombo };
}