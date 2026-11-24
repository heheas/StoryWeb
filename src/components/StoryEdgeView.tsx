import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from "@xyflow/react";
import type { StoryFlowEdge } from "../types";

export function StoryEdgeView(props: EdgeProps<StoryFlowEdge>) {
 const [path,labelX,labelY]=getBezierPath({sourceX:props.sourceX,sourceY:props.sourceY,sourcePosition:props.sourcePosition,targetX:props.targetX,targetY:props.targetY,targetPosition:props.targetPosition});
 const relationship=props.data?.relationship??"therefore";
 const narrative=props.data?.narrative??false;
 const color=narrative?(relationship==="foreshadowing"?"#9672b8":"#648fc2"):(relationship==="therefore"?"#668b75":"#c87970");
 const highlighted=props.data?.isOnPath??false,selected=props.data?.selected??false;
 const label=narrative?(relationship==="foreshadowing"?"FORESHADOWING":"CALLBACK"):(relationship==="therefore"?"THEREFORE":"BUT");
 return <>
  <BaseEdge id={props.id} path={path} markerEnd={props.markerEnd} style={{stroke:color,strokeWidth:selected?3.2:highlighted?3:1.8,strokeDasharray:narrative?"5 5":undefined,opacity:selected||highlighted?1:.82}}/>
  <EdgeLabelRenderer><div className={`story-edge-label ${relationship}${narrative?" narrative-edge-label":""}${highlighted||selected?" highlighted":""}`} style={{transform:`translate(-50%,-50%) translate(${labelX}px,${labelY}px)`}}>{label}</div></EdgeLabelRenderer>
 </>;
}
