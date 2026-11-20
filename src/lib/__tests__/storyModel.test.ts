import { describe, expect, it } from "vitest";
import { addChildToStory, createEmptyStory, createStoryNode, getAncestorEdgeIds, getAncestorNodeIds, layoutStory, validateStory } from "../storyModel";
import type { StoryDocument } from "../../types";

function baseStory(): StoryDocument {
  const root = createStoryNode("root");
  return { ...createEmptyStory(), rootNodeId: "root", nodes: [root] };
}

describe("story model", () => {
  it("creates a root and valid child branches", () => {
    const story = addChildToStory(baseStory(), "root", "child", "therefore");
    expect(story.nodes).toHaveLength(2);
    expect(story.edges[0]).toMatchObject({ source: "root", target: "child", relationship: "therefore" });
    expect(validateStory(story)).toEqual([]);
  });

  it("supports multiple children with stable sibling ordering", () => {
    let story = addChildToStory(baseStory(), "root", "first", "therefore");
    story = addChildToStory(story, "root", "second", "but");
    expect(story.edges.map((edge) => edge.target)).toEqual(["first", "second"]);
    expect(story.nodes.find((node) => node.id === "first")!.position.x)
      .toBeLessThan(story.nodes.find((node) => node.id === "second")!.position.x);
  });

  it("highlights only the selected node's ancestors", () => {
    let story = addChildToStory(baseStory(), "root", "child", "therefore");
    story = addChildToStory(story, "child", "grandchild", "but");
    expect(getAncestorEdgeIds(story, "grandchild")).toEqual(new Set(["root->child", "child->grandchild"]));
    expect(getAncestorNodeIds(story, "grandchild")).toEqual(new Set(["root", "child", "grandchild"]));
  });

  it("rejects a node with no parent", () => {
    const story = baseStory();
    story.nodes.push(createStoryNode("orphan"));
    expect(validateStory(story)).toContain("Non-root node orphan must have exactly one parent.");
  });

  it("rejects cycles", () => {
    const story: StoryDocument = {
      ...baseStory(),
      nodes: [createStoryNode("root"), createStoryNode("child")],
      edges: [
        { id: "root->child", source: "root", target: "child", relationship: "therefore" },
        { id: "child->root", source: "child", target: "root", relationship: "but" },
      ],
    };
    expect(validateStory(story).some((error) => error.includes("cycles"))).toBe(true);
  });

  it("keeps the root centered over its descendants", () => {
    const story = addChildToStory(baseStory(), "root", "child", "therefore");
    const laidOut = layoutStory(story);
    expect(laidOut.nodes.find((node) => node.id === "root")!.position.y).toBe(0);
    expect(laidOut.nodes.find((node) => node.id === "child")!.position.y).toBeGreaterThan(0);
  });
});
