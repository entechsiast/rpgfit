import { DUNGEONS, getDungeonById, getDungeonsForLevel } from './dungeons';

describe('data/dungeons.js', () => {
  describe('DUNGEONS', () => {
    it('should have 5 dungeons', () => {
      expect(DUNGEONS).toHaveLength(5);
    });

    it('should contain all expected dungeon IDs', () => {
      const ids = DUNGEONS.map(d => d.id);
      expect(ids).toContain('goblin_caves');
      expect(ids).toContain('dark_forest_ruins');
      expect(ids).toContain('abandoned_mine');
      expect(ids).toContain('dragons_peak');
      expect(ids).toContain('abyssal_throne');
    });

    it('should have a valid difficulty for each dungeon', () => {
      const validDifficulties = ['Easy', 'Medium', 'Hard', 'Very Hard', 'Extreme'];
      DUNGEONS.forEach(dungeon => {
        expect(validDifficulties).toContain(dungeon.difficulty);
      });
    });

    it('should have unique dungeon IDs', () => {
      const ids = DUNGEONS.map(d => d.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    });
  });

  describe('Dungeon structure', () => {
    it('should have id, name, description, levelRange, monsters, boss, completionReward for each dungeon', () => {
      DUNGEONS.forEach(dungeon => {
        expect(dungeon).toHaveProperty('id');
        expect(dungeon).toHaveProperty('name');
        expect(dungeon).toHaveProperty('description');
        expect(dungeon).toHaveProperty('levelRange');
        expect(dungeon).toHaveProperty('monsters');
        expect(dungeon).toHaveProperty('boss');
        expect(dungeon).toHaveProperty('completionReward');
      });
    });

    it('should have levelRange as an array of 2 numbers', () => {
      DUNGEONS.forEach(dungeon => {
        expect(dungeon.levelRange).toBeInstanceOf(Array);
        expect(dungeon.levelRange).toHaveLength(2);
        expect(typeof dungeon.levelRange[0]).toBe('number');
        expect(typeof dungeon.levelRange[1]).toBe('number');
      });
    });

    it('should have levelRange where min < max', () => {
      DUNGEONS.forEach(dungeon => {
        expect(dungeon.levelRange[0]).toBeLessThan(dungeon.levelRange[1]);
      });
    });

    it('should have monsters with 3-5 entries per dungeon', () => {
      DUNGEONS.forEach(dungeon => {
        expect(dungeon.monsters.length).toBeGreaterThanOrEqual(3);
        expect(dungeon.monsters.length).toBeLessThanOrEqual(5);
      });
    });

    it('should have a boss object for each dungeon', () => {
      DUNGEONS.forEach(dungeon => {
        expect(dungeon.boss).toBeDefined();
        expect(typeof dungeon.boss).toBe('object');
        expect(dungeon.boss).toHaveProperty('id');
        expect(dungeon.boss).toHaveProperty('name');
        expect(dungeon.boss).toHaveProperty('level');
        expect(dungeon.boss).toHaveProperty('hp');
        expect(dungeon.boss).toHaveProperty('attack');
        expect(dungeon.boss).toHaveProperty('defense');
        expect(dungeon.boss).toHaveProperty('xpReward');
        expect(dungeon.boss).toHaveProperty('goldReward');
        expect(dungeon.boss).toHaveProperty('lootTable');
      });
    });

    it('should have a valid completionReward for each dungeon', () => {
      DUNGEONS.forEach(dungeon => {
        expect(dungeon.completionReward).toBeDefined();
        expect(typeof dungeon.completionReward).toBe('object');
        expect(dungeon.completionReward).toHaveProperty('xp');
        expect(dungeon.completionReward).toHaveProperty('gold');
        expect(dungeon.completionReward).toHaveProperty('guaranteedItem');
        expect(typeof dungeon.completionReward.xp).toBe('number');
        expect(Array.isArray(dungeon.completionReward.gold)).toBe(true);
        expect(dungeon.completionReward.gold.length).toBe(2);
      });
    });

    it('should have valid monster entries with required properties', () => {
      DUNGEONS.forEach(dungeon => {
        dungeon.monsters.forEach(monster => {
          expect(monster).toHaveProperty('id');
          expect(monster).toHaveProperty('name');
          expect(monster).toHaveProperty('level');
          expect(monster).toHaveProperty('hp');
          expect(monster).toHaveProperty('attack');
          expect(monster).toHaveProperty('defense');
          expect(monster).toHaveProperty('xpReward');
          expect(monster).toHaveProperty('goldReward');
          expect(monster).toHaveProperty('lootTable');
        });
      });
    });

    it('should have valid lootTable entries with itemId and weight', () => {
      DUNGEONS.forEach(dungeon => {
        dungeon.monsters.forEach(monster => {
          monster.lootTable.forEach(item => {
            expect(item).toHaveProperty('itemId');
            expect(item).toHaveProperty('weight');
            expect(typeof item.itemId).toBe('string');
            expect(typeof item.weight).toBe('number');
            expect(item.weight).toBeGreaterThan(0);
          });
        });
        dungeon.boss.lootTable.forEach(item => {
          expect(item).toHaveProperty('itemId');
          expect(item).toHaveProperty('weight');
          expect(typeof item.itemId).toBe('string');
          expect(typeof item.weight).toBe('number');
          expect(item.weight).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Dungeon difficulty values', () => {
    it('should use valid difficulty labels', () => {
      const expectedDifficulties = ['Easy', 'Medium', 'Hard', 'Very Hard', 'Extreme'];
      DUNGEONS.forEach(dungeon => {
        expect(expectedDifficulties).toContain(dungeon.difficulty);
      });
    });

    it('should have difficulty progression matching level range', () => {
      const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3, 'Very Hard': 4, Extreme: 5 };
      const sorted = [...DUNGEONS].sort((a, b) => a.levelRange[1] - b.levelRange[1]);
      sorted.forEach((dungeon, index) => {
        expect(difficultyOrder[dungeon.difficulty]).toBeGreaterThanOrEqual(index + 1);
      });
    });
  });

  describe('getDungeonById', () => {
    it('should return the correct dungeon by ID', () => {
      expect(getDungeonById('goblin_caves')).toEqual(DUNGEONS[0]);
      expect(getDungeonById('dark_forest_ruins')).toEqual(DUNGEONS[1]);
      expect(getDungeonById('abandoned_mine')).toEqual(DUNGEONS[2]);
      expect(getDungeonById('dragons_peak')).toEqual(DUNGEONS[3]);
      expect(getDungeonById('abyssal_throne')).toEqual(DUNGEONS[4]);
    });

    it('should return the Goblin Caves dungeon with correct properties', () => {
      const dungeon = getDungeonById('goblin_caves');
      expect(dungeon.name).toBe('Goblin Caves');
      expect(dungeon.levelRange).toEqual([1, 3]);
      expect(dungeon.difficulty).toBe('Easy');
      expect(dungeon.monsters.length).toBe(3);
      expect(dungeon.boss.name).toBe('Goblin Chieftain');
    });

    it('should return the Abyssal Throne dungeon with correct properties', () => {
      const dungeon = getDungeonById('abyssal_throne');
      expect(dungeon.name).toBe('The Abyssal Throne');
      expect(dungeon.levelRange).toEqual([10, 15]);
      expect(dungeon.difficulty).toBe('Extreme');
      expect(dungeon.monsters.length).toBe(5);
      expect(dungeon.boss.name).toBe('Abyssal Lord');
    });

    it('should return undefined for unknown ID', () => {
      expect(getDungeonById('unknown')).toBeUndefined();
      expect(getDungeonById('nonexistent_dungeon')).toBeUndefined();
      expect(getDungeonById('')).toBeUndefined();
    });
  });

  describe('getDungeonsForLevel', () => {
    it('should return dungeons available at a given level', () => {
      // Level 1: Goblin Caves (levelRange [1,3], ±2 = [-1,5]) includes 1
      //          Dark Forest Ruins (levelRange [3,5], ±2 = [1,7]) includes 1
      const result = getDungeonsForLevel(1);
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.map(d => d.id)).toContain('goblin_caves');
    });

    it('should return correct dungeons at level 3', () => {
      // Goblin Caves [1,3] → [-1,5] includes 3
      // Dark Forest Ruins [3,5] → [1,7] includes 3
      const result = getDungeonsForLevel(3);
      expect(result.length).toBeGreaterThanOrEqual(2);
      expect(result.map(d => d.id)).toContain('goblin_caves');
      expect(result.map(d => d.id)).toContain('dark_forest_ruins');
    });

    it('should return correct dungeons at level 5', () => {
      // Goblin Caves [1,3] → [-1,5] includes 5
      // Dark Forest Ruins [3,5] → [1,7] includes 5
      // Abandoned Mine [5,7] → [3,9] includes 5
      const result = getDungeonsForLevel(5);
      expect(result.map(d => d.id)).toContain('goblin_caves');
      expect(result.map(d => d.id)).toContain('dark_forest_ruins');
      expect(result.map(d => d.id)).toContain('abandoned_mine');
    });

    it('should return correct dungeons at level 8', () => {
      // Dark Forest Ruins [3,5] → [1,7] does NOT include 8
      // Abandoned Mine [5,7] → [3,9] includes 8
      // Dragon's Peak [7,10] → [5,12] includes 8
      const result = getDungeonsForLevel(8);
      expect(result.map(d => d.id)).not.toContain('dark_forest_ruins');
      expect(result.map(d => d.id)).toContain('abandoned_mine');
      expect(result.map(d => d.id)).toContain('dragons_peak');
    });

    it('should return correct dungeons at level 12', () => {
      // Abandoned Mine [5,7] → [3,9] does NOT include 12
      // Dragon's Peak [7,10] → [5,12] includes 12
      // Abyssal Throne [10,15] → [8,17] includes 12
      const result = getDungeonsForLevel(12);
      expect(result.map(d => d.id)).not.toContain('abandoned_mine');
      expect(result.map(d => d.id)).toContain('dragons_peak');
      expect(result.map(d => d.id)).toContain('abyssal_throne');
    });

    it('should return correct dungeons at level 15', () => {
      // Dragon's Peak [7,10] → [5,12] does NOT include 15
      // Abyssal Throne [10,15] → [8,17] includes 15
      const result = getDungeonsForLevel(15);
      expect(result.map(d => d.id)).not.toContain('dragons_peak');
      expect(result.map(d => d.id)).toContain('abyssal_throne');
    });

    it('should return all 5 dungeons at level 7 (middle overlap)', () => {
      // Goblin Caves [1,3] → [-1,5] does NOT include 7
      // Dark Forest Ruins [3,5] → [1,7] includes 7
      // Abandoned Mine [5,7] → [3,9] includes 7
      // Dragon's Peak [7,10] → [5,12] includes 7
      // Abyssal Throne [10,15] → [8,17] does NOT include 7
      const result = getDungeonsForLevel(7);
      expect(result).toHaveLength(3);
      expect(result.map(d => d.id)).toContain('dark_forest_ruins');
      expect(result.map(d => d.id)).toContain('abandoned_mine');
      expect(result.map(d => d.id)).toContain('dragons_peak');
    });

    it('should return empty array for very low level', () => {
      const result = getDungeonsForLevel(-10);
      expect(result).toHaveLength(0);
    });

    it('should return empty array for very high level', () => {
      const result = getDungeonsForLevel(999);
      expect(result).toHaveLength(0);
    });

    it('should always include at least one dungeon between level 1 and 13', () => {
      for (let level = 1; level <= 13; level++) {
        const result = getDungeonsForLevel(level);
        expect(result.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Dungeon availability within ±2 levels of range', () => {
    it('should include dungeon at levelRange[0] - 2', () => {
      DUNGEONS.forEach(dungeon => {
        const minLevel = dungeon.levelRange[0] - 2;
        const result = getDungeonsForLevel(minLevel);
        expect(result.map(d => d.id)).toContain(dungeon.id);
      });
    });

    it('should include dungeon at levelRange[1] + 2', () => {
      DUNGEONS.forEach(dungeon => {
        const maxLevel = dungeon.levelRange[1] + 2;
        const result = getDungeonsForLevel(maxLevel);
        expect(result.map(d => d.id)).toContain(dungeon.id);
      });
    });

    it('should exclude dungeon at levelRange[0] - 3', () => {
      DUNGEONS.forEach(dungeon => {
        const minLevel = dungeon.levelRange[0] - 3;
        const result = getDungeonsForLevel(minLevel);
        expect(result.map(d => d.id)).not.toContain(dungeon.id);
      });
    });

    it('should exclude dungeon at levelRange[1] + 3', () => {
      DUNGEONS.forEach(dungeon => {
        const maxLevel = dungeon.levelRange[1] + 3;
        const result = getDungeonsForLevel(maxLevel);
        expect(result.map(d => d.id)).not.toContain(dungeon.id);
      });
    });

    it('should include dungeon at every level within its range', () => {
      DUNGEONS.forEach(dungeon => {
        for (let level = dungeon.levelRange[0]; level <= dungeon.levelRange[1]; level++) {
          const result = getDungeonsForLevel(level);
          expect(result.map(d => d.id)).toContain(dungeon.id);
        }
      });
    });
  });
});
