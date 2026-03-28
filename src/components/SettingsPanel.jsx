
export default function SettingsPanel({
  mode,
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
  design,
}) {
  
  return (
    <div className="settings-panel"
      onClick={(e) => e.stopPropagation()} // prevents settings panel from closing when clicked within its area (**see related GamePageLayout)
    >
      {mode === 'rhythm' && (
        /* Theme */
        <div className="setting-group">
          <label>Theme:</label>
          <select value={design} onChange={(e) => setDesign(e.target.value)}>
            <option value="drum">Drums</option>
            <option value="metal">Metal</option>
            <option value="neon">Neon</option>
            <option value="retro">Retro</option>
          </select>
        </div>
      )}

      {mode === "tables" && (
          <div className="setting-group">
              <label>5 Second Timer</label>
              <label className="toggle">
              <input
                  type="checkbox"
                  checked={tablesTimerEnabled}
                  onChange={() => setTablesTimerEnabled(v => !v)}
              />
              <span className="slider"></span>
              </label>
          </div>
      )}
    

      {/* Sound Effects */}
      <div className="setting-group">
        <label>Sound Volume: {Math.round(soundVolume * 100)}%</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={soundVolume}
          onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
        />
      </div>

      {/* Music */}
      <div className="setting-group">
        <label>Music Volume: {Math.round(musicVolume * 100)}%</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={musicVolume}
          onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
        />
      </div>

      
        {/* Haptics */}
        <div className="setting-group">
          <form >
            <fieldset className="haptics">
              <legend>Haptics:</legend>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={hapticsEnabled}
                  onChange={() => setHapticsEnabled(v => !v)}
                  disabled={!supportsHaptics}
                />
                <span className="slider" />
              </label>
            </fieldset>
          </form>
        </div>

    </div>

  );
}