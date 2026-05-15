import {
  EQUIPMENT,
  SLOT_LABELS,
  SLOT_ORDER,
  RARITY_COLORS,
  getItemsBySlot,
  getAllItems,
  getItemById,
  getItemsByRarity,
  getItemsByType,
} from './equipment';

describe('data/equipment.js', () => {
  describe('SLOT_ORDER', () => {
    it('should have 9 slots', () => {
      expect(SLOT_ORDER).toHaveLength(9);
    });

    it('should contain all expected slot IDs', () => {
      expect(SLOT_ORDER).toContain('head');
      expect(SLOT_ORDER).toContain('chest');
      expect(SLOT_ORDER).toContain('pants');
      expect(SLOT_ORDER).toContain('boots');
      expect(SLOT_ORDER).toContain('rightHand');
      expect(SLOT_ORDER).toContain('leftHand');
      expect(SLOT_ORDER).toContain('accessory1');
      expect(SLOT_ORDER).toContain('accessory2');
      expect(SLOT_ORDER).toContain('accessory3');
    });
  });

  describe('SLOT_LABELS', () => {
    it('should have labels for all slots', () => {
      SLOT_ORDER.forEach(slot => {
        expect(SLOT_LABELS[slot]).toBeDefined();
      });
    });
  });

  describe('RARITY_COLORS', () => {
    it('should have colors for all rarity tiers', () => {
      expect(RARITY_COLORS).toHaveProperty('common');
      expect(RARITY_COLORS).toHaveProperty('uncommon');
      expect(RARITY_COLORS).toHaveProperty('rare');
      expect(RARITY_COLORS).toHaveProperty('epic');
    });

    it('should have valid hex colors', () => {
      Object.values(RARITY_COLORS).forEach(color => {
        expect(color).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });
  });

  describe('EQUIPMENT', () => {
    it('should have items for all 9 slots', () => {
      SLOT_ORDER.forEach(slot => {
        expect(EQUIPMENT[slot]).toBeDefined();
        expect(EQUIPMENT[slot]).toBeInstanceOf(Array);
      });
    });

    it('should have at least 1 item per slot', () => {
      SLOT_ORDER.forEach(slot => {
        expect(EQUIPMENT[slot].length).toBeGreaterThanOrEqual(1);
      });
    });

    it('should have items with valid structure', () => {
      Object.values(EQUIPMENT).flat().forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('slot');
        expect(item).toHaveProperty('type');
        expect(item).toHaveProperty('rarity');
        expect(item).toHaveProperty('statBonuses');
        expect(item).toHaveProperty('svgPaths');
      });
    });

    it('should have valid rarity values', () => {
      const validRarities = ['common', 'uncommon', 'rare', 'epic'];
      Object.values(EQUIPMENT).flat().forEach(item => {
        expect(validRarities).toContain(item.rarity);
      });
    });

    it('should have valid type values', () => {
      const validTypes = ['armor', 'weapon', 'accessory'];
      Object.values(EQUIPMENT).flat().forEach(item => {
        expect(validTypes).toContain(item.type);
      });
    });

    it('should have svgPaths as arrays', () => {
      Object.values(EQUIPMENT).flat().forEach(item => {
        expect(item.svgPaths).toBeInstanceOf(Array);
        expect(item.svgPaths.length).toBeGreaterThan(0);
      });
    });

    it('should have statBonuses as objects', () => {
      Object.values(EQUIPMENT).flat().forEach(item => {
        expect(item.statBonuses).toBeDefined();
        expect(typeof item.statBonuses).toBe('object');
      });
    });
  });

  describe('getAllItems', () => {
    it('should return all items', () => {
      const items = getAllItems();
      expect(items.length).toBeGreaterThan(0);
    });

    it('should return a flat array', () => {
      const items = getAllItems();
      expect(Array.isArray(items)).toBe(true);
      expect(items.every(item => typeof item === 'object')).toBe(true);
    });

    it('should return the same items as the sum of all slot arrays', () => {
      const allItems = getAllItems();
      const bySlots = SLOT_ORDER.flatMap(slot => EQUIPMENT[slot]);
      expect(allItems.length).toBe(bySlots.length);
      expect(allItems.map(i => i.id).sort()).toEqual(bySlots.map(i => i.id).sort());
    });
  });

  describe('getItemsBySlot', () => {
    it('should return correct items for each slot', () => {
      expect(getItemsBySlot('head')).toEqual(EQUIPMENT.head);
      expect(getItemsBySlot('chest')).toEqual(EQUIPMENT.chest);
      expect(getItemsBySlot('pants')).toEqual(EQUIPMENT.pants);
      expect(getItemsBySlot('boots')).toEqual(EQUIPMENT.boots);
      expect(getItemsBySlot('rightHand')).toEqual(EQUIPMENT.rightHand);
      expect(getItemsBySlot('leftHand')).toEqual(EQUIPMENT.leftHand);
      expect(getItemsBySlot('accessory1')).toEqual(EQUIPMENT.accessory1);
      expect(getItemsBySlot('accessory2')).toEqual(EQUIPMENT.accessory2);
      expect(getItemsBySlot('accessory3')).toEqual(EQUIPMENT.accessory3);
    });

    it('should return empty array for unknown slot', () => {
      expect(getItemsBySlot('unknown')).toEqual([]);
    });
  });

  describe('getItemById', () => {
    it('should return the correct item by ID', () => {
      const ironHelm = EQUIPMENT.head.find(i => i.id === 'iron_helm');
      expect(getItemById('iron_helm')).toEqual(ironHelm);

      const longsword = EQUIPMENT.rightHand.find(i => i.id === 'longsword');
      expect(getItemById('longsword')).toEqual(longsword);

      const ironPlate = EQUIPMENT.chest.find(i => i.id === 'iron_plate');
      expect(getItemById('iron_plate')).toEqual(ironPlate);
    });

    it('should return undefined for unknown ID', () => {
      expect(getItemById('unknown')).toBeUndefined();
    });
  });

  describe('getItemsByRarity', () => {
    it('should return correct count for each rarity', () => {
      const common = getItemsByRarity('common');
      const uncommon = getItemsByRarity('uncommon');
      const rare = getItemsByRarity('rare');
      const epic = getItemsByRarity('epic');

      expect(common.length).toBeGreaterThan(0);
      expect(uncommon.length).toBeGreaterThan(0);
      expect(rare.length).toBeGreaterThan(0);
      expect(epic.length).toBeGreaterThan(0);
    });

    it('should return empty array for unknown rarity', () => {
      expect(getItemsByRarity('unknown')).toEqual([]);
    });

    it('should account for all items across rarities', () => {
      const all = getItemsByRarity('common')
        .concat(getItemsByRarity('uncommon'))
        .concat(getItemsByRarity('rare'))
        .concat(getItemsByRarity('epic'));
      expect(all.length).toBe(getAllItems().length);
    });
  });

  describe('getItemsByType', () => {
    it('should return correct count for each type', () => {
      const armor = getItemsByType('armor');
      const weapons = getItemsByType('weapon');
      const accessories = getItemsByType('accessory');

      expect(armor.length).toBeGreaterThan(0);
      expect(weapons.length).toBeGreaterThan(0);
      expect(accessories.length).toBeGreaterThan(0);
    });

    it('should return empty array for unknown type', () => {
      expect(getItemsByType('unknown')).toEqual([]);
    });

    it('should account for all items across types', () => {
      const all = getItemsByType('armor')
        .concat(getItemsByType('weapon'))
        .concat(getItemsByType('accessory'));
      expect(all.length).toBe(getAllItems().length);
    });
  });
});
