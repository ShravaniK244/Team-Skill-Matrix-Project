"use client";

import React, { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { SkillNodeData } from "@/types/graph";

/**
 * Custom React Flow node representing a skill.
 * Displays a code icon, skill name, and optional category pill.
 */
function SkillNodeComponent({ data }: NodeProps & { data: SkillNodeData }) {
  return (
    <div className="skill-node">
      {/* Skill icon */}
      <div className="skill-node__icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      </div>

      {/* Skill name */}
      <span className="skill-node__label">{data.label}</span>

      {/* Optional category badge */}
      {data.category && (
        <span className="skill-node__category">{data.category}</span>
      )}

      {/* Handles for edges */}
      <Handle
        type="target"
        position={Position.Left}
        className="skill-node__handle"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="skill-node__handle"
      />
    </div>
  );
}

export default memo(SkillNodeComponent);
