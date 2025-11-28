export interface Skill {
  id: string;
  name: string;
  description: string;
  prerequisites: string[];
  icon?: string;
}

export interface SkillTree {
  id: string;
  name: string;
  attribute: string;
  skills: Skill[];
}

export interface SkillTreeData {
  skillTrees: SkillTree[];
}

export type SkillStatus = 'locked' | 'available' | 'unlocked';
