import {
  CONSUMABLES,
  SHOP_ITEMS,
  getConsumableById,
  getConsumablesByType,
  getConsumablesByRarity,
  getShopItems,
  getShopItemById,
} from './consumables';

describe('data/consumables.js', () => {
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

  describe('getConsumableById', () => {
    it('should return correct consumable for healing_potion', () => {
      const item = getConsumableById('healing_potion');
      expect(item).toBeDefined();
      expect(item.id).toBe('healing_potion');
      expect(item.name).toBe('Healing Potion');
      expect(item.description).toBe('Restores 30 HP');
      expect(item.type).toBe('consumable');
      expect(item.rarity).toBe('common');
    });

    it('should return correct consumable for mana_potion', () => {
      const item = getConsumableById('mana_potion');
      expect(item).toBeDefined();
      expect(item.id).toBe('mana_potion');
      expect(item.name).toBe('Mana Potion');
      expect(item.description).toBe('Restores 20 MP');
      expect(item.type).toBe('consumable');
      expect(item.rarity).toBe('common');
    });

    it('should return correct consumable for greater_healing_potion', () => {
      const item = getConsumableById('greater_healing_potion');
      expect(item).toBeDefined();
      expect(item.id).toBe('greater_healing_potion');
      expect(item.name).toBe('Greater Healing Potion');
    });

    it('should return correct consumable for greater_mana_potion', () => {
      const item = getConsumableById('greater_mana_potion');
      expect(item).toBeDefined();
      expect(item.id).toBe('greater_mana_potion');
      expect(item.name).toBe('Greater Mana Potion');
    });

    it('should return correct consumable for strength_elixir', () => {
      const item = getConsumableById('strength_elixir');
      expect(item).toBeDefined();
      expect(item.id).toBe('strength_elixir');
      expect(item.name).toBe('Elixir of Strength');
    });

    it('should return correct consumable for dexterity_elixir', () => {
      const item = getConsumableById('dexterity_elixir');
      expect(item).toBeDefined();
      expect(item.id).toBe('dexterity_elixir');
      expect(item.name).toBe('Elixir of Dexterity');
    });

    it('should return correct consumable for iron_skin_scroll', () => {
      const item = getConsumableById('iron_skin_scroll');
      expect(item).toBeDefined();
      expect(item.id).toBe('iron_skin_scroll');
      expect(item.name).toBe('Scroll of Iron Skin');
    });

    it('should return correct consumable for arcane_blessing_scroll', () => {
      const item = getConsumableById('arcane_blessing_scroll');
      expect(item).toBeDefined();
      expect(item.id).toBe('arcane_blessing_scroll');
      expect(item.name).toBe('Scroll of Arcane Blessing');
    });

    it('should return undefined (falsy) for unknown ID', () => {
      expect(getConsumableById('unknown_id')).toBeFalsy();
      expect(getConsumableById('nonexistent_consumable')).toBeFalsy();
      expect(getConsumableById('')).toBeFalsy();
    });
  });

  describe('getConsumablesByType', () => {
    it('should return all consumables when type is "consumable"', () => {
      const result = getConsumablesByType('consumable');
      expect(result).toHaveLength(CONSUMABLES.length);
    });

    it('should return empty array for unknown type', () => {
      const result = getConsumablesByType('weapon');
      expect(result).toHaveLength(0);
    });

    it('should return empty array for unknown type "armor"', () => {
      const result = getConsumablesByType('armor');
      expect(result).toHaveLength(0);
    });
  });

  describe('getConsumablesByRarity', () => {
    it('should return only common consumables', () => {
      const result = getConsumablesByRarity('common');
      expect(result.length).toBeGreaterThan(0);
      result.forEach(item => {
        expect(item.rarity).toBe('common');
      });
    });

    it('should return only uncommon consumables', () => {
      const result = getConsumablesByRarity('uncommon');
      expect(result.length).toBeGreaterThan(0);
      result.forEach(item => {
        expect(item.rarity).toBe('uncommon');
      });
    });

    it('should return only rare consumables', () => {
      const result = getConsumablesByRarity('rare');
      expect(result.length).toBeGreaterThan(0);
      result.forEach(item => {
        expect(item.rarity).toBe('rare');
      });
    });

    it('should return only epic consumables', () => {
      const result = getConsumablesByRarity('epic');
      expect(result.length).toBeGreaterThan(0);
      result.forEach(item => {
        expect(item.rarity).toBe('epic');
      });
    });

    it('should return empty array for unknown rarity', () => {
      const result = getConsumablesByRarity('legendary');
      expect(result).toHaveLength(0);
    });
  });

  describe('healing_potion effect', () => {
    it('should have heal effect with value 30', () => {
      const item = getConsumableById('healing_potion');
      expect(item.effect.type).toBe('heal');
      expect(item.effect.value).toBe(30);
    });
  });

  describe('greater_healing_potion effect', () => {
    it('should have heal effect with value 60', () => {
      const item = getConsumableById('greater_healing_potion');
      expect(item.effect.type).toBe('heal');
      expect(item.effect.value).toBe(60);
    });
  });

  describe('mana_potion effect', () => {
    it('should have mana effect with value 20', () => {
      const item = getConsumableById('mana_potion');
      expect(item.effect.type).toBe('mana');
      expect(item.effect.value).toBe(20);
    });
  });

  describe('greater_mana_potion effect', () => {
    it('should have mana effect with value 50', () => {
      const item = getConsumableById('greater_mana_potion');
      expect(item.effect.type).toBe('mana');
      expect(item.effect.value).toBe(50);
    });
  });

  describe('elixirs have buff effect with correct stat and value', () => {
    it('strength_elixir should buff STR with value 2', () => {
      const item = getConsumableById('strength_elixir');
      expect(item.effect.type).toBe('buff');
      expect(item.effect.stat).toBe('str');
      expect(item.effect.value).toBe(2);
    });

    it('dexterity_elixir should buff DEX with value 2', () => {
      const item = getConsumableById('dexterity_elixir');
      expect(item.effect.type).toBe('buff');
      expect(item.effect.stat).toBe('dex');
      expect(item.effect.value).toBe(2);
    });
  });

  describe('scrolls have buff effect with correct stat and value', () => {
    it('iron_skin_scroll should buff CON with value 3', () => {
      const item = getConsumableById('iron_skin_scroll');
      expect(item.effect.type).toBe('buff');
      expect(item.effect.stat).toBe('con');
      expect(item.effect.value).toBe(3);
    });

    it('arcane_blessing_scroll should buff arcane with value 2', () => {
      const item = getConsumableById('arcane_blessing_scroll');
      expect(item.effect.type).toBe('buff');
      expect(item.effect.stat).toBe('arcane');
      expect(item.effect.value).toBe(2);
    });
  });

  describe('elixir_of_might has buff_multi effect', () => {
    it('should have buff_multi effect with str 3 and con 2', () => {
      const item = getConsumableById('elixir_of_might');
      expect(item.effect.type).toBe('buff_multi');
      expect(item.effect.str).toBe(3);
      expect(item.effect.con).toBe(2);
    });
  });

  describe('phoenix_draught has full_restore effect', () => {
    it('should have full_restore effect', () => {
      const item = getConsumableById('phoenix_draught');
      expect(item.effect.type).toBe('full_restore');
      expect(item.effect.value).toBe(0);
    });
  });

  describe('SHOP_ITEMS', () => {
    it('should include all CONSUMABLES', () => {
      const shopItems = getShopItems();
      expect(shopItems.length).toBeGreaterThanOrEqual(CONSUMABLES.length);

      CONSUMABLES.forEach(consumable => {
        const found = shopItems.find(item => item.id === consumable.id);
        expect(found).toBeDefined();
      });
    });

    it('should have getShopItemById return correct item', () => {
      const item = getShopItemById('healing_potion');
      expect(item).toBeDefined();
      expect(item.id).toBe('healing_potion');
    });

    it('should have getShopItemById return undefined (falsy) for unknown ID', () => {
      const item = getShopItemById('unknown_shop_item');
      expect(item).toBeFalsy();
    });
  });
});
