import { z } from 'zod';

const STAT_NAMES = ['charm', 'agility', 'might', 'prowess', 'endurance', 'resolve'] as const;
const MAX_BASE_POINTS = 30;
const PROFICIENCY_BONUS = 3;

export const characterStatsSchema = z.object({
  charm: z.number().int().min(0).max(10),
  agility: z.number().int().min(0).max(10),
  might: z.number().int().min(0).max(10),
  prowess: z.number().int().min(0).max(10),
  endurance: z.number().int().min(0).max(10),
  resolve: z.number().int().min(0).max(10),
  level: z.number().int().min(0).max(20).optional(),
  proficiencies: z.array(z.enum(STAT_NAMES)).max(2).optional()
    .refine((arr) => {
      if (!arr) return true;
      return new Set(arr).size === arr.length;
    }, { message: 'Proficiencies must be unique' }),
}).refine((data) => {
  const total = data.charm + data.agility + data.might + data.prowess + data.endurance + data.resolve;
  return total <= MAX_BASE_POINTS;
}, {
  message: `Total stat points cannot exceed ${MAX_BASE_POINTS}`,
});

export type CharacterStats = z.infer<typeof characterStatsSchema>;
type CamperAttr = typeof STAT_NAMES[number];

export function calculateTotalPoints(stats: Partial<CharacterStats>): number {
  return (stats.charm || 0) + (stats.agility || 0) + (stats.might || 0) + 
         (stats.prowess || 0) + (stats.endurance || 0) + (stats.resolve || 0);
}

export function getStatWithProficiency(
  stat: CamperAttr, 
  baseValue: number, 
  proficiencies: CamperAttr[] = []
): number {
  return baseValue + (proficiencies.includes(stat) ? PROFICIENCY_BONUS : 0);
}

// ============ SKILL TREE VALIDATION ============

export function calculateSkillPoints(level: number): number {
  return level * 2 + 3;
}

export function calculateSpentSkillPoints(skills: Record<string, string[]>): number {
  return Object.values(skills).flat().length;
}

export interface SkillTreeAccess {
  id: string;
  attribute: string;
}

export interface CharacterForSkills {
  level: number;
  proficiencies: string[];
  stats: Record<string, number>;
  skills: Record<string, string[]>;
}

/**
 * Rule 1: Must be proficient OR stat >= 5 in tree's attribute
 * Rule 2: First 3 points can go in any accessible tree
 * Rule 3: After 3 points, only trees with skills already unlocked
 */
export function canAccessTree(
  tree: SkillTreeAccess,
  character: CharacterForSkills
): { allowed: boolean; reason?: string } {
  const attr = tree.attribute;
  const statValue = character.stats[attr] || 0;
  const hasProficiency = character.proficiencies.includes(attr);
  
  if (!hasProficiency && statValue < 5) {
    return { allowed: false, reason: `Requires ${attr} proficiency or stat >= 5` };
  }
  
  const spentPoints = calculateSpentSkillPoints(character.skills);
  const treeHasSkills = (character.skills[tree.id]?.length || 0) > 0;
  
  if (spentPoints >= 3 && !treeHasSkills) {
    return { allowed: false, reason: 'After 3 points, only trees with skills unlocked' };
  }
  
  return { allowed: true };
}

/**
 * Check if skill can be unlocked
 */
export function canUnlockSkill(
  skillId: string,
  tree: SkillTreeAccess & { skills: { id: string; prerequisites: string[] }[] },
  character: CharacterForSkills
): { allowed: boolean; reason?: string } {
  const treeAccess = canAccessTree(tree, character);
  if (!treeAccess.allowed) return treeAccess;
  
  const treeSkills = character.skills[tree.id] || [];
  if (treeSkills.includes(skillId)) {
    return { allowed: false, reason: 'Skill already unlocked' };
  }
  
  const totalPoints = calculateSkillPoints(character.level);
  const spentPoints = calculateSpentSkillPoints(character.skills);
  if (spentPoints >= totalPoints) {
    return { allowed: false, reason: 'No skill points available' };
  }
  
  const skill = tree.skills.find(s => s.id === skillId);
  if (!skill) {
    return { allowed: false, reason: 'Skill not found in tree' };
  }
  
  const prereqsMet = skill.prerequisites.every(p => treeSkills.includes(p));
  if (!prereqsMet) {
    return { allowed: false, reason: 'Prerequisites not met' };
  }
  
  return { allowed: true };
}


/**
 * Validate character stats from attributes object
 */
export function validateCharacterStats(attributes: Record<string, unknown>): { success: boolean; error?: string } {
  const stats = {
    charm: attributes.charm ?? 0,
    agility: attributes.agility ?? 0,
    might: attributes.might ?? 0,
    prowess: attributes.prowess ?? 0,
    endurance: attributes.endurance ?? 0,
    resolve: attributes.resolve ?? 0,
    level: attributes.level,
    proficiencies: attributes.proficiencies,
  };
  
  const validation = characterStatsSchema.safeParse(stats);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || 'Validation failed' };
  }
  return { success: true };
}
