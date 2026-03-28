import SettingsPanel from "./SettingsPanel";

export default function GamePageLayout({
  settingsOpen,
  setSettingsOpen,
  children,
  settingsProps,
}) {
  return (
    <div className="game-page-root">

        {/* Settings button OUTSIDE animation */}
        <button
            className={`settings-toggle ${settingsOpen ? "spinning" : ""}`}
            onClick={() => setSettingsOpen(v => !v)}
        >
            ⚙
        </button>

        {/* Settings Panel */}
        {settingsOpen && (
            <div
            className="settings-overlay"
            onClick={() => setSettingsOpen(false)} // closes the settings when clicked anywhere within its area (**see related SettingsPanel)  
            >
            <SettingsPanel {...settingsProps} />
            </div>
        )}

        {/* Animated content */}
        <div className={`game-page-content ${settingsOpen ? "blurred" : ""}`}>

            {children}

            <footer>Made with ❤️ and rhythm.</footer>
        </div>

    </div>
  );
}