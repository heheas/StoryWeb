import type { Edge, Node } from "@xyflow/react";
export type Relationship = "therefore" | "but";
<<<<<<< HEAD
export type NarrativeRelationship = "foreshadowing" | "callback";
=======
>>>>>>> 78c06f45815cd7eccfc329883fefb1fd7094890e
export const HERO_STAGES = [
  { id: "ordinary-world", name: "Ordinary World", color: "#8b9aa8", description: "Introduce the hero's everyday life." },
  { id: "call-to-adventure", name: "Call to Adventure", color: "#d6a84b", description: "Something disrupts the ordinary world." },
  { id: "refusal-of-call", name: "Refusal of the Call", color: "#b87979", description: "The hero hesitates or resists." },
  { id: "meeting-mentor", name: "Meeting the Mentor", color: "#7c9dbe", description: "Guidance, knowledge, or a useful gift appears." },
  { id: "crossing-threshold", name: "Crossing the Threshold", color: "#6eaa91", description: "The hero commits and enters the unfamiliar world." },
  { id: "tests-allies-enemies", name: "Tests, Allies & Enemies", color: "#9b87bd", description: "The hero learns the rules and finds support or opposition." },
  { id: "approach", name: "Approach to the Inmost Cave", color: "#c18d67", description: "The hero prepares for the central ordeal." },
  { id: "ordeal", name: "The Ordeal", color: "#c56f67", description: "The hero faces a major crisis or apparent defeat." },
  { id: "reward", name: "Reward", color: "#b6a24d", description: "The hero gains something important." },
  { id: "road-back", name: "The Road Back", color: "#78a6a0", description: "The consequences follow the hero homeward." },
  { id: "resurrection", name: "Resurrection", color: "#8b9f6c", description: "A final test proves the hero has changed." },
  { id: "return-elixir", name: "Return with the Elixir", color: "#b18da9", description: "The hero returns with a boon for the wider world." },
] as const;
export type HeroStageId = typeof HERO_STAGES[number]["id"];
export interface StoryNode { id: string; content: string; position: { x: number; y: number }; siblingOrder: number; heroJourneyStage?: HeroStageId; writerBlocked?: boolean; }
export interface StoryEdge { id: string; source: string; target: string; relationship: Relationship; }
export interface StoryDocument { version: 1; title: string; rootNodeId: string | null; nodes: StoryNode[]; edges: StoryEdge[]; }
export interface StoryNodeViewData extends Record<string, unknown> { content: string; isOnPath: boolean; stageColor?: string; }
export interface StoryEdgeViewData extends Record<string, unknown> { relationship: Relationship; isOnPath: boolean; }
export type StoryFlowNode = Node<StoryNodeViewData, "story">;
export type StoryFlowEdge = Edge<StoryEdgeViewData, "story">;
