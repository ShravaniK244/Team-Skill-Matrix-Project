"use client";

import { useCallback, useEffect } from "react";
import {
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
} from "@xyflow/react";

import { initialNodes, initialEdges } from "@/data/seedData";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Proficiency } from "@/types/graph";

// ─── Proficiency → edge colour mapping ──────────────────────────────
const proficiencyColors: Record<Proficiency, string> = {
  expert: "#10b981",
  familiar: "#f59e0b",
  learning: "#38bdf8",
};

// ─── Public interface exposed by the hook ───────────────────────────
export interface UseGraphState {
  /** Current nodes array */
  nodes: Node[];
  /** Current edges array */
  edges: Edge[];
  /** React Flow change handler for nodes */
  onNodesChange: OnNodesChange;
  /** React Flow change handler for edges */
  onEdgesChange: OnEdgesChange;
  /** React Flow connect handler */
  onConnect: OnConnect;

  // ── Node CRUD ─────────────────────────────────────────────────────
  addPersonNode: (id: string, label: string, role?: string) => void;
  addSkillNode: (id: string, label: string, category?: string) => void;
  removeNode: (id: string) => void;
  updateNodeData: (id: string, data: Record<string, unknown>) => void;

  // ── Edge CRUD ─────────────────────────────────────────────────────
  addSkillEdge: (
    personId: string,
    skillId: string,
    proficiency: Proficiency
  ) => void;
  removeEdge: (id: string) => void;
  updateEdgeProficiency: (id: string, proficiency: Proficiency) => void;

  // ── Bulk helpers ──────────────────────────────────────────────────
  /** Replace all nodes & edges at once (useful when loading from storage) */
  loadGraph: (nodes: Node[], edges: Edge[]) => void;
  /** Reset to original seed data */
  resetGraph: () => void;
}

/**
 * Central state hook for the skill-matrix graph.
 *
 * Wraps React Flow's `useNodesState` / `useEdgesState` and exposes
 * CRUD helpers so every consumer gets a single, consistent API.
 */
export function useGraphState(): UseGraphState {
  // Load initial state from debounced local storage
  const { value: storedNodes, setValue: setStoredNodes } = useLocalStorage<Node[]>("graph-nodes", initialNodes);
  const { value: storedEdges, setValue: setStoredEdges } = useLocalStorage<Edge[]>("graph-edges", initialEdges);

  const [nodes, setNodes, onNodesChange] = useNodesState(storedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(storedEdges);

  // Sync back to local storage whenever React Flow state changes
  useEffect(() => setStoredNodes(nodes), [nodes, setStoredNodes]);
  useEffect(() => setStoredEdges(edges), [edges, setStoredEdges]);



  // ── Connect handler ─────────────────────────────────────────────
  // When a user drags from one handle to another, check if it's
  // Person -> Skill. If so, create link and prompt for proficiency.
  const onConnect: OnConnect = useCallback(
    (connection) => {
      // Find source and target to validate types
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);

      if (!sourceNode || !targetNode) return;

      if (sourceNode.type !== "person" || targetNode.type !== "skill") {
        alert("Only Person -> Skill allowed");
        return;
      }

      // Valid connection, ask for proficiency
      const input = prompt("learning / familiar / expert");
      let proficiency: Proficiency = "familiar"; // Default

      if (input === "expert" || input === "learning") {
        proficiency = input;
      }

      const color = proficiencyColors[proficiency];

      const styledEdge: Edge = {
        ...connection,
        id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
        type: "smoothstep",
        label: proficiency,
        animated: proficiency === "expert",
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        style: { stroke: color, strokeWidth: 2 },
        data: { proficiency },
      };

      setEdges((eds) => addEdge(styledEdge, eds));
    },
    [nodes, setEdges]
  );

  // ── Node CRUD ───────────────────────────────────────────────────
  const addPersonNode = useCallback(
    (id: string, label: string, role?: string) => {
      const newNode: Node = {
        id,
        type: "person",
        position: { 
          x: 50 + Math.random() * 200, 
          y: 50 + Math.random() * 400 
        },
        data: { label, role: role ?? "" },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  const addSkillNode = useCallback(
    (id: string, label: string, category?: string) => {
      const newNode: Node = {
        id,
        type: "skill",
        position: { 
          x: 400 + Math.random() * 300, 
          y: 50 + Math.random() * 400 
        },
        data: { label, category: category ?? "" },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  const removeNode = useCallback(
    (id: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      // Also remove any edges attached to this node
      setEdges((eds) =>
        eds.filter((e) => e.source !== id && e.target !== id)
      );
    },
    [setNodes, setEdges]
  );

  const updateNodeData = useCallback(
    (id: string, data: Record<string, unknown>) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, ...data } } : n
        )
      );
    },
    [setNodes]
  );

  // ── Edge CRUD ───────────────────────────────────────────────────
  const addSkillEdge = useCallback(
    (personId: string, skillId: string, proficiency: Proficiency) => {
      const color = proficiencyColors[proficiency];
      const newEdge: Edge = {
        id: `edge-${personId}-${skillId}`,
        source: personId,
        target: skillId,
        label: proficiency,
        type: "smoothstep",
        animated: proficiency === "expert",
        style: { stroke: color, strokeWidth: 2 },
        data: { proficiency },
      };
      setEdges((eds) => [...eds, newEdge]);
    },
    [setEdges]
  );

  const removeEdge = useCallback(
    (id: string) => {
      setEdges((eds) => eds.filter((e) => e.id !== id));
    },
    [setEdges]
  );

  const updateEdgeProficiency = useCallback(
    (id: string, proficiency: Proficiency) => {
      const color = proficiencyColors[proficiency];
      setEdges((eds) =>
        eds.map((e) =>
          e.id === id
            ? {
                ...e,
                label: proficiency,
                animated: proficiency === "expert",
                style: { ...e.style, stroke: color },
                data: { ...e.data, proficiency },
              }
            : e
        )
      );
    },
    [setEdges]
  );

  // ── Bulk helpers ────────────────────────────────────────────────
  const loadGraph = useCallback(
    (newNodes: Node[], newEdges: Edge[]) => {
      setNodes(newNodes);
      setEdges(newEdges);
    },
    [setNodes, setEdges]
  );

  const resetGraph = useCallback(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [setNodes, setEdges]);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addPersonNode,
    addSkillNode,
    removeNode,
    updateNodeData,
    addSkillEdge,
    removeEdge,
    updateEdgeProficiency,
    loadGraph,
    resetGraph,
  };
}
