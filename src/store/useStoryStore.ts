import { create } from "zustand";
import type { Relationship, StoryDocument } from "../types";
import { addChildToStory, createEmptyStory, createStoryNode, layoutStory, validateStory } from "../lib/storyModel";

const HISTORY_LIMIT = 100;
const makeId = () => globalThis.crypto?.randomUUID?.() ?? `node-${Date.now()}-${Math.random().toString(36).slice(2)}`;

interface StoryState {
  story: StoryDocument;
  selectedNodeId: string | null;
  undoStack: StoryDocument[];
  redoStack: StoryDocument[];
  createRoot: () => void;
  addChild: (parentId: string, relationship: Relationship) => void;
  updateNodeContent: (nodeId: string, content: string) => void;
  updateTitle: (title: string) => void;
  selectNode: (nodeId: string | null) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  resetStory: () => void;
}

function commit(state: StoryState, nextStory: StoryDocument, selectedNodeId = state.selectedNodeId): Partial<StoryState> {
  const errors = validateStory(nextStory);
  if (errors.length) throw new Error(`Invalid story change: ${errors.join(" ")}`);
  return {
    story: nextStory,
    selectedNodeId,
    undoStack: [...state.undoStack, state.story].slice(-HISTORY_LIMIT),
    redoStack: [],
  };
}

export const useStoryStore = create<StoryState>((set, get) => ({
  story: createEmptyStory(),
  selectedNodeId: null,
  undoStack: [],
  redoStack: [],

  createRoot: () => set((state) => {
    if (state.story.rootNodeId) return state;
    const root = createStoryNode(makeId());
    const next = layoutStory({ ...state.story, rootNodeId: root.id, nodes: [root] });
    return commit(state, next, root.id);
  }),

  addChild: (parentId, relationship) => set((state) => {
    const next = addChildToStory(state.story, parentId, makeId(), relationship);
    return commit(state, next, next.nodes[next.nodes.length - 1].id);
  }),

  updateNodeContent: (nodeId, content) => set((state) => {
    const current = state.story.nodes.find((node) => node.id === nodeId);
    if (!current || current.content === content) return state;
    const next = { ...state.story, nodes: state.story.nodes.map((node) => node.id === nodeId ? { ...node, content } : node) };
    return commit(state, next);
  }),

  updateTitle: (title) => set((state) => {
    if (state.story.title === title) return state;
    return commit(state, { ...state.story, title });
  }),

  selectNode: (nodeId) => set((state) => state.selectedNodeId === nodeId ? state : { selectedNodeId: nodeId }),

  undo: () => set((state) => {
    if (state.undoStack.length === 0) return state;
    const previous = state.undoStack[state.undoStack.length - 1];
    return {
      story: previous,
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, state.story].slice(-HISTORY_LIMIT),
      selectedNodeId: previous.nodes.some((node) => node.id === state.selectedNodeId) ? state.selectedNodeId : previous.rootNodeId,
    };
  }),

  redo: () => set((state) => {
    if (state.redoStack.length === 0) return state;
    const next = state.redoStack[state.redoStack.length - 1];
    return {
      story: next,
      redoStack: state.redoStack.slice(0, -1),
      undoStack: [...state.undoStack, state.story].slice(-HISTORY_LIMIT),
      selectedNodeId: next.nodes.some((node) => node.id === state.selectedNodeId) ? state.selectedNodeId : next.rootNodeId,
    };
  }),

  canUndo: () => get().undoStack.length > 0,
  canRedo: () => get().redoStack.length > 0,

  resetStory: () => set((state) => commit(state, createEmptyStory(), null)),
}));

