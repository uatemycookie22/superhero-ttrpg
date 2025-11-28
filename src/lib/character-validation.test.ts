import { test, describe } from 'node:test';
import assert from 'node:assert';
import { characterStatsSchema, calculateTotalPoints, getStatWithProficiency } from './character-validation.js';

describe('characterStatsSchema', () => {
  describe('individual stat bounds', () => {
    test('accepts stats at minimum (0)', () => {
      const result = characterStatsSchema.safeParse({
        charm: 0, agility: 0, might: 0, prowess: 0, endurance: 0, resolve: 0
      });
      assert.strictEqual(result.success, true);
    });

    test('accepts stats at maximum (10)', () => {
      const result = characterStatsSchema.safeParse({
        charm: 10, agility: 10, might: 10, prowess: 0, endurance: 0, resolve: 0
      });
      assert.strictEqual(result.success, true);
    });

    test('rejects stat below minimum (-1)', () => {
      const result = characterStatsSchema.safeParse({
        charm: -1, agility: 0, might: 0, prowess: 0, endurance: 0, resolve: 0
      });
      assert.strictEqual(result.success, false);
    });

    test('rejects stat above maximum (11)', () => {
      const result = characterStatsSchema.safeParse({
        charm: 11, agility: 0, might: 0, prowess: 0, endurance: 0, resolve: 0
      });
      assert.strictEqual(result.success, false);
    });

    test('rejects non-integer stats', () => {
      const result = characterStatsSchema.safeParse({
        charm: 5.5, agility: 0, might: 0, prowess: 0, endurance: 0, resolve: 0
      });
      assert.strictEqual(result.success, false, 'Should reject float values');
    });
  });

  describe('total points constraint (max 30)', () => {
    test('accepts exactly 30 total points', () => {
      const result = characterStatsSchema.safeParse({
        charm: 5, agility: 5, might: 5, prowess: 5, endurance: 5, resolve: 5
      });
      assert.strictEqual(result.success, true);
    });

    test('rejects 31 total points', () => {
      const result = characterStatsSchema.safeParse({
        charm: 6, agility: 5, might: 5, prowess: 5, endurance: 5, resolve: 5
      });
      assert.strictEqual(result.success, false);
    });

    test('accepts 0 total points', () => {
      const result = characterStatsSchema.safeParse({
        charm: 0, agility: 0, might: 0, prowess: 0, endurance: 0, resolve: 0
      });
      assert.strictEqual(result.success, true);
    });
  });

  describe('proficiencies', () => {
    test('accepts empty proficiencies', () => {
      const result = characterStatsSchema.safeParse({
        charm: 5, agility: 5, might: 5, prowess: 5, endurance: 5, resolve: 5,
        proficiencies: []
      });
      assert.strictEqual(result.success, true);
    });

    test('accepts 1 proficiency', () => {
      const result = characterStatsSchema.safeParse({
        charm: 5, agility: 5, might: 5, prowess: 5, endurance: 5, resolve: 5,
        proficiencies: ['charm']
      });
      assert.strictEqual(result.success, true);
    });

    test('accepts 2 proficiencies', () => {
      const result = characterStatsSchema.safeParse({
        charm: 5, agility: 5, might: 5, prowess: 5, endurance: 5, resolve: 5,
        proficiencies: ['charm', 'might']
      });
      assert.strictEqual(result.success, true);
    });

    test('rejects 3 proficiencies', () => {
      const result = characterStatsSchema.safeParse({
        charm: 5, agility: 5, might: 5, prowess: 5, endurance: 5, resolve: 5,
        proficiencies: ['charm', 'might', 'agility']
      });
      assert.strictEqual(result.success, false);
    });

    test('rejects invalid proficiency name', () => {
      const result = characterStatsSchema.safeParse({
        charm: 5, agility: 5, might: 5, prowess: 5, endurance: 5, resolve: 5,
        proficiencies: ['invalid']
      });
      assert.strictEqual(result.success, false);
    });

    test('rejects duplicate proficiencies', () => {
      const result = characterStatsSchema.safeParse({
        charm: 5, agility: 5, might: 5, prowess: 5, endurance: 5, resolve: 5,
        proficiencies: ['charm', 'charm']
      });
      assert.strictEqual(result.success, false, 'Should reject duplicate proficiencies');
    });

    test('accepts undefined proficiencies', () => {
      const result = characterStatsSchema.safeParse({
        charm: 5, agility: 5, might: 5, prowess: 5, endurance: 5, resolve: 5
      });
      assert.strictEqual(result.success, true);
    });
  });

  describe('level validation', () => {
    test('accepts level 0', () => {
      const result = characterStatsSchema.safeParse({
        charm: 5, agility: 5, might: 5, prowess: 5, endurance: 5, resolve: 5,
        level: 0
      });
      assert.strictEqual(result.success, true);
    });

    test('accepts level 20', () => {
      const result = characterStatsSchema.safeParse({
        charm: 5, agility: 5, might: 5, prowess: 5, endurance: 5, resolve: 5,
        level: 20
      });
      assert.strictEqual(result.success, true);
    });

    test('rejects level -1', () => {
      const result = characterStatsSchema.safeParse({
        charm: 5, agility: 5, might: 5, prowess: 5, endurance: 5, resolve: 5,
        level: -1
      });
      assert.strictEqual(result.success, false, 'Should reject negative level');
    });

    test('rejects level 21', () => {
      const result = characterStatsSchema.safeParse({
        charm: 5, agility: 5, might: 5, prowess: 5, endurance: 5, resolve: 5,
        level: 21
      });
      assert.strictEqual(result.success, false, 'Should reject level > 20');
    });

    test('rejects non-integer level', () => {
      const result = characterStatsSchema.safeParse({
        charm: 5, agility: 5, might: 5, prowess: 5, endurance: 5, resolve: 5,
        level: 5.5
      });
      assert.strictEqual(result.success, false, 'Should reject float level');
    });
  });

  describe('missing fields', () => {
    test('rejects missing charm', () => {
      const result = characterStatsSchema.safeParse({
        agility: 5, might: 5, prowess: 5, endurance: 5, resolve: 5
      });
      assert.strictEqual(result.success, false);
    });

    test('rejects null stat', () => {
      const result = characterStatsSchema.safeParse({
        charm: null, agility: 5, might: 5, prowess: 5, endurance: 5, resolve: 5
      });
      assert.strictEqual(result.success, false);
    });
  });
});

describe('calculateTotalPoints', () => {
  test('sums all stats', () => {
    const total = calculateTotalPoints({
      charm: 1, agility: 2, might: 3, prowess: 4, endurance: 5, resolve: 6
    });
    assert.strictEqual(total, 21);
  });

  test('handles missing stats as 0', () => {
    const total = calculateTotalPoints({ charm: 5 });
    assert.strictEqual(total, 5);
  });

  test('handles empty object', () => {
    const total = calculateTotalPoints({});
    assert.strictEqual(total, 0);
  });
});

describe('getStatWithProficiency', () => {
  test('returns base value without proficiency', () => {
    const value = getStatWithProficiency('charm', 5, []);
    assert.strictEqual(value, 5);
  });

  test('adds +3 bonus with proficiency', () => {
    const value = getStatWithProficiency('charm', 5, ['charm']);
    assert.strictEqual(value, 8);
  });

  test('no bonus for different proficiency', () => {
    const value = getStatWithProficiency('charm', 5, ['might']);
    assert.strictEqual(value, 5);
  });

  test('handles undefined proficiencies', () => {
    const value = getStatWithProficiency('charm', 5);
    assert.strictEqual(value, 5);
  });
});


// ============ SKILL TREE VALIDATION TESTS ============

import { calculateSkillPoints, calculateSpentSkillPoints, canAccessTree, canUnlockSkill } from './character-validation.js';

describe('calculateSkillPoints', () => {
  test('level 0 gives 3 base points', () => {
    assert.strictEqual(calculateSkillPoints(0), 3);
  });

  test('level 1 gives 5 points (1*2 + 3)', () => {
    assert.strictEqual(calculateSkillPoints(1), 5);
  });

  test('level 10 gives 23 points (10*2 + 3)', () => {
    assert.strictEqual(calculateSkillPoints(10), 23);
  });

  test('level 20 gives 43 points (20*2 + 3)', () => {
    assert.strictEqual(calculateSkillPoints(20), 43);
  });
});

describe('calculateSpentSkillPoints', () => {
  test('empty skills = 0 points', () => {
    assert.strictEqual(calculateSpentSkillPoints({}), 0);
  });

  test('counts skills across trees', () => {
    assert.strictEqual(calculateSpentSkillPoints({
      'strength': ['skill1', 'skill2'],
      'psionics': ['skill3']
    }), 3);
  });
});

describe('canAccessTree', () => {
  const strengthTree = { id: 'strength', attribute: 'might' };
  
  describe('Rule 1: proficiency OR stat >= 5', () => {
    test('allows access with proficiency', () => {
      const char = { level: 0, proficiencies: ['might'], stats: { might: 0 }, skills: {} };
      assert.strictEqual(canAccessTree(strengthTree, char).allowed, true);
    });

    test('allows access with stat >= 5', () => {
      const char = { level: 0, proficiencies: [], stats: { might: 5 }, skills: {} };
      assert.strictEqual(canAccessTree(strengthTree, char).allowed, true);
    });

    test('denies access without proficiency and stat < 5', () => {
      const char = { level: 0, proficiencies: [], stats: { might: 4 }, skills: {} };
      const result = canAccessTree(strengthTree, char);
      assert.strictEqual(result.allowed, false);
      assert.ok(result.reason?.includes('proficiency or stat >= 5'));
    });
  });

  describe('Rule 2 & 3: first 3 points any tree, after only unlocked trees', () => {
    test('allows any accessible tree with 0 points spent', () => {
      const char = { level: 0, proficiencies: ['might'], stats: {}, skills: {} };
      assert.strictEqual(canAccessTree(strengthTree, char).allowed, true);
    });

    test('allows any accessible tree with 2 points spent', () => {
      const char = { level: 0, proficiencies: ['might'], stats: {}, skills: { 'other': ['s1', 's2'] } };
      assert.strictEqual(canAccessTree(strengthTree, char).allowed, true);
    });

    test('denies new tree after 3 points spent', () => {
      const char = { level: 5, proficiencies: ['might'], stats: {}, skills: { 'other': ['s1', 's2', 's3'] } };
      const result = canAccessTree(strengthTree, char);
      assert.strictEqual(result.allowed, false);
      assert.ok(result.reason?.includes('After 3 points'));
    });

    test('allows tree with skills after 3 points spent', () => {
      const char = { level: 5, proficiencies: ['might'], stats: {}, skills: { 'strength': ['s1'], 'other': ['s2', 's3'] } };
      assert.strictEqual(canAccessTree(strengthTree, char).allowed, true);
    });
  });
});

describe('canUnlockSkill', () => {
  const tree = {
    id: 'strength',
    attribute: 'might',
    skills: [
      { id: 'root-skill', prerequisites: [] },
      { id: 'child-skill', prerequisites: ['root-skill'] },
    ]
  };

  test('allows unlocking root skill with access and points', () => {
    const char = { level: 1, proficiencies: ['might'], stats: {}, skills: {} };
    assert.strictEqual(canUnlockSkill('root-skill', tree, char).allowed, true);
  });

  test('denies if no tree access', () => {
    const char = { level: 1, proficiencies: [], stats: { might: 0 }, skills: {} };
    const result = canUnlockSkill('root-skill', tree, char);
    assert.strictEqual(result.allowed, false);
  });

  test('denies if skill already unlocked', () => {
    const char = { level: 1, proficiencies: ['might'], stats: {}, skills: { 'strength': ['root-skill'] } };
    const result = canUnlockSkill('root-skill', tree, char);
    assert.strictEqual(result.allowed, false);
    assert.ok(result.reason?.includes('already unlocked'));
  });

  test('denies if no points available', () => {
    const char = { level: 0, proficiencies: ['might'], stats: {}, skills: { 'strength': ['s1', 's2', 's3'] } };
    const result = canUnlockSkill('root-skill', tree, char);
    assert.strictEqual(result.allowed, false);
    assert.ok(result.reason?.includes('No skill points'));
  });

  test('denies if prerequisites not met', () => {
    const char = { level: 1, proficiencies: ['might'], stats: {}, skills: {} };
    const result = canUnlockSkill('child-skill', tree, char);
    assert.strictEqual(result.allowed, false);
    assert.ok(result.reason?.includes('Prerequisites'));
  });

  test('allows child skill when prerequisites met', () => {
    const char = { level: 1, proficiencies: ['might'], stats: {}, skills: { 'strength': ['root-skill'] } };
    assert.strictEqual(canUnlockSkill('child-skill', tree, char).allowed, true);
  });

  test('denies if skill not in tree', () => {
    const char = { level: 1, proficiencies: ['might'], stats: {}, skills: {} };
    const result = canUnlockSkill('nonexistent', tree, char);
    assert.strictEqual(result.allowed, false);
    assert.ok(result.reason?.includes('not found'));
  });
});
