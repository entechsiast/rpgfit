import {
  LOOT_TABLES,
  DUNGEON_GUARANTEED_ITEMS,
  BOSS_GUARANTEED_ITEMS,
  CONSUMABLES,
  getItemById,
  getRandomLoot,
  getGuaranteedItemForDungeon,
  getBossGuaranteedItem,
} from './loot';

describe('data/loot.js', () => {
  describe('LOOT_TABLES', () => {
    it('should have entries for all 5 dungeons', () => {
      expect(Object.keys(LOOT_TABLES)).toContain('goblin_caves');
      expect(Object.keys(LOOT_TABLES)).toContain('dark_forest_ruins');
      expect(Object.keys(LOOT_TABLES)).toContain('abandoned_mine');
      expect(Object.keys(LOOT_TABLES)).toContain('dragons_peak');
      expect(Object.keys(LOOT_TABLES)).toContain('abyssal_throne');
    });

    it('should have exactly 5 dungeon entries', () => {
      expect(Object.keys(LOOT_TABLES)).toHaveLength(5);
    });

    it('should have each loot table entry with itemId and weight', () => {
      Object.values(LOOT_TABLES).forEach(table => {
        table.forEach(entry => {
          expect(entry).toHaveProperty('itemId');
          expect(entry).toHaveProperty('weight');
          expect(typeof entry.itemId).toBe('string');
          expect(typeof entry.weight).toBe('number');
        });
      });
    });

    it('should have positive total weight per loot table', () => {
      Object.entries(LOOT_TABLES).forEach(([dungeonId, table]) => {
        const totalWeight = table.reduce((sum, entry) => sum + entry.weight, 0);
        expect(totalWeight).toBeGreaterThan(0);
      });
    });

    it('should have at least 4 entries per loot table', () => {
      Object.values(LOOT_TABLES).forEach(table => {
        expect(table.length).toBeGreaterThanOrEqual(4);
      });
    });

    it('should have all weights as positive numbers', () => {
      Object.values(LOOT_TABLES).forEach(table => {
        table.forEach(entry => {
          expect(entry.weight).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('DUNGEON_GUARANTEED_ITEMS', () => {
    it('should have entries for all 5 dungeons', () => {
      expect(Object.keys(DUNGEON_GUARANTEED_ITEMS)).toContain('goblin_caves');
      expect(Object.keys(DUNGEON_GUARANTEED_ITEMS)).toContain('dark_forest_ruins');
      expect(Object.keys(DUNGEON_GUARANTEED_ITEMS)).toContain('abandoned_mine');
      expect(Object.keys(DUNGEON_GUARANTEED_ITEMS)).toContain('dragons_peak');
      expect(Object.keys(DUNGEON_GUARANTEED_ITEMS)).toContain('abyssal_throne');
    });

    it('should have exactly 5 entries', () => {
      expect(Object.keys(DUNGEON_GUARANTEED_ITEMS)).toHaveLength(5);
    });

    it('should map each dungeon to a string itemId', () => {
      Object.entries(DUNGEON_GUARANTEED_ITEMS).forEach(([dungeonId, itemId]) => {
        expect(typeof itemId).toBe('string');
        expect(itemId.length).toBeGreaterThan(0);
      });
    });
  });

  describe('BOSS_GUARANTEED_ITEMS', () => {
    it('should have entries for all 5 bosses', () => {
      expect(Object.keys(BOSS_GUARANTEED_ITEMS)).toContain('goblin_chieftain');
      expect(Object.keys(BOSS_GUARANTEED_ITEMS)).toContain('forest_wraith');
      expect(Object.keys(BOSS_GUARANTEED_ITEMS)).toContain('cave_troll');
      expect(Object.keys(BOSS_GUARANTEED_ITEMS)).toContain('elder_dragon');
      expect(Object.keys(BOSS_GUARANTEED_ITEMS)).toContain('abyssal_lord');
    });

    it('should have exactly 5 entries', () => {
      expect(Object.keys(BOSS_GUARANTEED_ITEMS)).toHaveLength(5);
    });

    it('should map each boss to a string itemId', () => {
      Object.entries(BOSS_GUARANTEED_ITEMS).forEach(([bossId, itemId]) => {
        expect(typeof itemId).toBe('string');
        expect(itemId.length).toBeGreaterThan(0);
      });
    });
  });

  describe('CONSUMABLES', () => {
    it('should have at least 6 consumable entries', () => {
      expect(CONSUMABLES.length).toBeGreaterThanOrEqual(6);
    });

    it('should have each consumable with required properties', () => {
      CONSUMABLES.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('description');
        expect(item).toHaveProperty('type');
        expect(item).toHaveProperty('effect');
        expect(item).toHaveProperty('rarity');
      });
    });

    it('should have type "consumable" for all entries', () => {
      CONSUMABLES.forEach(item => {
        expect(item.type).toBe('consumable');
      });
    });

    it('should have unique IDs', () => {
      const ids = CONSUMABLES.map(c => c.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    });
  });

  describe('getItemById', () => {
    it('should return correct item from equipment by ID', () => {
      const item = getItemById('iron_helm');
      expect(item).toBeDefined();
      expect(item.id).toBe('iron_helm');
      expect(item.name).toBe('Iron Helm');
    });

    it('should return correct item from consumables by ID', () => {
      const item = getItemById('healing_potion');
      expect(item).toBeDefined();
      expect(item.id).toBe('healing_potion');
      expect(item.name).toBe('Healing Potion');
      expect(item.type).toBe('consumable');
    });

    it('should return null for unknown ID', () => {
      expect(getItemById('unknown_id')).toBeNull();
      expect(getItemById('nonexistent_item')).toBeNull();
      expect(getItemById('')).toBeNull();
    });
  });

  describe('getRandomLoot', () => {
    it('should return an item from the table when given a valid loot table', () => {
      const goblinTable = LOOT_TABLES.goblin_caves;
      const result = getRandomLoot(goblinTable);
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(result.id).toBeDefined();

      // The returned item should be one of the items in the table
      const itemIds = goblinTable.map(entry => entry.itemId);
      expect(itemIds).toContain(result.id);
    });

    it('should return an item from each dungeon loot table', () => {
      Object.entries(LOOT_TABLES).forEach(([dungeonId, table]) => {
        const result = getRandomLoot(table);
        expect(result).toBeDefined();
        expect(typeof result).toBe('object');

        const itemIds = table.map(entry => entry.itemId);
        expect(itemIds).toContain(result.id);
      });
    });

    it('should return null when given an empty table', () => {
      const emptyTable = [];
      const result = getRandomLoot(emptyTable);
      expect(result).toBeNull();
    });

    it('should return first entry when all weights are zero (degenerate case)', () => {
      const zeroWeightTable = [
        { itemId: 'iron_helm', weight: 0 },
        { itemId: 'healing_potion', weight: 0 },
      ];
      const result = getRandomLoot(zeroWeightTable);
      expect(result).toBeDefined();
      expect(result.id).toBe('iron_helm');
    });

    it('should return a valid item type (equipment or consumable)', () => {
      const goblinTable = LOOT_TABLES.goblin_caves;
      const result = getRandomLoot(goblinTable);
      expect(result).toBeDefined();
      expect(result.type).toBeDefined();
      expect(['armor', 'weapon', 'accessory', 'consumable']).toContain(result.type);
    });

    it('should return consistent item structure with expected properties', () => {
      const goblinTable = LOOT_TABLES.goblin_caves;
      const result = getRandomLoot(goblinTable);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
    });
  });

  describe('getGuaranteedItemForDungeon', () => {
    it('should return correct item for Goblin Caves', () => {
      const item = getGuaranteedItemForDungeon('goblin_caves');
      expect(item).toBeDefined();
      expect(item.id).toBe('ring_strength');
    });

    it('should return correct item for Dark Forest Ruins', () => {
      const item = getGuaranteedItemForDungeon('dark_forest_ruins');
      expect(item).toBeDefined();
      expect(item.id).toBe('belt_giants');
    });

    it('should return correct item for Abandoned Mine', () => {
      const item = getGuaranteedItemForDungeon('abandoned_mine');
      expect(item).toBeDefined();
      expect(item.id).toBe('talisman_warding');
    });

    it('should return correct item for Dragon Peak', () => {
      const item = getGuaranteedItemForDungeon('dragons_peak');
      expect(item).toBeDefined();
      expect(item.id).toBe('cloak_shadows');
    });

    it('should return correct item for Abyssal Throne', () => {
      const item = getGuaranteedItemForDungeon('abyssal_throne');
      expect(item).toBeDefined();
      expect(item.id).toBe('crown');
    });

    it('should return null for unknown dungeon', () => {
      const item = getGuaranteedItemForDungeon('unknown_dungeon');
      expect(item).toBeNull();
    });

    it('should return an item with expected structure for each dungeon', () => {
      Object.keys(DUNGEON_GUARANTEED_ITEMS).forEach(dungeonId => {
        const item = getGuaranteedItemForDungeon(dungeonId);
        expect(item).toBeDefined();
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
      });
    });
  });

  describe('getBossGuaranteedItem', () => {
    it('should return correct item for Goblin Chieftain', () => {
      const item = getBossGuaranteedItem('goblin_chieftain');
      expect(item).toBeDefined();
      expect(item.id).toBe('orc_helm');
    });

    it('should return correct item for Forest Wraith', () => {
      const item = getBossGuaranteedItem('forest_wraith');
      expect(item).toBeDefined();
      expect(item.id).toBe('fire_staff');
    });

    it('should return correct item for Cave Troll', () => {
      const item = getBossGuaranteedItem('cave_troll');
      expect(item).toBeDefined();
      expect(item.id).toBe('iron_plate');
    });

    it('should return correct item for Elder Dragon', () => {
      const item = getBossGuaranteedItem('elder_dragon');
      expect(item).toBeDefined();
      expect(item.id).toBe('paladin_armor');
    });

    it('should return correct item for Abyssal Lord', () => {
      const item = getBossGuaranteedItem('abyssal_lord');
      expect(item).toBeDefined();
      expect(item.id).toBe('crown');
    });

    it('should return null for unknown boss', () => {
      const item = getBossGuaranteedItem('unknown_boss');
      expect(item).toBeNull();
    });

    it('should return an item with expected structure for each boss', () => {
      Object.keys(BOSS_GUARANTEED_ITEMS).forEach(bossId => {
        const item = getBossGuaranteedItem(bossId);
        expect(item).toBeDefined();
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
      });
    });
  });
});
