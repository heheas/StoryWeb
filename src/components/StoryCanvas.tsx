import { useEffect, useMemo, useState } from "react";
import { Background, Controls, MiniMap, MarkerType, ReactFlow, ReactFlowProvider, useReactFlow, useViewport, type Connection } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Map } from "lucide-react";
import { getAncestorEdgeIds, getAncestorNodeIds, getNarrativeLinkReparentReview, isAncestor, reparentStoryNode } from "../lib/storyModel";
import { useStoryStore } from "../store/useStoryStore";
import { HERO_STAGES, type StoryFlowEdge, type StoryFlowNode } from "../types";
import { StoryNodeView } from "./StoryNodeView";
import { StoryEdgeView } from "./StoryEdgeView";
const nodeTypes={story:StoryNodeView},edgeTypes={story:StoryEdgeView};
const narrativeHandles=["narrative-left-in","narrative-left-out","narrative-right-in","narrative-right-out"];
function CanvasContents(){
 const story=useStoryStore(s=>s.story),selected=useStoryStore(s=>s.selectedNodeId),selectedLink=useStoryStore(s=>s.selectedNarrativeLinkId),selectedHierarchy=useStoryStore(s=>s.selectedHierarchyEdgeId);
 const select=useStoryStore(s=>s.selectNode),selectLink=useStoryStore(s=>s.selectNarrativeLink),selectHierarchy=useStoryStore(s=>s.selectHierarchyEdge),reparent=useStoryStore(s=>s.reparentNode),addNarrative=useStoryStore(s=>s.addNarrativeLink);
 const [showMiniMap,setShowMiniMap]=useState(false);
 const {fitView,setCenter,zoomIn,zoomOut}=useReactFlow();const {zoom}=useViewport();
 const edgePath=useMemo(()=>getAncestorEdgeIds(story,selected),[story,selected]),nodePath=useMemo(()=>getAncestorNodeIds(story,selected),[story,selected]);
 const nodes=useMemo<StoryFlowNode[]>(()=>story.nodes.map(n=>({id:n.id,type:"story",position:n.position,selected:n.id===selected,data:{content:n.content,isOnPath:nodePath.has(n.id),stageColor:HERO_STAGES.find(s=>s.id===n.heroJourneyStage)?.color}})),[story.nodes,selected,nodePath]);
 const edges=useMemo<StoryFlowEdge[]>(()=>[
  ...story.edges.map(e=>({id:e.id,source:e.source,target:e.target,sourceHandle:"hierarchy-out",targetHandle:"hierarchy-in",type:"story" as const,selected:selectedHierarchy===e.id,markerEnd:{type:MarkerType.ArrowClosed,color:e.relationship==="therefore"?"#668b75":"#c87970"},data:{relationship:e.relationship,isOnPath:edgePath.has(e.id)}})),
  ...(story.narrativeLinks??[]).map(e=>{const a=story.nodes.find(n=>n.id===e.source),b=story.nodes.find(n=>n.id===e.target);const right=(a?.position.x??0)<=(b?.position.x??0);return{id:e.id,source:e.source,target:e.target,sourceHandle:right?"narrative-right-out":"narrative-left-out",targetHandle:right?"narrative-left-in":"narrative-right-in",type:"story" as const,selected:selectedLink===e.id,markerEnd:{type:MarkerType.ArrowClosed,color:e.relationship==="foreshadowing"?"#9672b8":"#648fc2"},data:{relationship:e.relationship,isOnPath:false,narrative:true,selected:selectedLink===e.id}};})
 ],[story.edges,story.narrativeLinks,story.nodes,edgePath,selectedLink,selectedHierarchy]);
 useEffect(()=>{if(story.nodes.length){const t=window.setTimeout(()=>void fitView({padding:.2,duration:250}),80);return()=>window.clearTimeout(t);}},[story.rootNodeId,story.nodes.length,fitView]);
 useEffect(()=>{if(!selected)return;const node=story.nodes.find(n=>n.id===selected);if(node){const t=window.setTimeout(()=>void setCenter(node.position.x+130,node.position.y+70,{zoom:1,duration:220}),30);return()=>window.clearTimeout(t);}},[selected,story.nodes,setCenter]);
 const applyParentChange=(connection:Connection)=>{if(!connection.source||!connection.target||connection.source===connection.target||connection.sourceHandle!=="hierarchy-out"||connection.targetHandle!=="hierarchy-in")return;const current=story.edges.find(e=>e.target===connection.target);if(!current)return;const descendants=new Set<string>();const walk=(id:string)=>{for(const e of story.edges.filter(x=>x.source===id))if(!descendants.has(e.target)){descendants.add(e.target);walk(e.target);}};walk(connection.target);if(descendants.has(connection.source))return;const mode=window.confirm("Move this node and all its descendants?\n\nChoose Cancel to leave its children behind with an empty placeholder.")?"move":"leave";try{const proposed=reparentStoryNode(story,connection.target,connection.source,mode,current.relationship);const review=getNarrativeLinkReparentReview(story,proposed);let updates:{id:string;source:string;target:string}[]=[];if(review.affectedIds.length&&window.confirm(`${review.affectedIds.length} narrative link(s) may need a direction review.\n\nOK: update directions for the new hierarchy.\nCancel: preserve their current directions.`))updates=review.updates;reparent(connection.target,connection.source,mode,current.relationship,updates);}catch{/* Invalid reconnections are cancelled without changing the graph. */}};
 const onConnect=(connection:Connection)=>{if(!connection.source||!connection.target||connection.source===connection.target)return;
  if(connection.sourceHandle==="hierarchy-out"&&connection.targetHandle==="hierarchy-in"){applyParentChange(connection);return;}
  if(!narrativeHandles.includes(connection.sourceHandle??"")||!narrativeHandles.includes(connection.targetHandle??""))return;
  const source=connection.source,target=connection.target;
  let relationship:"foreshadowing"|"callback";
  if(isAncestor(story,source,target))relationship="foreshadowing";
  else if(isAncestor(story,target,source))relationship="callback";
  else {window.dispatchEvent(new CustomEvent("storyweb:narrative-branch-choice",{detail:{source,target}}));return;}
  try{addNarrative(source,target,relationship);}catch(error){window.alert(error instanceof Error?error.message:"Could not create narrative connection");}
 };
 return <div className="flow-surface" aria-label="Interactive story canvas"><ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} fitView fitViewOptions={{padding:.2}} proOptions={{hideAttribution:true}} nodesDraggable nodesConnectable elementsSelectable isValidConnection={(c)=>!!c.source&&!!c.target&&c.source!==c.target&&((c.sourceHandle==="hierarchy-out"&&c.targetHandle==="hierarchy-in")||(narrativeHandles.includes(c.sourceHandle??"")&&narrativeHandles.includes(c.targetHandle??"")))} onNodeClick={(_,n)=>select(n.id)} onEdgeClick={(_,e)=>{if(e.data?.narrative)selectLink(e.id);else selectHierarchy(e.id);}} onPaneClick={()=>{select(null);selectLink(null);selectHierarchy(null);}} onConnect={onConnect} onReconnect={(_,connection)=>applyParentChange(connection)} edgesReconnectable panOnDrag zoomOnScroll zoomOnPinch minZoom={.12} maxZoom={2.5} defaultEdgeOptions={{type:"story"}}><Background gap={24} size={1}/><Controls showInteractive={false}/>{showMiniMap&&<MiniMap position="bottom-left" pannable zoomable nodeColor={n=>n.selected?"#647b70":"#aebbb2"}/>}</ReactFlow><div className="canvas-zoom-tools"><button onClick={()=>zoomOut()} title="Zoom out" aria-label="Zoom out">−</button><span>{Math.round(zoom*100)}%</span><button onClick={()=>zoomIn()} title="Zoom in" aria-label="Zoom in">+</button><button onClick={()=>void fitView({padding:.2,duration:250})}>Fit</button>{selected&&<button onClick={()=>{const n=story.nodes.find(x=>x.id===selected);if(n)void setCenter(n.position.x+130,n.position.y+70,{zoom:1,duration:250});}}>Center</button>}</div><button className="minimap-toggle" onClick={()=>setShowMiniMap(v=>!v)} title={showMiniMap?"Hide minimap":"Show minimap"} aria-label={showMiniMap?"Hide minimap":"Show minimap"}><Map size={16}/></button></div>;
}
export function StoryCanvas(){return <ReactFlowProvider><CanvasContents/></ReactFlowProvider>;}
