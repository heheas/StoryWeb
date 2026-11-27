import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from "@xyflow/react";
import type { NarrativeRelationship, Relationship, StoryFlowEdge } from "../types";
import { useStoryStore } from "../store/useStoryStore";

export function StoryEdgeView(props: EdgeProps<StoryFlowEdge>) {
 const updateHierarchy=useStoryStore(s=>s.updateHierarchyEdge),deleteHierarchy=useStoryStore(s=>s.deleteHierarchyEdge),selectHierarchy=useStoryStore(s=>s.selectHierarchyEdge);
 const updateNarrative=useStoryStore(s=>s.updateNarrativeLink),deleteNarrative=useStoryStore(s=>s.deleteNarrativeLink),selectNarrative=useStoryStore(s=>s.selectNarrativeLink);
 const [path,labelX,labelY]=getBezierPath({sourceX:props.sourceX,sourceY:props.sourceY,sourcePosition:props.sourcePosition,targetX:props.targetX,targetY:props.targetY,targetPosition:props.targetPosition});
 const relationship=props.data?.relationship??"therefore",narrative=props.data?.narrative??false;
 const color=narrative?(relationship==="foreshadowing"?"#9672b8":"#648fc2"):(relationship==="therefore"?"#668b75":"#c87970");
 const highlighted=props.data?.isOnPath??false,selected=props.selected||props.data?.selected||false;
 const label=narrative?(relationship==="foreshadowing"?"FORESHADOWING":"CALLBACK"):(relationship==="therefore"?"THEREFORE":"BUT");
 return <>
  <BaseEdge id={props.id} path={path} markerEnd={props.markerEnd} interactionWidth={26} style={{stroke:color,strokeWidth:selected?3.2:highlighted?3:1.8,strokeDasharray:narrative?"5 5":undefined,opacity:selected||highlighted?1:.82}}/>
  <EdgeLabelRenderer><div className={`story-edge-context${selected?" is-selected":""}`} style={{transform:`translate(-50%,-50%) translate(${labelX}px,${labelY}px)`,pointerEvents:"all"}} onClick={e=>{e.stopPropagation();if(narrative)selectNarrative(props.id);else selectHierarchy(props.id);}}>
   <span className={`story-edge-label ${relationship}${narrative?" narrative-edge-label":""}${highlighted||selected?" highlighted":""}`} style={{pointerEvents:"none"}}>{label}</span>
   {selected&&<div className="edge-edit-controls nodrag nopan"><select aria-label="Edit connection relationship" value={relationship} onChange={e=>narrative?updateNarrative(props.id,e.target.value as NarrativeRelationship):updateHierarchy(props.id,e.target.value as Relationship)}><option value={narrative?"foreshadowing":"therefore"}>{narrative?"Foreshadowing":"Therefore"}</option><option value={narrative?"callback":"but"}>{narrative?"Callback":"But"}</option></select><button type="button" aria-label="Delete connection" title="Delete connection" onClick={e=>{e.stopPropagation();if(narrative){deleteNarrative(props.id);return;}if(window.confirm("Deleting this hierarchy connection also deletes the connected child beat and its descendants so the story remains valid."))deleteHierarchy(props.id);}}>×</button></div>}
  </div></EdgeLabelRenderer>
 </>;
}
