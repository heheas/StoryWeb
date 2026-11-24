import { useEffect, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Mountain, Plus, X } from "lucide-react";
import type { StoryFlowNode } from "../types";
import { HERO_STAGES } from "../types";
import { useStoryStore } from "../store/useStoryStore";
export function StoryNodeView({id,data,selected}:NodeProps<StoryFlowNode>){const addChild=useStoryStore(s=>s.addChild),update=useStoryStore(s=>s.updateNodeContent);const [content,setContent]=useState(data.content);useEffect(()=>setContent(data.content),[data.content]);const save=()=>update(id,content.trim());return <article className={`story-node${selected?" is-selected":""}${data.isOnPath?" is-on-path":""}`} style={data.stageColor?{borderColor:data.stageColor,borderWidth:4}:undefined}>
 <Handle type="target" position={Position.Top} className="story-handle" />
 <div className="story-node-kicker">STORY BEAT</div><textarea className="story-node-input nodrag nowheel" value={content} onChange={e=>setContent(e.target.value)} onBlur={save} onKeyDown={e=>{if(e.key==="Enter"&&(e.metaKey||e.ctrlKey)){e.preventDefault();save();e.currentTarget.blur();}}} placeholder="Write what happens..." aria-label="Story beat text" rows={3}/>
 {selected&&<div className="story-node-actions nodrag"><button type="button" onClick={e=>{e.stopPropagation();addChild(id,"therefore");}}> <Plus size={13}/> Therefore</button><button type="button" onClick={e=>{e.stopPropagation();addChild(id,"but");}}><Plus size={13}/> But</button></div>}
 <Handle type="source" position={Position.Bottom} className="story-handle" />
 </article>;}
