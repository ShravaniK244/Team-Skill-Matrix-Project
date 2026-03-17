"use client";

import React, { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import PersonNode from "@/components/PersonNode";
import SkillNode from "@/components/SkillNode";
import { useGraphState, type UseGraphState } from "@/hooks/useGraphState";

/**
 * Props accepted by Graph — allows the parent to hook into state
 * via an optional callback that receives the full state API.
 */
export interface GraphProps {
  /** Called once after state is initialised so the parent can access CRUD helpers */
  onStateReady?: (state: UseGraphState) => void;
  /** Fired when a node is clicked */
  onNodeClick?: (event: React.MouseEvent, node: Node) => void;
  /** Fired when clicking the background pane (use this to clear selection) */
  onPaneClick?: (event: React.MouseEvent) => void;
}

/**
 * Main graph component.
 * Renders the React Flow canvas with custom Person & Skill nodes,
 * proficiency-labeled edges, minimap, controls, and a dot-grid background.
 *
 * All mutable state lives in `useGraphState`; this component is a
 * pure view layer that also forwards the state API upward.
 */
export default function Graph({ onStateReady, onNodeClick, onPaneClick }: GraphProps) {
  const graphState = useGraphState();

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = graphState;

  // Notify parent once (via ref-stable callback)
  React.useEffect(() => {
    onStateReady?.(graphState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Register custom node types (memoised to prevent re-renders)
  const nodeTypes = useMemo(
    () => ({
      person: PersonNode,
      skill: SkillNode,
    }),
    []
  );

  return (
    <div className="graph-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="rgba(148,163,184,0.25)"
        />
        <Controls position="bottom-right" className="graph-controls" />
        <MiniMap
          position="bottom-left"
          nodeColor={(node) =>
            node.type === "person" ? "#818cf8" : "#34d399"
          }
          maskColor="rgba(15, 23, 42, 0.7)"
          className="graph-minimap"
        />
      </ReactFlow>

      {/* Floating legend */}
      <div className="graph-legend">
        <span className="graph-legend__title">Proficiency</span>
        <div className="graph-legend__item">
          <span
            className="graph-legend__dot"
            style={{ background: "#10b981" }}
          />
          Expert
        </div>
        <div className="graph-legend__item">
          <span
            className="graph-legend__dot"
            style={{ background: "#f59e0b" }}
          />
          Familiar
        </div>
        <div className="graph-legend__item">
          <span
            className="graph-legend__dot"
            style={{ background: "#38bdf8" }}
          />
          Learning
        </div>
      </div>
    </div>
  );
}
