'use client';
import { Handle, Position } from '@xyflow/react';
import { SkillStatus } from '@/types/skills';
import * as Icons from 'lucide-react';

interface SkillNodeData {
  label: string;
  status: SkillStatus;
  skillId: string;
  icon?: string;
  selected?: boolean;
}

const statusStyles: Record<SkillStatus, string> = {
  locked: 'bg-gray-400 border-gray-500 opacity-50 cursor-not-allowed',
  available: 'bg-violet-500 border-violet-600 cursor-pointer hover:scale-110 hover:brightness-110',
  unlocked: 'bg-violet-500 border-yellow-400 border-4 cursor-pointer hover:scale-110',
};

function getIcon(name?: string) {
  if (!name) return Icons.Zap;
  const pascalCase = name.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
  return (Icons as unknown as Record<string, Icons.LucideIcon>)[pascalCase] || Icons.Zap;
}

export default function SkillNode({ data }: { data: SkillNodeData }) {
  const Icon = getIcon(data.icon);
  const selectedStyle = data.selected ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110' : '';
  
  return (
    <div
      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 text-white transition-all duration-150 ${statusStyles[data.status]} ${selectedStyle}`}
      title={data.label}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Icon size={20} />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}
