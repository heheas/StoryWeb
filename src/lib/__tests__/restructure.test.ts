import { describe, expect, it } from "vitest";
import { addChildToStory, createEmptyStory, createStoryNode, deleteStoryNode, reparentStoryNode, validateStory } from "../storyModel";

describe("story restructuring",()=>{
 it("moves a node and keeps its descendants attached",()=>{
  let story=createEmptyStory();const root=createStoryNode("root"),a=createStoryNode("a"),b=createStoryNode("b"),c=createStoryNode("c");story={...story,rootNodeId:"root",nodes:[root,a,b,c],edges:[{id:"root->a",source:"root",target:"a",relationship:"therefore"},{id:"root->b",source:"root",target:"b",relationship:"but"},{id:"a->c",source:"a",target:"c",relationship:"therefore"}]};
  const next=reparentStoryNode(story,"a","b","move","but");expect(next.edges.find(e=>e.target==="a")?.source).toBe("b");expect(next.edges.find(e=>e.target==="c")?.source).toBe("a");expect(validateStory(next)).toEqual([]);
 });
 it("leaves descendants behind under an empty placeholder",()=>{
  let story=createEmptyStory();story={...story,rootNodeId:"root",nodes:[createStoryNode("root"),createStoryNode("a"),createStoryNode("b"),createStoryNode("c")],edges:[{id:"root->a",source:"root",target:"a",relationship:"therefore"},{id:"root->b",source:"root",target:"b",relationship:"but"},{id:"a->c",source:"a",target:"c",relationship:"therefore"}]};
  const next=reparentStoryNode(story,"a","b","leave","but");const placeholder=next.nodes.find(n=>n.id.startsWith("placeholder-a-"));expect(placeholder).toBeTruthy();expect(placeholder?.content).toBe("");expect(next.edges.find(e=>e.target===placeholder?.id)?.source).toBe("root");expect(next.edges.find(e=>e.target==="c")?.source).toBe(placeholder?.id);expect(next.edges.find(e=>e.target==="a")?.source).toBe("b");expect(validateStory(next)).toEqual([]);
 });
 it("rejects moving a node beneath its descendant",()=>{
  let story=addChildToStory({...createEmptyStory(),rootNodeId:"root",nodes:[createStoryNode("root")]},"root","a","therefore");story=addChildToStory(story,"a","b","but");expect(()=>reparentStoryNode(story,"a","b","move","therefore")).toThrow();
 });
 it("deletes a node and its entire descendant branch",()=>{
  let story=addChildToStory({...createEmptyStory(),rootNodeId:"root",nodes:[createStoryNode("root")]},"root","a","therefore");story=addChildToStory(story,"a","b","but");const next=deleteStoryNode(story,"a");expect(next.nodes.map(n=>n.id)).toEqual(["root"]);expect(next.edges).toHaveLength(0);expect(validateStory(next)).toEqual([]);
 });
});
