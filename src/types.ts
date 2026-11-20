import type { Edge, Node } from "@xyflow/react";

export type Relationship = "therefore" | "but";

export interface StoryNode {
  id: string;
  content: string;
  position: { x: number; y: number };
  siblingOrder: number;
}

export interface StoryEdge {
  id: string;
  source: string;
  target: string;
  relationship: Relationship;
}

export interface StoryDocument {
  version: 1;
  title: string;
  rootNodeId: string | null;
  nodes: StoryNode[];
  edges: StoryEdge[];
}

export interface StoryNodeViewData extends Record<string, unknown> {
  content: string;
  isOnPath: boolean;
}

export interface StoryEdgeViewData extends Record<string, unknown> {
  relationship: Relationship;
  isOnPath: boolean;
}

export type StoryFlowNode = Node<StoryNodeViewData, "story">;
export type StoryFlowEdge = Edge<StoryEdgeViewData, "story">;
