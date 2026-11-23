# Story Web — Complete Workspace (Plans 3–7)

A local-first interactive story-web editor built with React, TypeScript, Vite, Zustand, and XYFlow.

## Included

- **Navigation and restructuring:** canvas pan/zoom, fit-to-view, zoom percentage, center selected beat, contextual actions, delete branch, parent reassignment, drag-to-reconnect parent edges, cycle prevention, and atomic undo/redo history.
- **Hero's Journey:** all 12 stages, centralized stage names/colors/descriptions, stage assignment, collapsible sidebar, beat counts, and navigation to assigned beats.
- **Writer's Block (mock only):** sample Therefore/But suggestions based on the selected beat, with an Add Beat action. There is no LLM, API client, backend, prompt submission, or API key handling in this build.
- **Saving and files:** IndexedDB autosave (localStorage fallback), `.story` JSON export, `.story`/`.json` import, validation, and confirmation before replacing the current story.
- **Polish:** responsive sidebar/workspace, light/dark theme, keyboard undo/redo, and restructuring unit tests.

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

- Story documents are versioned (`version: 1`) and validated before import.
- A single reparent operation is one undo entry, including the selected children-handling mode.
- “Leave children behind” inserts an empty placeholder at the old location and reconnects the former direct children to it.
- Deleting a non-root beat deletes its full descendant branch. Deleting the root resets the story to an empty document.
- This ZIP is a source project. Run `npm install` before the first build; dependency installation/build verification was not possible in the packaging environment because the npm registry request timed out.
