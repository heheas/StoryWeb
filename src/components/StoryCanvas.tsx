import { useEffect, useMemo } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { getAncestorEdgeIds, getAncestorNodeIds } from "../lib/storyModel";
import { useStoryStore } from "../store/useStoryStore";
import type { StoryFlowEdge, StoryFlowNode } from "../types";
import { StoryNodeView } from "./StoryNodeView";
import { StoryEdgeView } from "./StoryEdgeView";

const nodeTypes = { story: StoryNodeView };
const edgeTypes = { story: StoryEdgeView };

function CanvasContents() {
  const story = useStoryStore((state) => state.story);
  const selectedNodeId = useStoryStore((state) => state.selectedNodeId);
  const selectNode = useStoryStore((state) => state.selectNode);
  const { fitView } = useReactFlow();

  const pathEdgeIds = useMemo(() => getAncestorEdgeIds(story, selectedNodeId), [story, selectedNodeId]);
  const pathNodeIds = useMemo(() => getAncestorNodeIds(story, selectedNodeId), [story, selectedNodeId]);
  const nodes = useMemo<StoryFlowNode[]>(() => story.nodes.map((node) => ({
    id: node.id,
    type: "story",
    position: node.position,
    selected: node.id === selectedNodeId,
    data: { content: node.content, isOnPath: pathNodeIds.has(node.id) },
  })), [story.nodes, selectedNodeId, pathNodeIds]);
  const edges = useMemo<StoryFlowEdge[]>(() => story.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: "story",
    data: { relationship: edge.relationship, isOnPath: pathEdgeIds.has(edge.id) },
  })), [story.edges, pathEdgeIds]);

  useEffect(() => {
    if (story.nodes.length > 0) {
      const timer = window.setTimeout(() => void fitView({ padding: 0.22, duration: 250 }), 50);
      return () => window.clearTimeout(timer);
    }
  }, [story.rootNodeId, story.nodes.length, fitView]);

  return (
    <div className="flow-surface" aria-label="Interactive story canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.22 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        onNodeClick={(_, node) => selectNode(node.id)}
        onPaneClick={() => selectNode(null)}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        minZoom={0.15}
        maxZoom={2}
        defaultEdgeOptions={{ type: "story" }}
      >
        <Background gap={24} size={1} />
        <Controls showInteractive={false} />
        <MiniMap pannable zoomable nodeColor={(node) => node.selected ? "#647b70" : "#aebbb2"} />
      </ReactFlow>
    </div>
  );
}

export function StoryCanvas() {
  return <ReactFlowProvider><CanvasContents /></ReactFlowProvider>;
}
