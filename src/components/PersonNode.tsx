"use client";

import React, { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { PersonNodeData } from "@/types/graph";

/**
 * Custom React Flow node representing a team member.
 * Displays an avatar icon, name label, and optional role badge.
 */
function PersonNodeComponent({ data }: NodeProps & { data: PersonNodeData }) {
  return (
    <div className="person-node">
      {/* Avatar circle */}
      <div className="person-node__avatar">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>

      {/* Name */}
      <span className="person-node__label">{data.label}</span>

      {/* Optional role badge */}
      {data.role && <span className="person-node__role">{data.role}</span>}

      {/* Handles for edges */}
      <Handle
        type="source"
        position={Position.Right}
        className="person-node__handle"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="person-node__handle"
      />
    </div>
  );
}

export default memo(PersonNodeComponent);
