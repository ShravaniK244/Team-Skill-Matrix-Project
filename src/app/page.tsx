"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { UseGraphState } from "@/hooks/useGraphState";
import type { Node } from "@xyflow/react";

// Dynamically import Graph with SSR disabled — React Flow requires the DOM
const Graph = dynamic(() => import("@/components/Graph"), { ssr: false });

export default function HomePage() {
  // Hold a reference to the graph state API once it's ready
  const graphStateRef = useRef<UseGraphState | null>(null);
  const [stateReady, setStateReady] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const handleStateReady = useCallback((state: UseGraphState) => {
    graphStateRef.current = state;
    setStateReady(true);
  }, []);

  // ── Quick-action helpers wired to the state API ─────────────────
  const handleAddPerson = useCallback(() => {
    const state = graphStateRef.current;
    if (!state) return;
    const id = `person-${Date.now()}`;
    state.addPersonNode(id, "New Person", "");
  }, []);

  const handleAddSkill = useCallback(() => {
    const state = graphStateRef.current;
    if (!state) return;
    const id = `skill-${Date.now()}`;
    state.addSkillNode(id, "New Skill", "");
  }, []);

  const handleSave = useCallback(() => {
    const state = graphStateRef.current;
    if (!state) return;
    localStorage.setItem("graph-nodes", JSON.stringify(state.nodes));
    localStorage.setItem("graph-edges", JSON.stringify(state.edges));
    alert("Graph data successfully saved!");
  }, []);

  const handleReset = useCallback(() => {
    if (confirm("Are you sure you want to reset the graph to seed data? Unsaved changes will be lost.")) {
      graphStateRef.current?.resetGraph();
      setSelectedNode(null);
    }
  }, []);

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const handleDeleteNode = useCallback(() => {
    if (!selectedNode || !graphStateRef.current) return;
    if (confirm(`Are you sure you want to delete "${selectedNode.data.label}"? This will also remove all its connections.`)) {
      graphStateRef.current.removeNode(selectedNode.id);
      setSelectedNode(null);
    }
  }, [selectedNode]);

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  return (
    <main className="page">
      {/* Header */}
      <header className="page__header">
        <div className="page__header-left">
          <span className="page__logo">⬡</span>
          <h1 className="page__title">Team Skill Matrix</h1>
        </div>

        {/* Quick-action toolbar */}
        {stateReady && (
          <div className="toolbar">
            <button
              id="btn-add-person"
              className="toolbar__btn toolbar__btn--indigo"
              onClick={handleAddPerson}
            >
              <span className="toolbar__btn-icon">＋</span> Person
            </button>
            <button
              id="btn-add-skill"
              className="toolbar__btn toolbar__btn--emerald"
              onClick={handleAddSkill}
            >
              <span className="toolbar__btn-icon">＋</span> New Skill
            </button>
            <button
              id="btn-save"
              className="toolbar__btn toolbar__btn--sky"
              onClick={handleSave}
            >
              <span className="toolbar__btn-icon">💾</span> Save
            </button>
            <button
              id="btn-reset"
              className="toolbar__btn toolbar__btn--slate"
              onClick={handleReset}
            >
              ↻ Reset
            </button>
          </div>
        )}

        <p className="page__subtitle">
          Visualize team skills &amp; proficiency at a glance
        </p>
      </header>

      {/* Main Content Area */}
      <div className="page__content">
        {/* Graph canvas */}
        <section className="page__graph">
          <Graph 
            onStateReady={handleStateReady} 
            onNodeClick={handleNodeClick}
            onPaneClick={handlePaneClick}
          />
        </section>

        {/* Sidebar Panel for Node Details */}
        {selectedNode && (
          <aside className="page__sidebar">
            <div className="sidebar__header">
              <h2>Node Details</h2>
              <button 
                className="sidebar__close"
                onClick={handlePaneClick}
              >
                ×
              </button>
            </div>
            
            <div className="sidebar__content">
              <div className="sidebar__field">
                <label>ID</label>
                <div>{selectedNode.id}</div>
              </div>
              <div className="sidebar__field">
                <label>Type</label>
                <div className="sidebar__badge">{selectedNode.type}</div>
              </div>
              
              <div className="sidebar__section">
                <h3>Data</h3>
                <div className="sidebar__field">
                  <label>Name</label>
                  <input
                    className="sidebar__input"
                    value={String(selectedNode.data?.label || "")}
                    onChange={(e) => {
                      // Update the selectedNode reactively for UI
                      setSelectedNode((prev) => 
                        prev ? { ...prev, data: { ...prev.data, label: e.target.value } } : prev
                      );
                      // Update main graph state
                      graphStateRef.current?.updateNodeData(selectedNode.id, { label: e.target.value });
                    }}
                  />
                </div>
                
                {selectedNode.type === "person" && !!selectedNode.data?.role && (
                  <div className="sidebar__field">
                    <label>Role</label>
                    <input
                      className="sidebar__input"
                      value={String(selectedNode.data.role)}
                      onChange={(e) => {
                        setSelectedNode((prev) => 
                          prev ? { ...prev, data: { ...prev.data, role: e.target.value } } : prev
                        );
                        graphStateRef.current?.updateNodeData(selectedNode.id, { role: e.target.value });
                      }}
                    />
                  </div>
                )}
                
                {selectedNode.type === "skill" && !!selectedNode.data?.category && (
                  <div className="sidebar__field">
                    <label>Category</label>
                    <input
                      className="sidebar__input"
                      value={String(selectedNode.data.category)}
                      onChange={(e) => {
                        setSelectedNode((prev) => 
                          prev ? { ...prev, data: { ...prev.data, category: e.target.value } } : prev
                        );
                        graphStateRef.current?.updateNodeData(selectedNode.id, { category: e.target.value });
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Connected Skills for Person nodes */}
              {selectedNode.type === "person" && (
                <div className="sidebar__section">
                  <h3>Connected Skills</h3>
                  {(() => {
                    const edges = graphStateRef.current?.edges || [];
                    const nodes = graphStateRef.current?.nodes || [];
                    
                    const personEdges = edges.filter(e => e.source === selectedNode.id);
                    if (personEdges.length === 0) {
                      return <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No skills connected.</div>;
                    }

                    return (
                      <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', listStyle: 'none', padding: 0 }}>
                        {personEdges.map(edge => {
                          const skillNode = nodes.find(n => n.id === edge.target);
                          const skillName = skillNode?.data?.label || "Unknown Skill";
                          const proficiency = edge.data?.proficiency || edge.label || "familiar";
                          return (
                            <li key={edge.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                              <span>{String(skillName)}</span>
                              <span className={`sidebar__badge ${proficiency === 'expert' ? 'sidebar__badge--green' : ''}`}>
                                {String(proficiency)}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    );
                  })()}
                </div>
              )}

              {/* Sidebar Actions */}
              <div className="sidebar__section border-t border-slate-700/50 mt-6 pt-6 flex flex-col gap-3">
                <button
                  onClick={handleSave}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-lg shadow-lg shadow-emerald-900/40 transition-all flex items-center justify-center gap-2 border-none"
                >
                  <span className="text-lg">💾</span> Save Graph
                </button>
                <button
                  onClick={handleDeleteNode}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-4 rounded-lg shadow-lg shadow-red-900/40 transition-all flex items-center justify-center gap-2 border-none"
                >
                  <span className="text-lg">🗑</span> Delete Node
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </main>
  );
}
