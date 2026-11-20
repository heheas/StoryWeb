import { useEffect } from "react";
import { Download, Menu, Moon, Plus, Sun, Upload } from "lucide-react";
import { StoryCanvas } from "./components/StoryCanvas";
import { useAppStore } from "./store/useAppStore";

export default function App() {
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Story Web home">
          <span className="brand-mark" aria-hidden="true">✳</span>
          <span className="brand-name">Story Web</span>
        </a>

        <div className="header-actions">
          <button className="icon-button" type="button" title="Import story (coming soon)" aria-label="Import story" disabled>
            <Upload size={17} />
          </button>
          <button className="icon-button" type="button" title="Export story (coming soon)" aria-label="Export story" disabled>
            <Download size={17} />
          </button>
          <span className="header-divider" />
          <button className="icon-button" type="button" onClick={toggleTheme} title={`Switch to ${theme === "light" ? "dark" : "light"} theme`} aria-label="Toggle theme">
            {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
          </button>
          <button className="icon-button" type="button" title="More options (coming soon)" aria-label="More options" disabled>
            <Menu size={18} />
          </button>
        </div>
      </header>

      <section className="workspace">
        <div className="canvas-heading">
          <div>
            <p className="eyebrow">YOUR WRITING SPACE</p>
            <h1>A story takes shape.</h1>
            <p className="subheading">Build a chain of moments, choices, and consequences.</p>
          </div>
          <button className="quiet-button" type="button" disabled title="Story creation will be added in Plan 2">
            <Plus size={16} /> New story
          </button>
        </div>
        <div className="canvas-frame">
          <StoryCanvas />
          <div className="canvas-empty-note">
            <span className="empty-symbol">✳</span>
            <p>Your story web will live here.</p>
            <span>Story nodes and branching connections arrive in the next plan.</span>
          </div>
        </div>
      </section>
      <footer className="statusbar">
        <span>STORY WEB <span className="status-dot" /> FOUNDATION</span>
        <span>Ready for your next idea</span>
      </footer>
    </main>
  );
}
