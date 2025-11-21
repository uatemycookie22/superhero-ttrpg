import { z } from 'zod';

const STAT_NAMES = ['charm', 'agility', 'might', 'power', 'endurance', 'resolve'] as const;
const MAX_BASE_POINTS = 30;
const PROFICIENCY_BONUS = 3;

export const characterStatsSchema = z.object({
  charm: z.number().min(0).max(10),
  agility: z.number().min(0).max(10),
  might: z.number().min(0).max(10),
  power: z.number().min(0).max(10),
  endurance: z.number().min(0).max(10),
  resolve: z.number().min(0).max(10),
  proficiencies: z.array(z.enum(STAT_NAMES)).max(2).optional(),
}).refine((data) => {
  const total = data.charm + data.agility + data.might + data.power + data.endurance + data.resolve;
  return total <= MAX_BASE_POINTS;
}, {
  message: `Total stat points cannot exceed ${MAX_BASE_POINTS}`,
});

export type CharacterStats = z.infer<typeof characterStatsSchema>;

export function calculateTotalPoints(stats: Partial<CharacterStats>): number {
  return (stats.charm || 0) + (stats.agility || 0) + (stats.might || 0) + 
         (stats.power || 0) + (stats.endurance || 0) + (stats.resolve || 0);
}

export function getStatWithProficiency(
  stat: typeof STAT_NAMES[number], 
  baseValue: number, 
  proficiencies: typeof STAT_NAMES[number][] = []
): number {
  return baseValue + (proficiencies.includes(stat) ? PROFICIENCY_BONUS : 0);
}
