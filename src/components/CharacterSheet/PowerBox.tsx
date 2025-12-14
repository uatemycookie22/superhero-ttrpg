'use client';

import { Zap } from 'lucide-react';

type SkillRef = string | { id: string; name: string };

interface PowerBoxProps {
  unlockedSkills: Record<string, SkillRef[]>;
  disabled?: boolean;
}

export default function PowerBox({ unlockedSkills }: PowerBoxProps) {
  const allSkills = Object.values(unlockedSkills).flat();
  const names = allSkills.map(s => typeof s === 'string' ? s : s.name);
  
  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex justify-between">
        <p>Powers</p>
        <Zap className="w-12 h-12" />
      </div>
      <p className="text-sm whitespace-pre-wrap">
        {names.length > 0 ? names.join(', ') : 'None unlocked'}
      </p>
    </div>
  );
}
