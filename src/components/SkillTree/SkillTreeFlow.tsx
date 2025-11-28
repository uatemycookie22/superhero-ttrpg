'use client';
import { useMemo, useCallback } from 'react';
import { ReactFlow, Node, Edge, NodeMouseHandler, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import SkillNode from './SkillNode';
import { Skill, SkillTree, SkillStatus } from '@/types/skills';

// Force nodes to be visible and allow overflow for rings/borders
const flowStyles = `
  .react-flow,
  .react-flow__viewport,
  .react-flow__renderer,
  .react-flow__node {
    overflow: visible !important;
  }
  .react-flow__node {
    visibility: visible !important;
  }
  .react-flow__node.selected > div {
    box-shadow: none !important;
  }
`;

interface SkillTreeFlowProps {
  tree: SkillTree;
  unlockedSkills: string[];
  selectedSkillId?: string;
  onSkillSelect: (skill: Skill, status: SkillStatus) => void;
}

const nodeTypes = { skill: SkillNode };

function getSkillStatus(skill: Skill, unlockedSkills: string[]): SkillStatus {
  if (unlockedSkills.includes(skill.id)) return 'unlocked';
  const prereqsMet = skill.prerequisites.every(p => unlockedSkills.includes(p));
  return prereqsMet || skill.prerequisites.length === 0 ? 'available' : 'locked';
}

function buildGraph(tree: SkillTree, unlockedSkills: string[], selectedSkillId?: string) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  const depths: Record<string, number> = {};
  const getDepth = (skillId: string, visited = new Set<string>()): number => {
    if (depths[skillId] !== undefined) return depths[skillId];
    if (visited.has(skillId)) return 0;
    visited.add(skillId);
    
    const skill = tree.skills.find(s => s.id === skillId);
    if (!skill || skill.prerequisites.length === 0) {
      depths[skillId] = 0;
      return 0;
    }
    const maxPrereq = Math.max(...skill.prerequisites.map(p => getDepth(p, visited)));
    depths[skillId] = maxPrereq + 1;
    return depths[skillId];
  };
  
  tree.skills.forEach(s => getDepth(s.id));
  
  const byDepth: Record<number, Skill[]> = {};
  tree.skills.forEach(skill => {
    const d = depths[skill.id];
    if (!byDepth[d]) byDepth[d] = [];
    byDepth[d].push(skill);
  });
  
  const NODE_WIDTH = 70;
  const NODE_HEIGHT = 80;
  const maxRowWidth = Math.max(...Object.values(byDepth).map(row => row.length)) * NODE_WIDTH;
  
  tree.skills.forEach(skill => {
    const depth = depths[skill.id];
    const row = byDepth[depth];
    const index = row.indexOf(skill);
    const rowWidth = row.length * NODE_WIDTH;
    const offsetX = (maxRowWidth - rowWidth) / 2;
    
    nodes.push({
      id: skill.id,
      type: 'skill',
      position: { x: offsetX + index * NODE_WIDTH, y: depth * NODE_HEIGHT },
      data: { label: skill.name, status: getSkillStatus(skill, unlockedSkills), skillId: skill.id, icon: skill.icon, selected: skill.id === selectedSkillId },
    });
    
    skill.prerequisites.forEach(prereq => {
      edges.push({
        id: `${prereq}-${skill.id}`,
        source: prereq,
        target: skill.id,
        style: { stroke: unlockedSkills.includes(prereq) ? '#8b5cf6' : '#6b7280' },
      });
    });
  });
  
  const maxDepth = Math.max(...Object.keys(byDepth).map(Number));
  return { nodes, edges, width: maxRowWidth + 50, height: (maxDepth + 1) * NODE_HEIGHT + 50 };
}

function Flow({ tree, unlockedSkills, selectedSkillId, onSkillSelect }: SkillTreeFlowProps) {
  const { nodes, edges, width, height } = useMemo(() => buildGraph(tree, unlockedSkills, selectedSkillId), [tree, unlockedSkills, selectedSkillId]);

  const handleNodeClick: NodeMouseHandler = useCallback((_, node) => {
    const skill = tree.skills.find(s => s.id === node.id);
    if (skill) onSkillSelect(skill, getSkillStatus(skill, unlockedSkills));
  }, [tree, unlockedSkills, onSkillSelect]);

  return (
    <div className="flex justify-center w-full">
      <style>{flowStyles}</style>
      <div style={{ width, height }}>
        <ReactFlow
          key={tree.id}
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          minZoom={1}
          maxZoom={1}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          proOptions={{ hideAttribution: true }}
        />
      </div>
    </div>
  );
}

export default function SkillTreeFlow(props: SkillTreeFlowProps) {
  return (
    <ReactFlowProvider>
      <Flow {...props} />
    </ReactFlowProvider>
  );
}
