# Story Web — Complete Workspace (Plans 3–7)

A local-first interactive story-web editor built with React, TypeScript, Vite, Zustand, and XYFlow.

## Included

- **Navigation and restructuring:** canvas pan/zoom, fit-to-view, zoom percentage, center selected beat, contextual actions, delete branch, parent reassignment, drag-to-reconnect parent edges, cycle prevention, and atomic undo/redo history.
- **Hero's Journey:** all 12 stages, centralized stage names/colors/descriptions, per-node mountain-menu assignment, colored assignment borders, a numbered navigation overview, collapsible sidebar, beat counts, and navigation to assigned beats.
- **Narrative links:** independent directional Foreshadowing/Callback links, dashed side-to-side connections, automatic ancestor/descendant direction, editing/deletion, duplicate validation, and reparent direction review.
- **Writer's Block (mock only):** sample Therefore/But suggestions based on the selected beat, with an Add Beat action. There is no LLM, API client, backend, prompt submission, or API key handling in this build.
- **Saving and files:** IndexedDB autosave (localStorage fallback), `.story` JSON export, `.story`/`.json` import, validation, and confirmation before replacing the current story.
- **Polish:** fixed header, responsive slide-out navigation drawer, touch-friendly canvas controls, light/dark theme, keyboard undo/redo, and unit tests for narrative-link direction and validation.

## Requirements

- Node.js 20 or newer
- npm

## Run locally

```bash
npm install
npm run dev
```

## Verify

```bash
npm run typecheck
npm test
npm run build
```

## Deployment base path

Set Vite's `base` to the path where this app is hosted. For example, for `https://example.com/tools/StoryWeb/`:

```ts
export default defineConfig({
  base: "/tools/StoryWeb/",
  plugins: [react(), tailwindcss()],
});
```

## Notes

- Story documents are versioned (`version: 1`) and validated before import. Existing version-1 `.story` files without `narrativeLinks` remain importable; new exports include narrative links.
- A single reparent operation is one undo entry, including the selected children-handling mode.
- “Leave children behind” inserts an empty placeholder at the old location and reconnects the former direct children to it.
- Deleting a non-root beat deletes its full descendant branch. Deleting the root resets the story to an empty document.
- This ZIP is a source project. Run `npm install` before the first build; dependency installation/build verification was not possible in the packaging environment because the npm registry request timed out.


## Relationship behavior

- Hierarchy edges use `hierarchy-out` (bottom) to `hierarchy-in` (top) handles and remain the only edges used by the automatic layout.
- Narrative links use `narrative-out` (right) to `narrative-in` (left) handles. Foreshadowing arrows point from earlier to later; Callback arrows point from later to earlier.
- Narrative links are stored separately in `narrativeLinks`. Old version-1 story files without that property are normalized to an empty list when imported.
- Selecting a narrative edge exposes its relationship selector and delete action in the contextual toolbar.
- Reparenting reviews links whose ancestor/descendant relationship changes. Confirmed direction updates are committed in the same undo history entry as the reparent operation.

## Verification status

- TypeScript/TSX syntax transpilation: passed.
- Story-model smoke checks: passed for direction rules, validation, cascade deletion, reparent review detection, and legacy import compatibility.
- Full `npm run typecheck`, `npm test`, and `npm run build`: not completed because dependency installation timed out in this environment. Run `npm install` followed by the commands above locally before deployment.
