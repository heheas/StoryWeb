import { useEffect, useState } from "react";
import { Handle, NodeToolbar, Position, type NodeProps } from "@xyflow/react";
import { GitBranch, Link2, Mountain, Trash2 } from "lucide-react";
import type { StoryFlowNode } from "../types";
import { useStoryStore } from "../store/useStoryStore";

export function StoryNodeView({id,data,selected}:NodeProps<StoryFlowNode>){
 const update=useStoryStore(s=>s.updateNodeContent),rootNodeId=useStoryStore(s=>s.story.rootNodeId);
 const [content,setContent]=useState(data.content);
 useEffect(()=>setContent(data.content),[data.content]);
 const save=()=>update(id,content.trim());
 const action=(name:string)=>window.dispatchEvent(new CustomEvent("storyweb:node-action",{detail:{action:name,nodeId:id}}));
 return <article className={`story-node${selected?" is-selected":""}${data.isOnPath?" is-on-path":""}`} style={data.stageColor?{borderColor:data.stageColor,borderWidth:4}:undefined}>
  <NodeToolbar isVisible={!!selected} position={Position.Top} align="end"><div className="node-context-toolbar nodrag nopan">
   <button type="button" disabled={id===rootNodeId} title="Relationship" aria-label="Relationship" onClick={e=>{e.stopPropagation();action("relationship");}}><GitBranch size={15}/></button>
   <button type="button" title="Narrative Connection" aria-label="Narrative Connection" onClick={e=>{e.stopPropagation();action("narrative");}}><Link2 size={15}/></button>
   <button type="button" title="Hero's Journey" aria-label="Hero's Journey" onClick={e=>{e.stopPropagation();action("stage");}}><Mountain size={15}/></button>
   <button type="button" title="Delete" aria-label="Delete" onClick={e=>{e.stopPropagation();action("delete");}}><Trash2 size={15}/></button>
  </div></NodeToolbar>
  <Handle id="hierarchy-in" type="target" position={Position.Top} className="story-handle hierarchy-handle" />
  <Handle id="narrative-left-in" type="target" position={Position.Left} className="story-handle narrative-handle" />
  <Handle id="narrative-left-out" type="source" position={Position.Left} className="story-handle narrative-handle narrative-source-handle" />
  <div className="story-node-topline"><div className="story-node-kicker">STORY BEAT</div></div>
  <textarea className="story-node-input nodrag nowheel" value={content} onChange={e=>setContent(e.target.value)} onBlur={save} onKeyDown={e=>{if(e.key==="Enter"&&(e.metaKey||e.ctrlKey)){e.preventDefault();save();e.currentTarget.blur();}}} placeholder="Write what happens..." aria-label="Story beat text" rows={3}/>
  <Handle id="hierarchy-out" type="source" position={Position.Bottom} className="story-handle hierarchy-handle" />
  <Handle id="narrative-right-in" type="target" position={Position.Right} className="story-handle narrative-handle" />
  <Handle id="narrative-right-out" type="source" position={Position.Right} className="story-handle narrative-handle narrative-source-handle" />
 </article>;
}
