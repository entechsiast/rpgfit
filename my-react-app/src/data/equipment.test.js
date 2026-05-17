import {
  EQUIPMENT,
  SLOT_LABELS,
  SLOT_ORDER,
  RARITY_COLORS,
  STARTING_EQUIPMENT,
  getItemsBySlot,
  getAllItems,
  getItemById,
  getItemsByRarity,
  getItemsByType,
  getStartingEquipment,
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

  describe('STARTING_EQUIPMENT', () => {
    it('should have entries for all 7 classes', () => {
      expect(STARTING_EQUIPMENT).toHaveProperty('warrior');
      expect(STARTING_EQUIPMENT).toHaveProperty('wizard');
      expect(STARTING_EQUIPMENT).toHaveProperty('mage');
      expect(STARTING_EQUIPMENT).toHaveProperty('rogue');
      expect(STARTING_EQUIPMENT).toHaveProperty('cleric');
      expect(STARTING_EQUIPMENT).toHaveProperty('ranger');
      expect(STARTING_EQUIPMENT).toHaveProperty('paladin');
    });

    it('should have 6 slots per class (head, chest, pants, boots, rightHand, leftHand)', () => {
      Object.values(STARTING_EQUIPMENT).forEach(eq => {
        expect(eq).toHaveProperty('head');
        expect(eq).toHaveProperty('chest');
        expect(eq).toHaveProperty('pants');
        expect(eq).toHaveProperty('boots');
        expect(eq).toHaveProperty('rightHand');
        expect(eq).toHaveProperty('leftHand');
      });
    });

    it('should have valid item IDs for each starting slot', () => {
      Object.values(STARTING_EQUIPMENT).forEach(eq => {
        Object.values(eq).forEach(itemId => {
          const item = getItemById(itemId);
          expect(item).toBeDefined();
          expect(item.id).toBe(itemId);
        });
      });
    });

    it('should have appropriate gear per class', () => {
      // warrior should have heavy armor and melee weapon
      const warrior = STARTING_EQUIPMENT.warrior;
      expect(warrior.head).toBe('iron_helm');
      expect(warrior.chest).toBe('leather_vest');
      expect(warrior.rightHand).toBe('longsword');
      expect(warrior.leftHand).toBe('tower_shield');

      // wizard should have light armor and staff
      const wizard = STARTING_EQUIPMENT.wizard;
      expect(wizard.head).toBe('mage_hood');
      expect(wizard.chest).toBe('cloth_robe');
      expect(wizard.rightHand).toBe('apprentice_staff');
      expect(wizard.leftHand).toBe('tome');

      // mage should have light armor and staff
      const mage = STARTING_EQUIPMENT.mage;
      expect(mage.head).toBe('mage_hood');
      expect(mage.chest).toBe('cloth_robe');
      expect(mage.rightHand).toBe('apprentice_staff');
      expect(mage.leftHand).toBe('tome');

      // rogue should have light armor and daggers
      const rogue = STARTING_EQUIPMENT.rogue;
      expect(rogue.head).toBe('leather_cap');
      expect(rogue.chest).toBe('leather_vest');
      expect(rogue.rightHand).toBe('dagger');
      expect(rogue.leftHand).toBe('off_hand_dagger');

      // cleric should have medium armor and holy mace
      const cleric = STARTING_EQUIPMENT.cleric;
      expect(cleric.head).toBe('iron_helm');
      expect(cleric.chest).toBe('chain_mail');
      expect(cleric.rightHand).toBe('holy_mace');
      expect(cleric.leftHand).toBe('holy_symbol');

      // ranger should have light armor and bow
      const ranger = STARTING_EQUIPMENT.ranger;
      expect(ranger.head).toBe('leather_cap');
      expect(ranger.chest).toBe('ranger_cloak');
      expect(ranger.rightHand).toBe('long_bow');
      expect(ranger.leftHand).toBe('off_hand_dagger');

      // paladin should have heavy armor and holy mace
      const paladin = STARTING_EQUIPMENT.paladin;
      expect(paladin.head).toBe('iron_helm');
      expect(paladin.chest).toBe('paladin_armor');
      expect(paladin.rightHand).toBe('holy_mace');
      expect(paladin.leftHand).toBe('holy_symbol');
    });
  });

  describe('getStartingEquipment', () => {
    it('should return correct starting equipment for warrior', () => {
      const eq = getStartingEquipment('warrior');
      expect(eq).not.toBeNull();
      expect(eq.head).toBe('iron_helm');
      expect(eq.chest).toBe('leather_vest');
      expect(eq.rightHand).toBe('longsword');
      expect(eq.leftHand).toBe('tower_shield');
    });

    it('should return correct starting equipment for wizard', () => {
      const eq = getStartingEquipment('wizard');
      expect(eq).not.toBeNull();
      expect(eq.head).toBe('mage_hood');
      expect(eq.chest).toBe('cloth_robe');
      expect(eq.rightHand).toBe('apprentice_staff');
      expect(eq.leftHand).toBe('tome');
    });

    it('should return correct starting equipment for mage', () => {
      const eq = getStartingEquipment('mage');
      expect(eq).not.toBeNull();
      expect(eq.head).toBe('mage_hood');
      expect(eq.chest).toBe('cloth_robe');
      expect(eq.rightHand).toBe('apprentice_staff');
      expect(eq.leftHand).toBe('tome');
    });

    it('should return correct starting equipment for rogue', () => {
      const eq = getStartingEquipment('rogue');
      expect(eq).not.toBeNull();
      expect(eq.head).toBe('leather_cap');
      expect(eq.chest).toBe('leather_vest');
      expect(eq.rightHand).toBe('dagger');
      expect(eq.leftHand).toBe('off_hand_dagger');
    });

    it('should return correct starting equipment for cleric', () => {
      const eq = getStartingEquipment('cleric');
      expect(eq).not.toBeNull();
      expect(eq.head).toBe('iron_helm');
      expect(eq.chest).toBe('chain_mail');
      expect(eq.rightHand).toBe('holy_mace');
      expect(eq.leftHand).toBe('holy_symbol');
    });

    it('should return correct starting equipment for ranger', () => {
      const eq = getStartingEquipment('ranger');
      expect(eq).not.toBeNull();
      expect(eq.head).toBe('leather_cap');
      expect(eq.chest).toBe('ranger_cloak');
      expect(eq.rightHand).toBe('long_bow');
      expect(eq.leftHand).toBe('off_hand_dagger');
    });

    it('should return correct starting equipment for paladin', () => {
      const eq = getStartingEquipment('paladin');
      expect(eq).not.toBeNull();
      expect(eq.head).toBe('iron_helm');
      expect(eq.chest).toBe('paladin_armor');
      expect(eq.rightHand).toBe('holy_mace');
      expect(eq.leftHand).toBe('holy_symbol');
    });

    it('should return null for unknown classId', () => {
      expect(getStartingEquipment('unknown')).toBeNull();
      expect(getStartingEquipment(null)).toBeNull();
      expect(getStartingEquipment(undefined)).toBeNull();
      expect(getStartingEquipment('')).toBeNull();
    });
  });
});
