import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import HitTheBeat from "./games/HitTheBeat";
import HitTheMath from "./games/HitTheMath";
import "./styles/base.css";
import "./styles/themes.css";
import "./styles/rhythm.css";
import "./styles/tables.css";
import "./styles/animations.css"

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [design, setDesign] = useState("drum");
  const currentMode = location.pathname.includes("tables")
    ? "tables"
    : "rhythm";


  return (
    <div className={`
                    app 
                    ${currentMode === "tables" ? "mode-tables" : "mode-rhythm"}
                  `}> 
        {/* Nav */}
        <div className="nav">

            {/* MODE Selector */}
            <form>
              <fieldset className={`
                                  field-mode
                                  ${currentMode === "rhythm" 
                                    ? `rhythm-field-${design}`
                                    : "tables-field"}
                                  `}>
                <legend>Mode:</legend>
                <select value={currentMode} onChange={(e) => navigate(`/${e.target.value}`)}>
                  <option value="rhythm">RHYTHM</option>
                  <option value="tables">TIME TABLES</option>
                </select>
              </fieldset>
            </form>
        </div>
      
        {/* Animated Routes */}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Navigate to="/rhythm" />} />
          <Route
            path="/rhythm"
            element={
                <HitTheBeat design={design} setDesign={setDesign} />
            }
          />
          <Route
            path="/tables"
            element={
                <HitTheMath design={design} setDesign={setDesign} />
            }
          />
        </Routes>
      </AnimatePresence>
    </div>
  );
}
