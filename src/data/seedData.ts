import type { Node, Edge } from "@xyflow/react";
import type { PersonNodeData, SkillNodeData, SkillEdgeData } from "@/types/graph";

// ─── Person Nodes ───────────────────────────────────────────────────────
export const initialPersonNodes: Node<PersonNodeData>[] = [
  {
    id: "person-alice",
    type: "person",
    position: { x: 80, y: 100 },
    data: { label: "Alice", role: "Frontend Lead" },
  },
  {
    id: "person-bob",
    type: "person",
    position: { x: 80, y: 340 },
    data: { label: "Bob", role: "Backend Dev" },
  },
];

// ─── Skill Nodes ────────────────────────────────────────────────────────
export const initialSkillNodes: Node<SkillNodeData>[] = [
  {
    id: "skill-react",
    type: "skill",
    position: { x: 520, y: 60 },
    data: { label: "React", category: "Frontend" },
  },
  {
    id: "skill-nodejs",
    type: "skill",
    position: { x: 520, y: 300 },
    data: { label: "Node.js", category: "Backend" },
  },
];

// ─── Edges ──────────────────────────────────────────────────────────────
// Color-coded by proficiency:
//   expert   → emerald (#10b981)
//   familiar → amber   (#f59e0b)
//   learning → sky     (#38bdf8)

const proficiencyColors: Record<string, string> = {
  expert: "#10b981",
  familiar: "#f59e0b",
  learning: "#38bdf8",
};

export const initialEdges: Edge[] = [
  {
    id: "edge-alice-react",
    source: "person-alice",
    target: "skill-react",
    label: "expert",
    type: "smoothstep",
    animated: true,
    style: { stroke: proficiencyColors.expert, strokeWidth: 2 },
    data: { proficiency: "expert" } as SkillEdgeData,
  },
  {
    id: "edge-alice-nodejs",
    source: "person-alice",
    target: "skill-nodejs",
    label: "familiar",
    type: "smoothstep",
    style: { stroke: proficiencyColors.familiar, strokeWidth: 2 },
    data: { proficiency: "familiar" } as SkillEdgeData,
  },
  {
    id: "edge-bob-react",
    source: "person-bob",
    target: "skill-react",
    label: "familiar",
    type: "smoothstep",
    style: { stroke: proficiencyColors.familiar, strokeWidth: 2 },
    data: { proficiency: "familiar" } as SkillEdgeData,
  },
  {
    id: "edge-bob-nodejs",
    source: "person-bob",
    target: "skill-nodejs",
    label: "expert",
    type: "smoothstep",
    animated: true,
    style: { stroke: proficiencyColors.expert, strokeWidth: 2 },
    data: { proficiency: "expert" } as SkillEdgeData,
  },
];

// ─── Combined initial nodes ─────────────────────────────────────────────
export const initialNodes: Node[] = [
  ...initialPersonNodes,
  ...initialSkillNodes,
];
