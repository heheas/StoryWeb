import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from "@xyflow/react";
import type { StoryFlowEdge } from "../types";

export function StoryEdgeView(props: EdgeProps<StoryFlowEdge>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
  });
  const relationship = props.data?.relationship ?? "therefore";
  const isTherefore = relationship === "therefore";
  const color = isTherefore ? "#668b75" : "#c87970";
  const highlighted = props.data?.isOnPath ?? false;

  return (
    <>
      <BaseEdge path={edgePath} style={{ stroke: color, strokeWidth: highlighted ? 3 : 1.8, opacity: highlighted ? 1 : 0.78 }} />
      <EdgeLabelRenderer>
        <div
          className={`story-edge-label ${isTherefore ? "therefore" : "but"}${highlighted ? " highlighted" : ""}`}
          style={{ transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)` }}
        >
          {isTherefore ? "THEREFORE" : "BUT"}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
