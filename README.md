# Story Web — Plan 2: Core Story Web and History

Built on the Foundation project with React, TypeScript, Vite, Zustand, XYFlow, Tailwind CSS, and Lucide icons.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Install and run

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Verify

```bash
npm run typecheck
npm test
npm run build
```

`npm install` creates `package-lock.json`. Commit that file to the repository so GitHub Actions can use `npm ci` reliably.

## Implemented in Plan 2

- Story document model with title, root node, story beats, and Therefore/But connections
- Create the first/root story beat
- Add multiple Therefore and But children to a selected node
- Edit story beat text; each completed edit is one undoable action
- Edit story title; each completed title edit is one undoable action
- Automatically arranged top-down tree layout, with sibling branches arranged horizontally
- Selected node and its full ancestor path highlighted
- Centralized Zustand story state, separate from canvas rendering
- Snapshot-based undo/redo history, capped at 100 operations
- Keyboard shortcuts: Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z, and Ctrl/Cmd+Y
- New changes after undo clear redo history
- Story graph validation for unique IDs, one parent per non-root node, valid references, root integrity, and cycles
- Unit tests for the story model and layout rules
- Existing light/dark theme and canvas controls retained

## Not implemented yet

- Reparenting, connector dragging, delete controls, and child-handling choices (Plan 3)
- Hero's Journey sidebar and assignments (Plan 4)
- Writer's Block suggestions and LLM integration (Plan 5)
- Autosave, import, and export (Plan 6)
- Full accessibility and performance pass (Plan 7)

## Notes

- Story data is the source of truth; XYFlow is used to render and navigate it.
- Node positions are calculated by the hierarchical layout and are not manually draggable in this phase.
- Text edits are committed on blur or Ctrl/Cmd+Enter, rather than creating a history entry for each keystroke.
- UI-only state such as selection and viewport movement is not included in story history.
