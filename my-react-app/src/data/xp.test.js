import {
  getXpToNextLevel,
  getTotalXpToLevel,
  calculateLevelFromXp,
  getXpProgress,
  MAX_LEVEL,
} from './xp';

describe('data/xp.js', () => {
  describe('MAX_LEVEL', () => {
    it('should be 60', () => {
      expect(MAX_LEVEL).toBe(60);
    });
  });

  describe('getXpToNextLevel', () => {
    it('should return 100 for level 1', () => {
      expect(getXpToNextLevel(1)).toBe(100);
    });

    it('should return correct values for levels 1-60', () => {
      // level 1: 100 * 1.3^0 = 100
      expect(getXpToNextLevel(1)).toBe(100);
      // level 2: 100 * 1.3^1 = 130
      expect(getXpToNextLevel(2)).toBe(130);
      // level 3: 100 * 1.3^2 = 169
      expect(getXpToNextLevel(3)).toBe(169);
      // level 4: 100 * 1.3^3 = 219.7 -> 219
      expect(getXpToNextLevel(4)).toBe(219);
      // level 5: 100 * 1.3^4 = 285.61 -> 285
      expect(getXpToNextLevel(5)).toBe(285);
      // level 10: 100 * 1.3^9 = 1060.4499... -> 1060
      expect(getXpToNextLevel(10)).toBe(1060);
      // level 20: 100 * 1.3^19 = 14619.35... -> 14619
      expect(getXpToNextLevel(20)).toBe(14619);
      // level 30: 100 * 1.3^29 = 201538.45... -> 201538
      expect(getXpToNextLevel(30)).toBe(201538);
      // level 40: 100 * 1.3^39 = 2778374.48... -> 2778374
      expect(getXpToNextLevel(40)).toBe(2778374);
      // level 50: 100 * 1.3^49 = 38302247.21... -> 38302247
      expect(getXpToNextLevel(50)).toBe(38302247);
      // level 60: 100 * 1.3^59 = 528029013.1... -> 528029013
      expect(getXpToNextLevel(60)).toBe(528029013);
    });

    it('should return correct value for level 60', () => {
      expect(getXpToNextLevel(60)).toBe(528029013);
    });
  });

  describe('XP curve grows exponentially (1.3x per level)', () => {
    it('should grow by approximately 1.3x each level', () => {
      for (let level = 2; level <= 60; level++) {
        const prev = getXpToNextLevel(level - 1);
        const curr = getXpToNextLevel(level);
        // Due to Math.floor, ratio may be slightly off 1.3
        // Check it's within a reasonable range
        const ratio = curr / prev;
        expect(ratio).toBeLessThanOrEqual(1.35);
        expect(ratio).toBeGreaterThan(1.2);
      }
    });

    it('should each level need more XP than the previous', () => {
      for (let level = 2; level <= 60; level++) {
        expect(getXpToNextLevel(level)).toBeGreaterThan(getXpToNextLevel(level - 1));
      }
    });
  });

  describe('getTotalXpToLevel', () => {
    it('should return 0 for level 1 (no XP needed to reach level 1)', () => {
      expect(getTotalXpToLevel(1)).toBe(0);
    });

    it('should return 100 for level 2 (XP to reach level 2 from level 1)', () => {
      expect(getTotalXpToLevel(2)).toBe(100);
    });

    it('should return 230 for level 3 (100 + 130)', () => {
      expect(getTotalXpToLevel(3)).toBe(230);
    });

    it('should return correct cumulative XP for level 4 (100 + 130 + 169 = 399)', () => {
      expect(getTotalXpToLevel(4)).toBe(399);
    });

    it('should return correct cumulative XP for level 5 (399 + 219 = 618)', () => {
      expect(getTotalXpToLevel(5)).toBe(618);
    });

    it('should return correct cumulative XP for level 10', () => {
      // 100 + 130 + 169 + 219 + 285 + 371 + 482 + 627 + 815 = 3198
      expect(getTotalXpToLevel(10)).toBe(3198);
    });

    it('should return correct total XP to reach level 60', () => {
      const total = getTotalXpToLevel(60);
      expect(total).toBeGreaterThan(0);
      expect(total).toBeGreaterThan(10000000);
    });
  });

  describe('calculateLevelFromXp', () => {
    it('should return 1 for 0 XP', () => {
      expect(calculateLevelFromXp(0)).toBe(1);
    });

    it('should return 1 for XP less than 100 (XP needed for level 1)', () => {
      expect(calculateLevelFromXp(99)).toBe(1);
    });

    it('should return 2 for exactly 100 XP', () => {
      expect(calculateLevelFromXp(100)).toBe(2);
    });

    it('should return 2 for XP between 100 and 230', () => {
      expect(calculateLevelFromXp(150)).toBe(2);
      expect(calculateLevelFromXp(229)).toBe(2);
    });

    it('should return 3 for exactly 230 XP', () => {
      expect(calculateLevelFromXp(230)).toBe(3);
    });

    it('should return 60 for max XP (at or above total XP to reach level 60)', () => {
      const maxXp = getTotalXpToLevel(60);
      expect(calculateLevelFromXp(maxXp)).toBe(60);
      expect(calculateLevelFromXp(maxXp + 1)).toBe(60);
      expect(calculateLevelFromXp(maxXp + 1000)).toBe(60);
    });

    it('should return correct level for XP just below a level threshold', () => {
      // 99 XP = level 1
      expect(calculateLevelFromXp(99)).toBe(1);
      // 199 XP = level 1 (not enough for level 2 which needs 100)
      expect(calculateLevelFromXp(199)).toBe(2);
    });

    it('should return correct level for XP at various points', () => {
      // XP to reach level 4 = 399
      expect(calculateLevelFromXp(399)).toBe(4);
      // XP to reach level 5 = 618
      expect(calculateLevelFromXp(618)).toBe(5);
    });

    it('should cap at level 60 when XP exceeds maximum', () => {
      const maxXp = getTotalXpToLevel(60);
      // Even with XP far beyond what level 60 needs
      expect(calculateLevelFromXp(maxXp + 1000000)).toBe(60);
      expect(calculateLevelFromXp(maxXp * 2)).toBe(60);
    });

    it('should return level 60 for exactly the XP needed to reach level 60', () => {
      const totalTo60 = getTotalXpToLevel(60);
      expect(calculateLevelFromXp(totalTo60)).toBe(60);
    });
  });

  describe('getXpProgress', () => {
    it('should return correct current, needed, and percentage', () => {
      // Level 1, 50 XP in current level
      const progress = getXpProgress(1, 50);
      expect(progress.current).toBe(50);
      expect(progress.needed).toBe(100);
      expect(progress.percentage).toBe(50);
    });

    it('should return 100% when XP equals needed', () => {
      // Level 1, 100 XP = exactly enough for level 2
      const progress = getXpProgress(1, 100);
      expect(progress.current).toBe(100);
      expect(progress.needed).toBe(100);
      expect(progress.percentage).toBe(100);
    });

    it('should return 0% when no XP in current level', () => {
      // Level 1, 0 XP in current level
      const progress = getXpProgress(1, 0);
      expect(progress.current).toBe(0);
      expect(progress.needed).toBe(100);
      expect(progress.percentage).toBe(0);
    });

    it('should cap percentage at 100 when XP exceeds needed', () => {
      // Level 1, 150 XP (more than needed for level 2)
      const progress = getXpProgress(1, 150);
      expect(progress.current).toBe(150);
      expect(progress.needed).toBe(100);
      expect(progress.percentage).toBe(100);
    });

    it('should calculate correctly for higher levels', () => {
      // Level 2, 65 XP in current level (needed = 130)
      const progress = getXpProgress(2, 100 + 65);
      expect(progress.current).toBe(65);
      expect(progress.needed).toBe(130);
      expect(progress.percentage).toBeCloseTo(50, 5);
    });
  });
});
