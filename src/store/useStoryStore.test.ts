import { beforeEach, describe, expect, it } from "vitest";
import { useStoryStore } from "./useStoryStore";
import { createEmptyStory } from "../lib/storyModel";

describe("story history", () => {
  beforeEach(() => {
    useStoryStore.setState({
      story: createEmptyStory(),
      selectedNodeId: null,
      selectedNarrativeLinkId: null,
      selectedHierarchyEdgeId: null,
      undoStack: [],
      redoStack: [],
    });
  });

  it("records root creation and child creation as separate actions", () => {
    useStoryStore.getState().createRoot();
    const rootId = useStoryStore.getState().story.rootNodeId!;
    useStoryStore.getState().addChild(rootId, "therefore");
    expect(useStoryStore.getState().story.nodes).toHaveLength(2);
    expect(useStoryStore.getState().undoStack).toHaveLength(2);
  });

  it("undoes and redoes a branch creation", () => {
    useStoryStore.getState().createRoot();
    const rootId = useStoryStore.getState().story.rootNodeId!;
    useStoryStore.getState().addChild(rootId, "but");
    useStoryStore.getState().undo();
    expect(useStoryStore.getState().story.nodes).toHaveLength(1);
    useStoryStore.getState().redo();
    expect(useStoryStore.getState().story.nodes).toHaveLength(2);
    expect(useStoryStore.getState().story.edges[0].relationship).toBe("but");
  });

  it("clears redo history when a new action follows undo", () => {
    useStoryStore.getState().createRoot();
    const rootId = useStoryStore.getState().story.rootNodeId!;
    useStoryStore.getState().addChild(rootId, "therefore");
    useStoryStore.getState().undo();
    useStoryStore.getState().updateTitle("A New Title");
    expect(useStoryStore.getState().redoStack).toHaveLength(0);
  });

  it("does not add a history entry for an unchanged edit", () => {
    useStoryStore.getState().createRoot();
    const rootId = useStoryStore.getState().story.rootNodeId!;
    useStoryStore.getState().updateNodeContent(rootId, "");
    expect(useStoryStore.getState().undoStack).toHaveLength(1);
  });
  it("records narrative links in undo and redo history", () => {
    useStoryStore.getState().createRoot();
    const rootId = useStoryStore.getState().story.rootNodeId!;
    useStoryStore.getState().addChild(rootId, "therefore");
    const childId = useStoryStore.getState().story.nodes.find((node) => node.id !== rootId)!.id;
    useStoryStore.getState().addNarrativeLink(rootId, childId, "foreshadowing");
    expect(useStoryStore.getState().story.narrativeLinks).toHaveLength(1);
    useStoryStore.getState().undo();
    expect(useStoryStore.getState().story.narrativeLinks).toHaveLength(0);
    useStoryStore.getState().redo();
    expect(useStoryStore.getState().story.narrativeLinks).toHaveLength(1);
  });


  it("edits hierarchy relationships without changing endpoints and supports undo", () => {
    useStoryStore.getState().createRoot();
    const rootId = useStoryStore.getState().story.rootNodeId!;
    useStoryStore.getState().addChild(rootId, "therefore");
    const edge = useStoryStore.getState().story.edges[0];
    useStoryStore.getState().updateHierarchyEdge(edge.id, "but");
    expect(useStoryStore.getState().story.edges[0]).toMatchObject({ id: edge.id, source: rootId, target: edge.target, relationship: "but" });
    useStoryStore.getState().undo();
    expect(useStoryStore.getState().story.edges[0].relationship).toBe("therefore");
  });

  it("deletes a hierarchy connection without orphaning its child branch and restores it with undo", () => {
    useStoryStore.getState().createRoot();
    const rootId = useStoryStore.getState().story.rootNodeId!;
    useStoryStore.getState().addChild(rootId, "therefore");
    const edge = useStoryStore.getState().story.edges[0];
    useStoryStore.getState().deleteHierarchyEdge(edge.id);
    expect(useStoryStore.getState().story.nodes).toHaveLength(1);
    expect(useStoryStore.getState().story.edges).toHaveLength(0);
    useStoryStore.getState().undo();
    expect(useStoryStore.getState().story.edges[0]).toEqual(edge);
  });

  it("reverses narrative endpoints when changing between Foreshadowing and Callback", () => {
    useStoryStore.getState().createRoot();
    const rootId = useStoryStore.getState().story.rootNodeId!;
    useStoryStore.getState().addChild(rootId, "therefore");
    const childId = useStoryStore.getState().story.nodes.find(node => node.id !== rootId)!.id;
    useStoryStore.getState().addNarrativeLink(rootId, childId, "foreshadowing");
    const link = useStoryStore.getState().story.narrativeLinks![0];
    useStoryStore.getState().updateNarrativeLink(link.id, "callback");
    expect(useStoryStore.getState().story.narrativeLinks![0]).toMatchObject({ id: link.id, source: childId, target: rootId, relationship: "callback" });
    useStoryStore.getState().undo();
    expect(useStoryStore.getState().story.narrativeLinks![0]).toEqual(link);
  });
});
