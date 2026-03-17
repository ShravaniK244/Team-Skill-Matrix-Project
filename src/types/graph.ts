// ─── Shared types for Team Skill Matrix Graph ───

/** Proficiency level for a person-skill edge */
export type Proficiency = "expert" | "familiar" | "learning";

/** Data stored inside a Person node */
export type PersonNodeData = {
  [key: string]: unknown;
  label: string;
  role?: string;
};

/** Data stored inside a Skill node */
export type SkillNodeData = {
  [key: string]: unknown;
  label: string;
  category?: string;
};

/** Data stored on an edge connecting a person to a skill */
export type SkillEdgeData = {
  [key: string]: unknown;
  proficiency: Proficiency;
};
