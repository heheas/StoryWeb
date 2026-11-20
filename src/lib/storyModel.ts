import type { Relationship, StoryDocument, StoryEdge, StoryNode } from "../types";

export const NODE_WIDTH = 260;
export const NODE_HEIGHT = 142;
export const HORIZONTAL_GAP = 76;
export const VERTICAL_GAP = 92;

export function createEmptyStory(): StoryDocument {
  return { version: 1, title: "Untitled Story", rootNodeId: null, nodes: [], edges: [] };
}

export function createStoryNode(id: string, siblingOrder = 0): StoryNode {
  return { id, content: "", position: { x: 0, y: 0 }, siblingOrder };
}

export function createStoryEdge(source: string, target: string, relationship: Relationship): StoryEdge {
  return { id: `${source}->${target}`, source, target, relationship };
}

/** Stable top-down tree layout. Sibling subtrees are kept together and centered under their parent. */
export function layoutStory(story: StoryDocument): StoryDocument {
  if (!story.rootNodeId || story.nodes.length === 0) return story;
  const nodeById = new Map(story.nodes.map((node) => [node.id, node]));
  const children = new Map<string, StoryNode[]>();
  for (const edge of story.edges) {
    const child = nodeById.get(edge.target);
    if (child) children.set(edge.source, [...(children.get(edge.source) ?? []), child]);
  }
  for (const list of children.values()) list.sort((a, b) => a.siblingOrder - b.siblingOrder || a.id.localeCompare(b.id));

  const widths = new Map<string, number>();
  const measuring = new Set<string>();
  const measure = (id: string): number => {
    if (widths.has(id)) return widths.get(id)!;
    if (measuring.has(id)) return NODE_WIDTH;
    measuring.add(id);
    const descendants = children.get(id) ?? [];
    const width = descendants.length === 0
      ? NODE_WIDTH
      : descendants.reduce((sum, child) => sum + measure(child.id), 0) + HORIZONTAL_GAP * (descendants.length - 1);
    measuring.delete(id);
    widths.set(id, Math.max(NODE_WIDTH, width));
    return widths.get(id)!;
  };

  measure(story.rootNodeId);
  const positions = new Map<string, { x: number; y: number }>();
  const place = (id: string, left: number, depth: number) => {
    const width = widths.get(id) ?? NODE_WIDTH;
    positions.set(id, { x: left + (width - NODE_WIDTH) / 2, y: depth * (NODE_HEIGHT + VERTICAL_GAP) });
    const descendants = children.get(id) ?? [];
    const totalWidth = descendants.reduce((sum, child) => sum + (widths.get(child.id) ?? NODE_WIDTH), 0)
      + HORIZONTAL_GAP * Math.max(0, descendants.length - 1);
    let childLeft = left + (width - totalWidth) / 2;
    for (const child of descendants) {
      const childWidth = widths.get(child.id) ?? NODE_WIDTH;
      place(child.id, childLeft, depth + 1);
      childLeft += childWidth + HORIZONTAL_GAP;
    }
  };
  place(story.rootNodeId, 0, 0);
  return { ...story, nodes: story.nodes.map((node) => ({ ...node, position: positions.get(node.id) ?? node.position })) };
}

export function getAncestorEdgeIds(story: StoryDocument, nodeId: string | null): Set<string> {
  const result = new Set<string>();
  if (!nodeId) return result;
  const parentByChild = new Map(story.edges.map((edge) => [edge.target, edge]));
  const visited = new Set<string>();
  let current = nodeId;
  while (parentByChild.has(current) && !visited.has(current)) {
    visited.add(current);
    const edge = parentByChild.get(current)!;
    result.add(edge.id);
    current = edge.source;
  }
  return result;
}

export function getAncestorNodeIds(story: StoryDocument, nodeId: string | null): Set<string> {
  const result = new Set<string>();
  if (!nodeId) return result;
  result.add(nodeId);
  const parentByChild = new Map(story.edges.map((edge) => [edge.target, edge.source]));
  const visited = new Set<string>();
  let current = nodeId;
  while (parentByChild.has(current) && !visited.has(current)) {
    visited.add(current);
    current = parentByChild.get(current)!;
    result.add(current);
  }
  return result;
}

export function validateStory(story: StoryDocument): string[] {
  const errors: string[] = [];
  const nodeIds = new Set(story.nodes.map((node) => node.id));
  if (nodeIds.size !== story.nodes.length) errors.push("Node IDs must be unique.");
  if (story.nodes.length === 0) {
    if (story.rootNodeId !== null || story.edges.length > 0) errors.push("An empty story cannot have a root or edges.");
    return errors;
  }
  if (!story.rootNodeId || !nodeIds.has(story.rootNodeId)) errors.push("A valid root node is required.");

  const edgeIds = new Set<string>();
  const parentByChild = new Map<string, string>();
  for (const edge of story.edges) {
    if (edgeIds.has(edge.id)) errors.push(`Duplicate edge ID: ${edge.id}`);
    edgeIds.add(edge.id);
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) errors.push(`Edge ${edge.id} references a missing node.`);
    if (edge.source === edge.target) errors.push("A node cannot be its own parent.");
    if (parentByChild.has(edge.target)) errors.push(`Node ${edge.target} has more than one parent.`);
    parentByChild.set(edge.target, edge.source);
  }
  for (const node of story.nodes) {
    if (node.id !== story.rootNodeId && !parentByChild.has(node.id)) errors.push(`Non-root node ${node.id} must have exactly one parent.`);
  }
  if (story.rootNodeId && parentByChild.has(story.rootNodeId)) errors.push("The root node cannot have a parent.");

  const visited = new Set<string>();
  const visiting = new Set<string>();
  const children = new Map<string, string[]>();
  for (const edge of story.edges) children.set(edge.source, [...(children.get(edge.source) ?? []), edge.target]);
  const walk = (id: string) => {
    if (visiting.has(id)) { errors.push("Story connections cannot contain cycles."); return; }
    if (visited.has(id)) return;
    visiting.add(id);
    for (const child of children.get(id) ?? []) walk(child);
    visiting.delete(id);
    visited.add(id);
  };
  if (story.rootNodeId) walk(story.rootNodeId);
  if (visited.size !== story.nodes.length) errors.push("Every story node must be connected to the root.");
  return [...new Set(errors)];
}

export function addChildToStory(story: StoryDocument, parentId: string, childId: string, relationship: Relationship): StoryDocument {
  if (!story.nodes.some((node) => node.id === parentId)) throw new Error("Parent node does not exist.");
  if (story.nodes.some((node) => node.id === childId)) throw new Error("Node ID already exists.");
  const siblingOrder = story.edges.filter((edge) => edge.source === parentId).length;
  return layoutStory({
    ...story,
    nodes: [...story.nodes, createStoryNode(childId, siblingOrder)],
    edges: [...story.edges, createStoryEdge(parentId, childId, relationship)],
  });
}
