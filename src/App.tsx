import { useEffect, useState } from "react";
import { Download, Menu, Moon, Plus, Redo2, Sun, Undo2, Upload } from "lucide-react";
import { StoryCanvas } from "./components/StoryCanvas";
import { useAppStore } from "./store/useAppStore";
import { useStoryStore } from "./store/useStoryStore";

export default function App() {
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const story = useStoryStore((state) => state.story);
  const selectedNodeId = useStoryStore((state) => state.selectedNodeId);
  const createRoot = useStoryStore((state) => state.createRoot);
  const updateTitle = useStoryStore((state) => state.updateTitle);
  const undo = useStoryStore((state) => state.undo);
  const redo = useStoryStore((state) => state.redo);
  const undoStackLength = useStoryStore((state) => state.undoStack.length);
  const redoStackLength = useStoryStore((state) => state.redoStack.length);
  const [titleDraft, setTitleDraft] = useState(story.title);

  useEffect(() => setTitleDraft(story.title), [story.title]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.matches("input, textarea, select, [contenteditable='true']");
      if (isTyping || !(event.ctrlKey || event.metaKey)) return;
      if (event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo(); else undo();
      } else if (event.key.toLowerCase() === "y") {
        event.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo, redo]);

  const hasStory = story.rootNodeId !== null;

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Story Web home">
          <span className="brand-mark" aria-hidden="true">✳</span>
          <span className="brand-name">Story Web</span>
        </a>

        <div className="header-actions">
          <button className="icon-button" type="button" title="Undo (Ctrl+Z)" aria-label="Undo" onClick={undo} disabled={undoStackLength === 0}>
            <Undo2 size={17} />
          </button>
          <button className="icon-button" type="button" title="Redo (Ctrl+Shift+Z)" aria-label="Redo" onClick={redo} disabled={redoStackLength === 0}>
            <Redo2 size={17} />
          </button>
          <span className="header-divider" />
          <button className="icon-button" type="button" title="Import story (Plan 6)" aria-label="Import story" disabled>
            <Upload size={17} />
          </button>
          <button className="icon-button" type="button" title="Export story (Plan 6)" aria-label="Export story" disabled>
            <Download size={17} />
          </button>
          <span className="header-divider" />
          <button className="icon-button" type="button" onClick={toggleTheme} title={`Switch to ${theme === "light" ? "dark" : "light"} theme`} aria-label="Toggle theme">
            {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
          </button>
          <button className="icon-button" type="button" title="More options (coming later)" aria-label="More options" disabled>
            <Menu size={18} />
          </button>
        </div>
      </header>

      <section className="workspace">
        <div className="canvas-heading">
          <div className="story-heading-copy">
            <p className="eyebrow">YOUR WRITING SPACE</p>
            {hasStory ? (
              <input
                className="story-title-input"
                aria-label="Story title"
                value={titleDraft}
                onChange={(event) => setTitleDraft(event.target.value)}
                onBlur={() => updateTitle(titleDraft.trim() || "Untitled Story")}
              />
            ) : (
              <>
                <h1>A story takes shape.</h1>
                <p className="subheading">Build a chain of moments, choices, and consequences.</p>
              </>
            )}
            {hasStory && <p className="subheading">Select a beat to add the next moment in your story.</p>}
          </div>
          <button className="quiet-button" type="button" onClick={createRoot} disabled={hasStory} title={hasStory ? "A story is already started" : "Create your first story beat"}>
            <Plus size={16} /> {hasStory ? "Story started" : "Start story"}
          </button>
        </div>
        <div className="canvas-frame">
          <StoryCanvas />
          {!hasStory && (
            <div className="canvas-empty-note">
              <span className="empty-symbol">✳</span>
              <p>Start with the moment that begins it all.</p>
              <span>Then select the node and add what happens therefore — or what gets in the way.</span>
              <button className="empty-start-button" type="button" onClick={createRoot}>Create first story beat</button>
            </div>
          )}
        </div>
        <div className="canvas-helper-row">
          <span>{story.nodes.length} {story.nodes.length === 1 ? "story beat" : "story beats"}</span>
          <span>{selectedNodeId ? "Selected beat · Ctrl+Enter saves text" : "Select a beat to continue the story"}</span>
        </div>
      </section>
      <footer className="statusbar">
        <span>STORY WEB <span className="status-dot" /> PLAN 2 · STORY BUILDING</span>
        <span>Undo history: {undoStackLength} / 100</span>
      </footer>
    </main>
  );
}
