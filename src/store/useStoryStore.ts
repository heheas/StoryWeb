import { create } from "zustand";
import type { HeroStageId, Relationship, StoryDocument } from "../types";
import { addChildToStory, createEmptyStory, createStoryNode, deleteStoryNode, layoutStory, reparentStoryNode, validateStory } from "../lib/storyModel";
const HISTORY_LIMIT=100; const makeId=()=>globalThis.crypto?.randomUUID?.()??`node-${Date.now()}-${Math.random().toString(36).slice(2)}`;
interface StoryState { story:StoryDocument; selectedNodeId:string|null; undoStack:StoryDocument[]; redoStack:StoryDocument[]; createRoot:()=>void; addChild:(p:string,r:Relationship)=>void; updateNodeContent:(id:string,c:string)=>void; updateTitle:(t:string)=>void; selectNode:(id:string|null)=>void; assignStage:(id:string,s:HeroStageId|undefined)=>void; toggleWriterBlocked:(id:string)=>void; deleteNode:(id:string)=>void; reparentNode:(id:string,p:string,m:"leave"|"move",r:Relationship)=>void; importStory:(s:StoryDocument)=>void; undo:()=>void; redo:()=>void; canUndo:()=>boolean; canRedo:()=>boolean; resetStory:()=>void; }
function commit(state:StoryState,next:StoryDocument,selected=state.selectedNodeId):Partial<StoryState>{const errors=validateStory(next);if(errors.length)throw new Error(`Invalid story change: ${errors.join(" ")}`);return{story:next,selectedNodeId:selected,undoStack:[...state.undoStack,state.story].slice(-HISTORY_LIMIT),redoStack:[]};}
export const useStoryStore=create<StoryState>((set,get)=>({story:createEmptyStory(),selectedNodeId:null,undoStack:[],redoStack:[],
 createRoot:()=>set(s=>{if(s.story.rootNodeId)return s;const n=createStoryNode(makeId());return commit(s,layoutStory({...s.story,rootNodeId:n.id,nodes:[n]}),n.id);}),
 addChild:(p,r)=>set(s=>{const next=addChildToStory(s.story,p,makeId(),r);return commit(s,next,next.nodes[next.nodes.length-1].id);}),
 updateNodeContent:(id,c)=>set(s=>{const n=s.story.nodes.find(x=>x.id===id);if(!n||n.content===c)return s;return commit(s,{...s.story,nodes:s.story.nodes.map(x=>x.id===id?{...x,content:c}:x)});}),
 updateTitle:t=>set(s=>s.story.title===t?s:commit(s,{...s.story,title:t})),
 selectNode:id=>set(s=>s.selectedNodeId===id?s:{selectedNodeId:id}),
 assignStage:(id,stage)=>set(s=>{const n=s.story.nodes.find(x=>x.id===id);if(!n||n.heroJourneyStage===stage)return s;return commit(s,{...s.story,nodes:s.story.nodes.map(x=>x.id===id?{...x,heroJourneyStage:stage}:x)});}),
 toggleWriterBlocked:id=>set(s=>commit(s,{...s.story,nodes:s.story.nodes.map(n=>n.id===id?{...n,writerBlocked:!n.writerBlocked}:n)})),
 deleteNode:id=>set(s=>{const next=deleteStoryNode(s.story,id);return commit(s,next,next.nodes.some(n=>n.id===s.selectedNodeId)?s.selectedNodeId:next.rootNodeId);}),
 reparentNode:(id,p,mode,r)=>set(s=>{const current=s.story.edges.find(e=>e.target===id);if(current?.source===p&&current.relationship===r)return s;const next=reparentStoryNode(s.story,id,p,mode,r);return commit(s,next,id);}),
 importStory:story=>set(()=>{const normalized=layoutStory(story);const errors=validateStory(normalized);if(errors.length)throw new Error(errors.join(" "));return{story:normalized,selectedNodeId:normalized.rootNodeId,undoStack:[],redoStack:[]};}),
 undo:()=>set(s=>{if(!s.undoStack.length)return s;const previous=s.undoStack[s.undoStack.length-1];return{story:previous,undoStack:s.undoStack.slice(0,-1),redoStack:[...s.redoStack,s.story].slice(-HISTORY_LIMIT),selectedNodeId:previous.nodes.some(n=>n.id===s.selectedNodeId)?s.selectedNodeId:previous.rootNodeId};}),
 redo:()=>set(s=>{if(!s.redoStack.length)return s;const next=s.redoStack[s.redoStack.length-1];return{story:next,redoStack:s.redoStack.slice(0,-1),undoStack:[...s.undoStack,s.story].slice(-HISTORY_LIMIT),selectedNodeId:next.nodes.some(n=>n.id===s.selectedNodeId)?s.selectedNodeId:next.rootNodeId};}),
 canUndo:()=>get().undoStack.length>0,canRedo:()=>get().redoStack.length>0,resetStory:()=>set(s=>commit(s,createEmptyStory(),null))
}));
