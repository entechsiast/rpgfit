/**
 * contextualMessages — Data module tests
 *
 * Tests the message pool data structure and getMessagePool function.
 */

import { getMessagePool, getFloorEntryTrigger } from './contextualMessages';

describe('contextualMessages data', () => {
  describe('getMessagePool', () => {
    it('returns messages for floor 1 entry', () => {
      const pool = getMessagePool('FLOOR_ENTRY', 1);
      expect(Array.isArray(pool)).toBe(true);
      expect(pool.length).toBeGreaterThan(0);
      expect(pool[0]).toBeTruthy();
    });

    it('returns messages for floor 2 entry', () => {
      const pool = getMessagePool('FLOOR_ENTRY', 2);
      expect(Array.isArray(pool)).toBe(true);
      expect(pool.length).toBeGreaterThan(0);
    });

    it('returns messages for floor 3 entry', () => {
      const pool = getMessagePool('FLOOR_ENTRY', 3);
      expect(Array.isArray(pool)).toBe(true);
      expect(pool.length).toBeGreaterThan(0);
    });

    it('returns messages for floor 4 entry', () => {
      const pool = getMessagePool('FLOOR_ENTRY', 4);
      expect(Array.isArray(pool)).toBe(true);
      expect(pool.length).toBeGreaterThan(0);
    });

    it('returns messages for floor 5 entry', () => {
      const pool = getMessagePool('FLOOR_ENTRY', 5);
      expect(Array.isArray(pool)).toBe(true);
      expect(pool.length).toBeGreaterThan(0);
    });

    it('returns messages for unknown floor (defaults to floor 1)', () => {
      const pool = getMessagePool('FLOOR_ENTRY', 99);
      expect(Array.isArray(pool)).toBe(true);
      expect(pool.length).toBeGreaterThan(0);
    });

    it('returns combat start messages', () => {
      const pool = getMessagePool('COMBAT_START');
      expect(Array.isArray(pool)).toBe(true);
      expect(pool.length).toBe(2);
    });

    it('returns floor complete messages', () => {
      const pool = getMessagePool('FLOOR_COMPLETE');
      expect(Array.isArray(pool)).toBe(true);
      expect(pool.length).toBe(2);
    });

    it('returns death messages', () => {
      const pool = getMessagePool('DEATH');
      expect(Array.isArray(pool)).toBe(true);
      expect(pool.length).toBe(2);
    });

    it('returns empty array for unknown trigger', () => {
      const pool = getMessagePool('UNKNOWN');
      expect(pool).toEqual([]);
    });
  });

  describe('getFloorEntryTrigger', () => {
    it('returns FLOOR_ENTRY for any floor number', () => {
      expect(getFloorEntryTrigger(1)).toBe('FLOOR_ENTRY');
      expect(getFloorEntryTrigger(5)).toBe('FLOOR_ENTRY');
      expect(getFloorEntryTrigger(10)).toBe('FLOOR_ENTRY');
    });
  });
});
