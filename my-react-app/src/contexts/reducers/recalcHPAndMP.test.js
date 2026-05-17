import { recalcHPAndMP } from './hpMpRecalc';
import { BASE_STAT } from '../../data/stats';

describe('recalcHPAndMP utility', () => {
  const makeState = (overrides = {}) => ({
    class: { id: 'warrior', name: 'Warrior', hitDie: 'd12' },
    stats: { str: BASE_STAT, dex: BASE_STAT, con: BASE_STAT, int: BASE_STAT, wis: BASE_STAT, cha: BASE_STAT },
    equipment: { head: null, chest: null, pants: null, boots: null, rightHand: null, leftHand: null, accessory1: null, accessory2: null, accessory3: null },
    level: 1,
    currentHP: 10,
    currentMP: 5,
    ...overrides,
  });

  describe('no class', () => {
    it('returns default HP/MP when class is null', () => {
      const state = makeState({ class: null, currentHP: 50, currentMP: 30 });
      const result = recalcHPAndMP(state);
      expect(result.maxHP).toBe(10);
      expect(result.currentHP).toBe(50);
      expect(result.maxMP).toBe(5);
      expect(result.currentMP).toBe(30);
    });
  });

  describe('base stats', () => {
    it('calculates HP for warrior with base CON', () => {
      const state = makeState();
      const result = recalcHPAndMP(state);
      // Warrior d12 + CON mod(0) + levelBonus(0) = 12
      expect(result.maxHP).toBe(12);
    });

    it('calculates MP with base INT/WIS', () => {
      const state = makeState();
      const result = recalcHPAndMP(state);
      // floor(0/2) + floor(0/2) + 0 = 0
      expect(result.maxMP).toBe(0);
    });

    it('clamps currentHP to maxHP when above', () => {
      const state = makeState({ currentHP: 20 });
      const result = recalcHPAndMP(state);
      expect(result.maxHP).toBe(12);
      expect(result.currentHP).toBe(12);
    });

    it('clamps currentMP to maxMP when above', () => {
      const state = makeState({ currentMP: 10 });
      const result = recalcHPAndMP(state);
      expect(result.maxMP).toBe(0);
      expect(result.currentMP).toBe(0);
    });
  });

  describe('with equipment bonuses', () => {
    it('includes CON bonus from equipped items', () => {
      const state = makeState({
        equipment: {
          head: { statBonuses: { con: 2 } },
          chest: { statBonuses: { con: 3 } },
          pants: null, boots: null, rightHand: null, leftHand: null,
          accessory1: null, accessory2: null, accessory3: null,
        },
      });
      const result = recalcHPAndMP(state);
      // effectiveCon = 8 + 5 = 13, CON mod = 2
      // HP = 12 + 2 + levelBonus = 12 + 2 + (0 * (6 + 1)) = 14
      expect(result.maxHP).toBe(14);
    });

    it('includes INT bonus from equipped items', () => {
      const state = makeState({
        equipment: {
          head: { statBonuses: { int: 4 } },
          chest: null, pants: null, boots: null, rightHand: null, leftHand: null,
          accessory1: null, accessory2: null, accessory3: null,
        },
      });
      const result = recalcHPAndMP(state);
      // effectiveInt = 8 + 4 = 12, INT mod = 2
      // MP = floor(2/2) + floor(0/2) + 0 = 1
      expect(result.maxMP).toBe(1);
    });

    it('includes WIS bonus from equipped items', () => {
      const state = makeState({
        equipment: {
          head: { statBonuses: { wis: 4 } },
          chest: null, pants: null, boots: null, rightHand: null, leftHand: null,
          accessory1: null, accessory2: null, accessory3: null,
        },
      });
      const result = recalcHPAndMP(state);
      // effectiveWis = 8 + 4 = 12, WIS mod = 2
      // MP = floor(0/2) + floor(2/2) + 0 = 1
      expect(result.maxMP).toBe(1);
    });
  });

  describe('level scaling', () => {
    it('calculates HP correctly at higher levels', () => {
      const state = makeState({ level: 5 });
      const result = recalcHPAndMP(state);
      // effectiveCon = 8, CON mod = 0
      // HP = 12 + 0 + (4 * (6 + 0)) = 12 + 24 = 36
      expect(result.maxHP).toBe(36);
    });

    it('calculates MP correctly at higher levels', () => {
      const state = makeState({ level: 5 });
      const result = recalcHPAndMP(state);
      // MP = 0 + 0 + (4 * 2) = 8
      expect(result.maxMP).toBe(8);
    });
  });

  describe('different classes', () => {
    it('calculates HP for mage (d4 hit die)', () => {
      const state = makeState({ class: { id: 'mage', name: 'Mage', hitDie: 'd4' } });
      const result = recalcHPAndMP(state);
      // HP = 4 + 0 + 0 = 4
      expect(result.maxHP).toBe(4);
    });

    it('calculates HP for wizard (d6 hit die)', () => {
      const state = makeState({ class: { id: 'wizard', name: 'Wizard', hitDie: 'd6' } });
      const result = recalcHPAndMP(state);
      // HP = 6 + 0 + 0 = 6
      expect(result.maxHP).toBe(6);
    });
  });

  describe('preserves identity', () => {
    it('returns a new object each time', () => {
      const state = makeState();
      const result1 = recalcHPAndMP(state);
      const result2 = recalcHPAndMP(state);
      expect(result1).not.toBe(result2);
    });
  });
});
