import { test, describe } from 'node:test';
import assert from 'node:assert';
import { validateCharacterStats } from '../lib/character-validation.js';

describe('validateCharacterStats', () => {
  describe('stat bounds', () => {
    test('accepts valid stats', () => {
      const result = validateCharacterStats({
        charm: 5, agility: 5, might: 5, prowess: 5, endurance: 5, resolve: 5
      });
      assert.strictEqual(result.success, true);
    });

    test('rejects stat above 10', () => {
      const result = validateCharacterStats({
        charm: 11, agility: 5, might: 5, prowess: 5, endurance: 5, resolve: 5
      });
      assert.strictEqual(result.success, false);
    });

    test('rejects stat below 0', () => {
      const result = validateCharacterStats({
        charm: -1, agility: 5, might: 5, prowess: 5, endurance: 5, resolve: 5
      });
      assert.strictEqual(result.success, false);
    });

    test('rejects non-integer stat', () => {
      const result = validateCharacterStats({
        charm: 5.5, agility: 5, might: 5, prowess: 5, endurance: 5, resolve: 5
      });
      assert.strictEqual(result.success, false);
    });
  });

  describe('total points constraint', () => {
    test('accepts exactly 30 points', () => {
      const result = validateCharacterStats({
        charm: 5, agility: 5, might: 5, prowess: 5, endurance: 5, resolve: 5
      });
      assert.strictEqual(result.success, true);
    });

    test('rejects 31 points', () => {
      const result = validateCharacterStats({
        charm: 6, agility: 5, might: 5, prowess: 5, endurance: 5, resolve: 5
      });
      assert.strictEqual(result.success, false);
    });
  });

  describe('proficiencies', () => {
    test('accepts 2 unique proficiencies', () => {
      const result = validateCharacterStats({
        charm: 5, agility: 5, might: 5, prowess: 5, endurance: 5, resolve: 5,
        proficiencies: ['charm', 'might']
      });
      assert.strictEqual(result.success, true);
    });

    test('rejects 3 proficiencies', () => {
      const result = validateCharacterStats({
        charm: 5, agility: 5, might: 5, prowess: 5, endurance: 5, resolve: 5,
        proficiencies: ['charm', 'might', 'agility']
      });
      assert.strictEqual(result.success, false);
    });

    test('rejects duplicate proficiencies', () => {
      const result = validateCharacterStats({
        charm: 5, agility: 5, might: 5, prowess: 5, endurance: 5, resolve: 5,
        proficiencies: ['charm', 'charm']
      });
      assert.strictEqual(result.success, false);
    });

    test('rejects invalid proficiency name', () => {
      const result = validateCharacterStats({
        charm: 5, agility: 5, might: 5, prowess: 5, endurance: 5, resolve: 5,
        proficiencies: ['invalid']
      });
      assert.strictEqual(result.success, false);
    });
  });

  describe('level validation', () => {
    test('accepts level 0', () => {
      const result = validateCharacterStats({
        charm: 5, agility: 5, might: 5, prowess: 5, endurance: 5, resolve: 5, level: 0
      });
      assert.strictEqual(result.success, true);
    });

    test('accepts level 20', () => {
      const result = validateCharacterStats({
        charm: 5, agility: 5, might: 5, prowess: 5, endurance: 5, resolve: 5, level: 20
      });
      assert.strictEqual(result.success, true);
    });

    test('rejects level -1', () => {
      const result = validateCharacterStats({
        charm: 5, agility: 5, might: 5, prowess: 5, endurance: 5, resolve: 5, level: -1
      });
      assert.strictEqual(result.success, false);
    });

    test('rejects level 21', () => {
      const result = validateCharacterStats({
        charm: 5, agility: 5, might: 5, prowess: 5, endurance: 5, resolve: 5, level: 21
      });
      assert.strictEqual(result.success, false);
    });

    test('rejects non-integer level', () => {
      const result = validateCharacterStats({
        charm: 5, agility: 5, might: 5, prowess: 5, endurance: 5, resolve: 5, level: 5.5
      });
      assert.strictEqual(result.success, false);
    });
  });
});
