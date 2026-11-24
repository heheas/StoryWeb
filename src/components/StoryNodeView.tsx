import { useEffect, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Mountain, Plus, X } from "lucide-react";
import type { StoryFlowNode } from "../types";
import { HERO_STAGES } from "../types";
import { useStoryStore } from "../store/useStoryStore";

export function StoryNodeView({id,data,selected}:NodeProps<StoryFlowNode>){
 const addChild=useStoryStore(s=>s.addChild),update=useStoryStore(s=>s.updateNodeContent),assignStage=useStoryStore(s=>s.assignStage);
 const node=useStoryStore(s=>s.story.nodes.find(n=>n.id===id));
 const [content,setContent]=useState(data.content),[stageMenu,setStageMenu]=useState(false);
 useEffect(()=>setContent(data.content),[data.content]);
 const save=()=>update(id,content.trim());
 return <article className={`story-node${selected?" is-selected":""}${data.isOnPath?" is-on-path":""}`} style={data.stageColor?{borderColor:data.stageColor,borderWidth:4}:undefined}>
  <Handle id="hierarchy-in" type="target" position={Position.Top} className="story-handle hierarchy-handle" />
  <Handle id="narrative-in" type="target" position={Position.Left} className="story-handle narrative-handle" />
  <div className="story-node-topline"><div className="story-node-kicker">STORY BEAT</div><button className="node-stage-button nodrag" type="button" title="Assign Hero's Journey stage" aria-label="Assign Hero's Journey stage" onClick={e=>{e.stopPropagation();setStageMenu(v=>!v);}}><Mountain size={15}/></button></div>
  {stageMenu&&<div className="node-stage-menu nodrag" onClick={e=>e.stopPropagation()}><div className="node-stage-menu-title">Hero's Journey</div>{HERO_STAGES.map((stage,index)=><button key={stage.id} type="button" onClick={()=>{assignStage(id,stage.id);setStageMenu(false);}}><span style={{background:stage.color}}>{index+1}</span>{stage.name}</button>)}{node?.heroJourneyStage&&<button className="remove-stage" type="button" onClick={()=>{assignStage(id,undefined);setStageMenu(false);}}><X size={12}/> Remove assignment</button>}</div>}
  <textarea className="story-node-input nodrag nowheel" value={content} onChange={e=>setContent(e.target.value)} onBlur={save} onKeyDown={e=>{if(e.key==="Enter"&&(e.metaKey||e.ctrlKey)){e.preventDefault();save();e.currentTarget.blur();}}} placeholder="Write what happens..." aria-label="Story beat text" rows={3}/>
  {selected&&<div className="story-node-actions nodrag"><button type="button" onClick={e=>{e.stopPropagation();addChild(id,"therefore");}}><Plus size={13}/> Therefore</button><button type="button" onClick={e=>{e.stopPropagation();addChild(id,"but");}}><Plus size={13}/> But</button></div>}
  <Handle id="hierarchy-out" type="source" position={Position.Bottom} className="story-handle hierarchy-handle" />
  <Handle id="narrative-out" type="source" position={Position.Right} className="story-handle narrative-handle" />
 </article>;
}
