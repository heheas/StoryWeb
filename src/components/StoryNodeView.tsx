import { useEffect, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Plus } from "lucide-react";
import type { StoryFlowNode } from "../types";
import { useStoryStore } from "../store/useStoryStore";

export function StoryNodeView({ id, data, selected }: NodeProps<StoryFlowNode>) {
  const addChild = useStoryStore((state) => state.addChild);
  const updateNodeContent = useStoryStore((state) => state.updateNodeContent);
  const [content, setContent] = useState(data.content);

  useEffect(() => setContent(data.content), [data.content]);

  const save = () => updateNodeContent(id, content.trim());

  return (
    <article className={`story-node${selected ? " is-selected" : ""}${data.isOnPath ? " is-on-path" : ""}`}>
      <Handle type="target" position={Position.Top} className="story-handle" />
      <div className="story-node-kicker">STORY BEAT</div>
      <textarea
        className="story-node-input nodrag nowheel"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        onBlur={save}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            save();
            (event.currentTarget as HTMLTextAreaElement).blur();
          }
        }}
        placeholder="Write what happens..."
        aria-label="Story beat text"
        rows={3}
      />
      {selected && (
        <div className="story-node-actions nodrag">
          <button type="button" onClick={(event) => { event.stopPropagation(); addChild(id, "therefore"); }} title="Add a Therefore child">
            <Plus size={13} /> Therefore
          </button>
          <button type="button" onClick={(event) => { event.stopPropagation(); addChild(id, "but"); }} title="Add a But child">
            <Plus size={13} /> But
          </button>
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="story-handle" />
    </article>
  );
}
