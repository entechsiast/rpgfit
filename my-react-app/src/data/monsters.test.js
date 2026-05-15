import { MONSTERS, getMonstersByDungeon, getMonstersByLevel, getBossByDungeon } from './monsters';

describe('data/monsters.js', () => {
  describe('MONSTERS', () => {
    it('should have 25 entries', () => {
      expect(MONSTERS).toHaveLength(25);
    });
  });

  describe('Monster structure', () => {
    it('should have id, name, dungeonId, level, hp, maxHp, attack, defense, xpReward, goldReward for each monster', () => {
      const requiredProps = ['id', 'name', 'dungeonId', 'level', 'hp', 'maxHp', 'attack', 'defense', 'xpReward', 'goldReward'];
      MONSTERS.forEach(monster => {
        requiredProps.forEach(prop => {
          expect(monster).toHaveProperty(prop);
        });
      });
    });

    it('should have numeric values for level, hp, maxHp, attack, defense, xpReward', () => {
      const numericProps = ['level', 'hp', 'maxHp', 'attack', 'defense', 'xpReward'];
      MONSTERS.forEach(monster => {
        numericProps.forEach(prop => {
          expect(typeof monster[prop]).toBe('number');
        });
      });
    });

    it('should have goldReward as an array with 2 values for each monster', () => {
      MONSTERS.forEach(monster => {
        expect(Array.isArray(monster.goldReward)).toBe(true);
        expect(monster.goldReward).toHaveLength(2);
        expect(typeof monster.goldReward[0]).toBe('number');
        expect(typeof monster.goldReward[1]).toBe('number');
        expect(monster.goldReward[0]).toBeLessThan(monster.goldReward[1]);
      });
    });

    it('should have hp equal to maxHp for each monster', () => {
      MONSTERS.forEach(monster => {
        expect(monster.hp).toBe(monster.maxHp);
      });
    });

    it('should have all positive numeric values for level, hp, maxHp, attack, defense', () => {
      MONSTERS.forEach(monster => {
        expect(monster.level).toBeGreaterThan(0);
        expect(monster.hp).toBeGreaterThan(0);
        expect(monster.maxHp).toBeGreaterThan(0);
        expect(monster.attack).toBeGreaterThan(0);
        expect(monster.defense).toBeGreaterThan(0);
      });
    });

    it('should have unique IDs across all monsters', () => {
      const ids = MONSTERS.map(m => m.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    });
  });

  describe('Monster levels within dungeon level range', () => {
    it('should have all monster levels within their dungeon level range', () => {
      const dungeonMap = {
        goblin_caves: [1, 3],
        dark_forest_ruins: [3, 5],
        abandoned_mine: [5, 7],
        dragons_peak: [7, 10],
        abyssal_throne: [10, 15],
      };

      MONSTERS.forEach(monster => {
        const range = dungeonMap[monster.dungeonId];
        expect(range).toBeDefined();
        expect(monster.level).toBeGreaterThanOrEqual(range[0]);
        expect(monster.level).toBeLessThanOrEqual(range[1]);
      });
    });

    it('should have at least one monster at each end of every dungeon level range', () => {
      const dungeonMap = {
        goblin_caves: [1, 3],
        dark_forest_ruins: [3, 5],
        abandoned_mine: [5, 7],
        dragons_peak: [7, 10],
        abyssal_throne: [10, 15],
      };

      Object.entries(dungeonMap).forEach(([dungeonId, [minLevel, maxLevel]]) => {
        const monsters = getMonstersByDungeon(dungeonId);
        const hasMin = monsters.some(m => m.level === minLevel);
        const hasMax = monsters.some(m => m.level === maxLevel);
        expect(hasMin).toBe(true);
        expect(hasMax).toBe(true);
      });
    });
  });

  describe('getMonstersByDungeon', () => {
    it('should return correct monsters for Goblin Caves', () => {
      const monsters = getMonstersByDungeon('goblin_caves');
      expect(monsters).toHaveLength(4);
      expect(monsters.map(m => m.id)).toContain('goblin_scout');
      expect(monsters.map(m => m.id)).toContain('goblin_thug');
      expect(monsters.map(m => m.id)).toContain('goblin_shaman');
      expect(monsters.map(m => m.id)).toContain('goblin_chieftain');
    });

    it('should return correct monsters for Dark Forest Ruins', () => {
      const monsters = getMonstersByDungeon('dark_forest_ruins');
      expect(monsters).toHaveLength(5);
      expect(monsters.map(m => m.id)).toContain('forest_wolf');
      expect(monsters.map(m => m.id)).toContain('tree_spirit');
      expect(monsters.map(m => m.id)).toContain('shadow_stalker');
      expect(monsters.map(m => m.id)).toContain('corrupted_wildling');
      expect(monsters.map(m => m.id)).toContain('forest_wraith');
    });

    it('should return correct monsters for Abandoned Mine', () => {
      const monsters = getMonstersByDungeon('abandoned_mine');
      expect(monsters).toHaveLength(5);
      expect(monsters.map(m => m.id)).toContain('mine_golem');
      expect(monsters.map(m => m.id)).toContain('cave_spider');
      expect(monsters.map(m => m.id)).toContain('rock_elemental');
      expect(monsters.map(m => m.id)).toContain('mine_guardian');
      expect(monsters.map(m => m.id)).toContain('cave_troll');
    });

    it('should return correct monsters for Dragon Peak', () => {
      const monsters = getMonstersByDungeon('dragons_peak');
      expect(monsters).toHaveLength(5);
      expect(monsters.map(m => m.id)).toContain('drake');
      expect(monsters.map(m => m.id)).toContain('fire_serpent');
      expect(monsters.map(m => m.id)).toContain('dragon_knight');
      expect(monsters.map(m => m.id)).toContain('lava_giant');
      expect(monsters.map(m => m.id)).toContain('elder_dragon');
    });

    it('should return correct monsters for Abyssal Throne', () => {
      const monsters = getMonstersByDungeon('abyssal_throne');
      expect(monsters).toHaveLength(6);
      expect(monsters.map(m => m.id)).toContain('abyssal_fiend');
      expect(monsters.map(m => m.id)).toContain('demon_lord');
      expect(monsters.map(m => m.id)).toContain('shadow_knight');
      expect(monsters.map(m => m.id)).toContain('abyssal_warrior');
      expect(monsters.map(m => m.id)).toContain('dark_priest');
      expect(monsters.map(m => m.id)).toContain('abyssal_lord');
    });

    it('should return empty array for unknown dungeon', () => {
      expect(getMonstersByDungeon('unknown_dungeon')).toHaveLength(0);
      expect(getMonstersByDungeon('nonexistent')).toHaveLength(0);
      expect(getMonstersByDungeon('')).toHaveLength(0);
    });

    it('should return monsters sorted by level for each dungeon', () => {
      const dungeonIds = ['goblin_caves', 'dark_forest_ruins', 'abandoned_mine', 'dragons_peak', 'abyssal_throne'];
      dungeonIds.forEach(dungeonId => {
        const monsters = getMonstersByDungeon(dungeonId);
        for (let i = 1; i < monsters.length; i++) {
          expect(monsters[i].level).toBeGreaterThanOrEqual(monsters[i - 1].level);
        }
      });
    });
  });

  describe('getBossByDungeon', () => {
    it('should return the boss for Goblin Caves', () => {
      const boss = getBossByDungeon('goblin_caves');
      expect(boss.name).toBe('Goblin Chieftain');
      expect(boss.level).toBe(3);
      expect(boss.hp).toBe(60);
      expect(boss.xpReward).toBe(150);
    });

    it('should return the boss for Dark Forest Ruins', () => {
      const boss = getBossByDungeon('dark_forest_ruins');
      expect(boss.name).toBe('Forest Wraith');
      expect(boss.level).toBe(5);
      expect(boss.hp).toBe(120);
      expect(boss.xpReward).toBe(300);
    });

    it('should return the boss for Abandoned Mine', () => {
      const boss = getBossByDungeon('abandoned_mine');
      expect(boss.name).toBe('Cave Troll');
      expect(boss.level).toBe(7);
      expect(boss.hp).toBe(200);
      expect(boss.xpReward).toBe(500);
    });

    it('should return the boss for Dragon Peak', () => {
      const boss = getBossByDungeon('dragons_peak');
      expect(boss.name).toBe('Elder Dragon');
      expect(boss.level).toBe(10);
      expect(boss.hp).toBe(400);
      expect(boss.xpReward).toBe(1000);
    });

    it('should return the boss for Abyssal Throne', () => {
      const boss = getBossByDungeon('abyssal_throne');
      expect(boss.name).toBe('Abyssal Lord');
      expect(boss.level).toBe(15);
      expect(boss.hp).toBe(800);
      expect(boss.xpReward).toBe(2500);
    });

    it('should return undefined for unknown dungeon', () => {
      expect(getBossByDungeon('unknown_dungeon')).toBeUndefined();
      expect(getBossByDungeon('nonexistent')).toBeUndefined();
      expect(getBossByDungeon('')).toBeUndefined();
    });

    it('should return a boss with isBoss flag for each dungeon', () => {
      const dungeonIds = ['goblin_caves', 'dark_forest_ruins', 'abandoned_mine', 'dragons_peak', 'abyssal_throne'];
      dungeonIds.forEach(dungeonId => {
        const boss = getBossByDungeon(dungeonId);
        expect(boss.isBoss).toBe(true);
      });
    });

    it('should return unique boss per dungeon', () => {
      const dungeonIds = ['goblin_caves', 'dark_forest_ruins', 'abandoned_mine', 'dragons_peak', 'abyssal_throne'];
      const bosses = dungeonIds.map(id => getBossByDungeon(id));
      const ids = bosses.map(b => b.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    });
  });

  describe('Boss HP greater than any monster HP in same dungeon', () => {
    it('should have boss HP greater than any monster HP in Goblin Caves', () => {
      const dungeonMonsters = getMonstersByDungeon('goblin_caves');
      const boss = getBossByDungeon('goblin_caves');
      const regularMonsters = dungeonMonsters.filter(m => !m.isBoss);
      regularMonsters.forEach(m => {
        expect(boss.hp).toBeGreaterThan(m.hp);
      });
    });

    it('should have boss HP greater than any monster HP in Dark Forest Ruins', () => {
      const dungeonMonsters = getMonstersByDungeon('dark_forest_ruins');
      const boss = getBossByDungeon('dark_forest_ruins');
      const regularMonsters = dungeonMonsters.filter(m => !m.isBoss);
      regularMonsters.forEach(m => {
        expect(boss.hp).toBeGreaterThan(m.hp);
      });
    });

    it('should have boss HP greater than any monster HP in Abandoned Mine', () => {
      const dungeonMonsters = getMonstersByDungeon('abandoned_mine');
      const boss = getBossByDungeon('abandoned_mine');
      const regularMonsters = dungeonMonsters.filter(m => !m.isBoss);
      regularMonsters.forEach(m => {
        expect(boss.hp).toBeGreaterThan(m.hp);
      });
    });

    it('should have boss HP greater than any monster HP in Dragon Peak', () => {
      const dungeonMonsters = getMonstersByDungeon('dragons_peak');
      const boss = getBossByDungeon('dragons_peak');
      const regularMonsters = dungeonMonsters.filter(m => !m.isBoss);
      regularMonsters.forEach(m => {
        expect(boss.hp).toBeGreaterThan(m.hp);
      });
    });

    it('should have boss HP greater than any monster HP in Abyssal Throne', () => {
      const dungeonMonsters = getMonstersByDungeon('abyssal_throne');
      const boss = getBossByDungeon('abyssal_throne');
      const regularMonsters = dungeonMonsters.filter(m => !m.isBoss);
      regularMonsters.forEach(m => {
        expect(boss.hp).toBeGreaterThan(m.hp);
      });
    });
  });

  describe('XP reward scaling', () => {
    it('should have XP rewards that increase with dungeon progression', () => {
      const dungeonIds = ['goblin_caves', 'dark_forest_ruins', 'abandoned_mine', 'dragons_peak', 'abyssal_throne'];
      const bosses = dungeonIds.map(id => getBossByDungeon(id));
      for (let i = 1; i < bosses.length; i++) {
        expect(bosses[i].xpReward).toBeGreaterThan(bosses[i - 1].xpReward);
      }
    });

    it('should have XP rewards that increase with level within each dungeon', () => {
      const dungeonIds = ['goblin_caves', 'dark_forest_ruins', 'abandoned_mine', 'dragons_peak', 'abyssal_throne'];
      dungeonIds.forEach(dungeonId => {
        const monsters = getMonstersByDungeon(dungeonId);
        for (let i = 1; i < monsters.length; i++) {
          if (monsters[i].level > monsters[i - 1].level) {
            expect(monsters[i].xpReward).toBeGreaterThanOrEqual(monsters[i - 1].xpReward);
          }
        }
      });
    });
  });

  describe('getMonstersByLevel', () => {
    it('should return monsters within level range of the given level', () => {
      // Level 1: monsters with level 1-3
      const result = getMonstersByLevel(1);
      expect(result.length).toBeGreaterThan(0);
      result.forEach(m => {
        expect(m.level).toBeGreaterThanOrEqual(Math.max(1, 1 - 2));
        expect(m.level).toBeLessThanOrEqual(1 + 2);
      });
    });

    it('should return Goblin Caves monsters at level 1', () => {
      const result = getMonstersByLevel(1);
      const ids = result.map(m => m.id);
      expect(ids).toContain('goblin_scout');
      expect(ids).toContain('goblin_thug');
      expect(ids).toContain('goblin_shaman');
    });

    it('should return appropriate monsters at level 3', () => {
      const result = getMonstersByLevel(3);
      const ids = result.map(m => m.id);
      // Goblin Caves monsters (levels 1-3)
      expect(ids).toContain('goblin_chieftain');
      // Dark Forest Ruins monsters (levels 3-5)
      expect(ids).toContain('forest_wolf');
    });

    it('should return appropriate monsters at level 5', () => {
      const result = getMonstersByLevel(5);
      const ids = result.map(m => m.id);
      // Dark Forest Ruins (levels 3-5)
      expect(ids).toContain('forest_wraith');
      // Abandoned Mine (levels 5-7)
      expect(ids).toContain('mine_golem');
    });

    it('should return appropriate monsters at level 7', () => {
      const result = getMonstersByLevel(7);
      const ids = result.map(m => m.id);
      // Abandoned Mine (levels 5-7)
      expect(ids).toContain('cave_troll');
      // Dragon Peak (levels 7-10)
      expect(ids).toContain('drake');
    });

    it('should return appropriate monsters at level 10', () => {
      const result = getMonstersByLevel(10);
      const ids = result.map(m => m.id);
      // Dragon Peak (levels 7-10)
      expect(ids).toContain('elder_dragon');
      // Abyssal Throne (levels 10-15)
      expect(ids).toContain('abyssal_fiend');
    });

    it('should return all monsters at level 10 (overlap of multiple dungeons)', () => {
      const result = getMonstersByLevel(10);
      // At level 10, we should get monsters from dragons_peak (8-12) and abyssal_throne (8-12)
      // plus potentially some from abandoned_mine (3-9)
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return appropriate monsters at level 15', () => {
      const result = getMonstersByLevel(15);
      const ids = result.map(m => m.id);
      // Abyssal Throne (levels 10-15)
      expect(ids).toContain('abyssal_lord');
    });

    it('should return empty array for very low level', () => {
      const result = getMonstersByLevel(-10);
      expect(result).toHaveLength(0);
    });

    it('should return empty array for very high level', () => {
      const result = getMonstersByLevel(999);
      expect(result).toHaveLength(0);
    });

    it('should return at least one monster for every level from 1 to 15', () => {
      for (let level = 1; level <= 15; level++) {
        const result = getMonstersByLevel(level);
        expect(result.length).toBeGreaterThan(0);
      }
    });

    it('should return unique monsters for each level (no duplicates)', () => {
      for (let level = 1; level <= 15; level++) {
        const result = getMonstersByLevel(level);
        const ids = result.map(m => m.id);
        const unique = new Set(ids);
        expect(unique.size).toBe(ids.length);
      }
    });
  });
});
