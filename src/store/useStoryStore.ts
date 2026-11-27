import { create } from "zustand";
import type { HeroStageId, NarrativeRelationship, Relationship, StoryDocument } from "../types";
import { addChildToStory, createEmptyStory, createStoryNode, deleteStoryNode, layoutStory, reparentStoryNode, validateStory, createNarrativeLink } from "../lib/storyModel";

const HISTORY_LIMIT = 100;
const makeId = () => globalThis.crypto?.randomUUID?.() ?? `node-${Date.now()}-${Math.random().toString(36).slice(2)}`;

interface StoryState {
 story: StoryDocument; selectedNodeId: string | null; selectedNarrativeLinkId: string | null; selectedHierarchyEdgeId: string | null;
 undoStack: StoryDocument[]; redoStack: StoryDocument[];
 createRoot: () => void; addChild: (p: string, r: Relationship) => void; updateNodeContent: (id: string, c: string) => void;
 updateTitle: (t: string) => void; selectNode: (id: string | null) => void; selectNarrativeLink: (id: string | null) => void;
 selectHierarchyEdge: (id: string | null) => void; updateHierarchyEdge: (id: string, r: Relationship) => void; deleteHierarchyEdge: (id: string) => void;
 addNarrativeLink: (a: string, b: string, r: NarrativeRelationship) => void; deleteNarrativeLink: (id: string) => void;
 updateNarrativeLink: (id: string, r: NarrativeRelationship) => void; assignStage: (id: string, s: HeroStageId | undefined) => void;
 toggleWriterBlocked: (id: string) => void; deleteNode: (id: string) => void;
 reparentNode: (id: string, p: string, m: "leave" | "move", r: Relationship, linkUpdates?: {id:string;source:string;target:string}[]) => void;
 importStory: (s: StoryDocument) => void; undo: () => void; redo: () => void; canUndo: () => boolean; canRedo: () => boolean; resetStory: () => void;
}
function commit(state: StoryState, next: StoryDocument, selected = state.selectedNodeId): Partial<StoryState> {
 const errors = validateStory(next); if (errors.length) throw new Error(`Invalid story change: ${errors.join(" ")}`);
 return { story: next, selectedNodeId: selected, undoStack: [...state.undoStack, state.story].slice(-HISTORY_LIMIT), redoStack: [] };
}
export const useStoryStore = create<StoryState>((set, get) => ({
 story: createEmptyStory(), selectedNodeId: null, selectedNarrativeLinkId: null, selectedHierarchyEdgeId: null, undoStack: [], redoStack: [],
 createRoot: () => set(s => { if (s.story.rootNodeId) return s; const n = createStoryNode(makeId()); return commit(s, layoutStory({...s.story, rootNodeId:n.id, nodes:[n]}), n.id); }),
 addChild: (p,r) => set(s => { const next=addChildToStory(s.story,p,makeId(),r); return commit(s,next,next.nodes[next.nodes.length-1].id); }),
 updateNodeContent: (id,c) => set(s => { const n=s.story.nodes.find(x=>x.id===id); if(!n||n.content===c)return s; return commit(s,{...s.story,nodes:s.story.nodes.map(x=>x.id===id?{...x,content:c}:x)}); }),
 updateTitle: t => set(s => s.story.title===t?s:commit(s,{...s.story,title:t})),
 selectNode: id => set(s => s.selectedNodeId===id&&s.selectedNarrativeLinkId===null&&s.selectedHierarchyEdgeId===null?s:{selectedNodeId:id,selectedNarrativeLinkId:null,selectedHierarchyEdgeId:null}),
 selectNarrativeLink: id => set(s => s.selectedNarrativeLinkId===id&&s.selectedNodeId===null&&s.selectedHierarchyEdgeId===null?s:{selectedNarrativeLinkId:id,selectedNodeId:null,selectedHierarchyEdgeId:null}),
 selectHierarchyEdge: id => set(s => s.selectedHierarchyEdgeId===id&&s.selectedNodeId===null&&s.selectedNarrativeLinkId===null?s:{selectedHierarchyEdgeId:id,selectedNodeId:null,selectedNarrativeLinkId:null}),
 updateHierarchyEdge: (id,r) => set(s => {const edge=s.story.edges.find(e=>e.id===id);if(!edge||edge.relationship===r)return s;return commit(s,{...s.story,edges:s.story.edges.map(e=>e.id===id?{...e,relationship:r}:e)});}),
 deleteHierarchyEdge: id => set(s => {const edge=s.story.edges.find(e=>e.id===id);if(!edge)return s;const next=deleteStoryNode(s.story,edge.target);return {...commit(s,next,next.rootNodeId),selectedHierarchyEdgeId:null,selectedNarrativeLinkId:null};}),
 addNarrativeLink: (a,b,r) => set(s => {const link=createNarrativeLink(s.story,a,b,r,makeId());return commit(s,{...s.story,narrativeLinks:[...(s.story.narrativeLinks??[]),link]});}),
 deleteNarrativeLink: id => set(s => {if(!(s.story.narrativeLinks??[]).some(l=>l.id===id))return s;return {...commit(s,{...s.story,narrativeLinks:(s.story.narrativeLinks??[]).filter(l=>l.id!==id)}),selectedNarrativeLinkId:null};}),
 updateNarrativeLink: (id,r) => set(s => {const links=s.story.narrativeLinks??[];const link=links.find(l=>l.id===id);if(!link||link.relationship===r)return s;const source=r==="callback"?link.target:link.source,target=r==="callback"?link.source:link.target;return commit(s,{...s.story,narrativeLinks:links.map(l=>l.id===id?{...l,relationship:r,source,target}:l)});}),
 assignStage: (id,stage) => set(s => {const n=s.story.nodes.find(x=>x.id===id);if(!n||n.heroJourneyStage===stage)return s;return commit(s,{...s.story,nodes:s.story.nodes.map(x=>x.id===id?{...x,heroJourneyStage:stage}:x)});}),
 toggleWriterBlocked: id => set(s => commit(s,{...s.story,nodes:s.story.nodes.map(n=>n.id===id?{...n,writerBlocked:!n.writerBlocked}:n)})),
 deleteNode: id => set(s => {const next=deleteStoryNode(s.story,id);const result=commit(s,next,next.nodes.some(n=>n.id===s.selectedNodeId)?s.selectedNodeId:next.rootNodeId);return {...result,selectedNarrativeLinkId:null,selectedHierarchyEdgeId:null};}),
 reparentNode: (id,p,mode,r,linkUpdates=[]) => set(s => {const current=s.story.edges.find(e=>e.target===id);if(current?.source===p&&current.relationship===r&&!linkUpdates.length)return s;let next=reparentStoryNode(s.story,id,p,mode,r);if(linkUpdates.length)next={...next,narrativeLinks:(next.narrativeLinks??[]).map(l=>{const u=linkUpdates.find(x=>x.id===l.id);return u?{...l,source:u.source,target:u.target}:l;})};return {...commit(s,next,id),selectedNarrativeLinkId:null,selectedHierarchyEdgeId:null};}),
 importStory: story => set(() => {const normalized=layoutStory(story);const errors=validateStory(normalized);if(errors.length)throw new Error(errors.join(" "));return {story:normalized,selectedNodeId:normalized.rootNodeId,selectedNarrativeLinkId:null,selectedHierarchyEdgeId:null,undoStack:[],redoStack:[]};}),
 undo: () => set(s => {if(!s.undoStack.length)return s;const previous=s.undoStack[s.undoStack.length-1];return {story:previous,undoStack:s.undoStack.slice(0,-1),redoStack:[...s.redoStack,s.story].slice(-HISTORY_LIMIT),selectedNodeId:previous.nodes.some(n=>n.id===s.selectedNodeId)?s.selectedNodeId:previous.rootNodeId,selectedNarrativeLinkId:null,selectedHierarchyEdgeId:null};}),
 redo: () => set(s => {if(!s.redoStack.length)return s;const next=s.redoStack[s.redoStack.length-1];return {story:next,redoStack:s.redoStack.slice(0,-1),undoStack:[...s.undoStack,s.story].slice(-HISTORY_LIMIT),selectedNodeId:next.nodes.some(n=>n.id===s.selectedNodeId)?s.selectedNodeId:next.rootNodeId,selectedNarrativeLinkId:null,selectedHierarchyEdgeId:null};}),
 canUndo: () => get().undoStack.length>0, canRedo: () => get().redoStack.length>0,
 resetStory: () => set(s => ({...commit(s,createEmptyStory(),null),selectedNarrativeLinkId:null,selectedHierarchyEdgeId:null}))
}));
