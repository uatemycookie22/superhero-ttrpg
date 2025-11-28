'use client';
import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Lock, Loader2 } from 'lucide-react';
import SkillTreeFlow from '@/components/SkillTree/SkillTreeFlow';
import SkillSnackbar from '@/components/SkillTree/SkillSnackbar';
import BackLink from '@/components/BackLink';
import { Skill, SkillStatus } from '@/types/skills';
import { getCharacter, updateCharacter } from '@/services/character-service';
import { getSkillTrees } from '@/services/skill-service';
import { Character } from '@/db/schema';

const CAMPER_ATTRS = ['charm', 'agility', 'might', 'prowess', 'endurance', 'resolve'] as const;

function getTreeLockReason(tree: { attribute: string; id: string }, character: Character, spentPoints: number, unlockedSkills: Record<string, string[]>): string | null {
  const attr = tree.attribute as typeof CAMPER_ATTRS[number];
  const statValue = (character.attributes?.[attr] as number) || 0;
  const proficiencies = (character.attributes?.proficiencies as string[]) || [];
  const hasAccess = proficiencies.includes(attr) || statValue >= 5;
  
  if (!hasAccess) {
    return `Requires ${attr.charAt(0).toUpperCase() + attr.slice(1)} proficiency or stat ≥ 5`;
  }
  
  if (spentPoints >= 3 && (unlockedSkills[tree.id]?.length || 0) === 0) {
    return 'Unlock a skill in this tree with your first 3 points to continue using it';
  }
  
  return null;
}

function canAccessTree(tree: { attribute: string; id: string }, character: Character, spentPoints: number, unlockedSkills: Record<string, string[]>): boolean {
  return getTreeLockReason(tree, character, spentPoints, unlockedSkills) === null;
}

export default function SkillsPage() {
  const params = useParams();
  const characterId = params.characterId as string;
  const queryClient = useQueryClient();

  const [activeTreeId, setActiveTreeId] = useState<string>('');
  const [selectedSkill, setSelectedSkill] = useState<{ skill: Skill; status: SkillStatus } | null>(null);

  const { data: character } = useQuery({
    queryKey: ['character', characterId],
    queryFn: () => getCharacter(characterId),
  });

  const { data: skillData } = useQuery({
    queryKey: ['skillTrees'],
    queryFn: getSkillTrees,
  });

  // Set initial active tree
  if (skillData && !activeTreeId && skillData.skillTrees[0]) {
    setActiveTreeId(skillData.skillTrees[0].id);
  }

  // Normalize skills - handle both old format (string[]) and new format ({id,name}[])
  const rawSkills = (character?.attributes?.skills as Record<string, (string | { id: string; name: string })[]>) || {};
  const unlockedSkillIds: Record<string, string[]> = {};
  for (const [treeId, skills] of Object.entries(rawSkills)) {
    unlockedSkillIds[treeId] = skills.map(s => typeof s === 'string' ? s : s.id);
  }

  const level = (character?.attributes?.level as number) || 0;
  const totalPoints = level * 2 + 3;
  const spentPoints = Object.values(unlockedSkillIds).flat().length;
  const availablePoints = totalPoints - spentPoints;

  const activeTree = skillData?.skillTrees.find(t => t.id === activeTreeId);
  const treeUnlocked = unlockedSkillIds[activeTreeId] || [];
  const treeAccessible = character && activeTree ? canAccessTree(activeTree, character, spentPoints, unlockedSkillIds) : false;

  const handleSkillSelect = useCallback((skill: Skill, status: SkillStatus) => {
    setSelectedSkill({ skill, status });
  }, []);

  const unlockMutation = useMutation({
    mutationFn: async (skillToUnlock: { id: string; name: string }) => {
      const currentSkills = (character!.attributes?.skills as Record<string, { id: string; name: string }[]>) || {};
      const newSkills = {
        ...currentSkills,
        [activeTreeId]: [...(currentSkills[activeTreeId] || []), skillToUnlock],
      };

      return updateCharacter(characterId, {
        attributes: { ...character!.attributes, skills: newSkills },
      });
    },
    onSuccess: (updated) => {
      if (updated) {
        queryClient.setQueryData(['character', characterId], updated);
        setSelectedSkill(prev => prev ? { ...prev, status: 'unlocked' } : null);
      }
    },
  });

  const handleUnlock = () => {
    if (!selectedSkill || !character || availablePoints < 1 || !treeAccessible) return;
    unlockMutation.mutate({ id: selectedSkill.skill.id, name: selectedSkill.skill.name });
  };

  if (!character || !skillData) return (
    <div className="min-h-screen">
      <div className="flex justify-between items-center py-2">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
      <div className="bg-gray-900 p-4 min-h-[80vh]">
        <div className="flex gap-2 mb-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 w-24 bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
        <div className="flex justify-center">
          <div className="w-64 h-64 bg-gray-800 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="flex justify-between items-center py-2">
        <BackLink href={`/character-sheet/${characterId}`}>Back to character</BackLink>
        <div className="bg-gray-200 dark:bg-gray-800 px-4 py-2 rounded-lg">
          <span className="text-gray-600 dark:text-gray-400">Skill Points: </span>
          <span className="font-bold text-violet-600 dark:text-violet-400">{availablePoints}</span>
          <span className="text-gray-500"> / {totalPoints}</span>
        </div>
      </div>

      <div className="bg-gray-900 text-white p-4 min-h-[80vh]">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {[...skillData.skillTrees].sort((a, b) => {
            if (spentPoints < 3) return 0;
            const aUnlocked = (unlockedSkillIds[a.id]?.length || 0) > 0;
            const bUnlocked = (unlockedSkillIds[b.id]?.length || 0) > 0;
            return aUnlocked === bUnlocked ? 0 : aUnlocked ? -1 : 1;
          }).map(tree => {
            const accessible = canAccessTree(tree, character, spentPoints, unlockedSkillIds);
            return (
              <button
                key={tree.id}
                onClick={() => setActiveTreeId(tree.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap flex items-center gap-2 ${
                  activeTreeId === tree.id
                    ? 'bg-violet-600 text-white'
                    : accessible
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-800 text-gray-500'
                }`}
              >
                {!accessible && <Lock size={14} />}
                {tree.name}
              </button>
            );
          })}
        </div>

        {activeTree && treeAccessible && (
          <SkillTreeFlow
            tree={activeTree}
            unlockedSkills={treeUnlocked}
            selectedSkillId={selectedSkill?.skill.id}
            onSkillSelect={handleSkillSelect}
          />
        )}

        {activeTree && !treeAccessible && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Lock size={48} className="mb-4" />
            <p>{getTreeLockReason(activeTree, character, spentPoints, unlockedSkillIds)}</p>
          </div>
        )}

        <SkillSnackbar
          skill={selectedSkill?.skill || null}
          status={selectedSkill?.status || 'locked'}
          onClose={() => setSelectedSkill(null)}
          onUnlock={handleUnlock}
          canAfford={availablePoints >= 1 && treeAccessible}
          isUnlocking={unlockMutation.isPending}
        />
      </div>
    </div>
  );
}
