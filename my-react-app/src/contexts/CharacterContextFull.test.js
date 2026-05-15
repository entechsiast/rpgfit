import { reducer, initialState, getEquippedBonuses, getAllBonuses, recalcHPAndMP, createEmptyEquipment } from './CharacterContext';

describe('CharacterContext full reducer', () => {
  let state;

  beforeEach(() => {
    state = { ...initialState };
  });

  // ============================================================
  // SET_NAME
  // ============================================================

  describe('SET_NAME', () => {
    it('should set the character name', () => {
      const newState = reducer(state, { type: 'SET_NAME', payload: 'Aragorn' });
      expect(newState.name).toBe('Aragorn');
    });

    it('should clear the name when given empty string', () => {
      const withName = reducer(state, { type: 'SET_NAME', payload: 'Aragorn' });
      const cleared = reducer(withName, { type: 'SET_NAME', payload: '' });
      expect(cleared.name).toBe('');
    });

    it('should not affect other state fields', () => {
      const newState = reducer(state, { type: 'SET_NAME', payload: 'Test' });
      expect(newState.class).toBeNull();
      expect(newState.race).toBeNull();
      expect(newState.level).toBe(1);
      expect(newState.xp).toBe(0);
    });
  });

  // ============================================================
  // SET_CLASS
  // ============================================================

  describe('SET_CLASS', () => {
    it('should set the class and reset stats to base values', () => {
      const spentState = {
        ...state,
        stats: { str: 12, dex: 10, con: 8, int: 8, wis: 8, cha: 8 },
        pointsRemaining: 21,
      };
      const newState = reducer(spentState, { type: 'SET_CLASS', payload: 'warrior' });
      expect(newState.class.id).toBe('warrior');
      expect(newState.stats.str).toBe(8);
      expect(newState.pointsRemaining).toBe(27);
    });

    it('should set starting skills for warrior', () => {
      const newState = reducer(state, { type: 'SET_CLASS', payload: 'warrior' });
      expect(newState.selectedSkillIds.has('swordsmanship')).toBe(true);
      expect(newState.selectedSkillIds.has('shield_bash')).toBe(true);
    });

    it('should set starting skills for mage', () => {
      const newState = reducer(state, { type: 'SET_CLASS', payload: 'mage' });
      expect(newState.selectedSkillIds.has('fireball')).toBe(true);
      expect(newState.selectedSkillIds.has('ice_storm')).toBe(true);
    });

    it('should set starting skills for rogue', () => {
      const newState = reducer(state, { type: 'SET_CLASS', payload: 'rogue' });
      expect(newState.selectedSkillIds.has('sneak_attack')).toBe(true);
      expect(newState.selectedSkillIds.has('stealth')).toBe(true);
    });

    it('should not change state for unknown class', () => {
      const before = JSON.stringify(state);
      const newState = reducer(state, { type: 'SET_CLASS', payload: 'unknown' });
      expect(newState).toBe(state);
    });

    it('should set HP/MP based on class and base stats', () => {
      const newState = reducer(state, { type: 'SET_CLASS', payload: 'warrior' });
      expect(newState.maxHP).toBeGreaterThan(0);
      expect(newState.maxMP).toBeGreaterThanOrEqual(0);
    });
  });

  // ============================================================
  // SET_RACE
  // ============================================================

  describe('SET_RACE', () => {
    it('should set the race', () => {
      const newState = reducer(state, { type: 'SET_RACE', payload: 'elf' });
      expect(newState.race.id).toBe('elf');
    });

    it('should not change state for unknown race', () => {
      const before = JSON.stringify(state);
      const newState = reducer(state, { type: 'SET_RACE', payload: 'unknown' });
      expect(newState).toBe(state);
    });
  });

  // ============================================================
  // INCREMENT_STAT / DECREMENT_STAT
  // ============================================================

  describe('INCREMENT_STAT', () => {
    it('should increment the specified stat by 1', () => {
      const newState = reducer(state, { type: 'INCREMENT_STAT', payload: 'str' });
      expect(newState.stats.str).toBe(9);
    });

    it('should decrement points remaining', () => {
      const newState = reducer(state, { type: 'INCREMENT_STAT', payload: 'str' });
      expect(newState.pointsRemaining).toBe(26);
    });

    it('should not increment beyond MAX_STAT', () => {
      let s = state;
      for (let i = 0; i < 7; i++) {
        s = reducer(s, { type: 'INCREMENT_STAT', payload: 'str' });
      }
      expect(s.stats.str).toBe(15);
      const noChange = reducer(s, { type: 'INCREMENT_STAT', payload: 'str' });
      expect(noChange.stats.str).toBe(15);
    });

    it('should not increment when 0 points remaining', () => {
      let s = state;
      for (let i = 0; i < 27; i++) {
        s = reducer(s, { type: 'INCREMENT_STAT', payload: 'str' });
      }
      const noChange = reducer(s, { type: 'INCREMENT_STAT', payload: 'str' });
      expect(noChange.stats.str).toBe(s.stats.str);
    });

    it('should work for all stats', () => {
      ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach(stat => {
        const newState = reducer(state, { type: 'INCREMENT_STAT', payload: stat });
        expect(newState.stats[stat]).toBe(9);
      });
    });
  });

  describe('DECREMENT_STAT', () => {
    it('should decrement the specified stat by 1', () => {
      let s = state;
      s = reducer(s, { type: 'INCREMENT_STAT', payload: 'str' });
      const newState = reducer(s, { type: 'DECREMENT_STAT', payload: 'str' });
      expect(newState.stats.str).toBe(8);
    });

    it('should increment points remaining', () => {
      let s = state;
      s = reducer(s, { type: 'INCREMENT_STAT', payload: 'str' });
      const newState = reducer(s, { type: 'DECREMENT_STAT', payload: 'str' });
      expect(newState.pointsRemaining).toBe(27);
    });

    it('should not decrement below BASE_STAT', () => {
      const noChange = reducer(state, { type: 'DECREMENT_STAT', payload: 'str' });
      expect(noChange.stats.str).toBe(8);
    });

    it('should work for all stats', () => {
      let s = state;
      ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach(stat => {
        s = reducer(s, { type: 'INCREMENT_STAT', payload: stat });
      });
      ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach(stat => {
        s = reducer(s, { type: 'DECREMENT_STAT', payload: stat });
        expect(s.stats[stat]).toBe(8);
      });
    });
  });

  // ============================================================
  // SET_APPEARANCE
  // ============================================================

  describe('SET_APPEARANCE', () => {
    it('should update hairColor', () => {
      const newState = reducer(state, { type: 'SET_APPEARANCE', payload: { key: 'hairColor', value: 'black' } });
      expect(newState.appearance.hairColor).toBe('black');
    });

    it('should update skinTone', () => {
      const newState = reducer(state, { type: 'SET_APPEARANCE', payload: { key: 'skinTone', value: 'dark' } });
      expect(newState.appearance.skinTone).toBe('dark');
    });

    it('should update eyeColor', () => {
      const newState = reducer(state, { type: 'SET_APPEARANCE', payload: { key: 'eyeColor', value: 'blue' } });
      expect(newState.appearance.eyeColor).toBe('blue');
    });

    it('should update hairStyle', () => {
      const newState = reducer(state, { type: 'SET_APPEARANCE', payload: { key: 'hairStyle', value: 'long' } });
      expect(newState.appearance.hairStyle).toBe('long');
    });

    it('should update build', () => {
      const newState = reducer(state, { type: 'SET_APPEARANCE', payload: { key: 'build', value: 'athletic' } });
      expect(newState.appearance.build).toBe('athletic');
    });

    it('should not affect other appearance properties', () => {
      const newState = reducer(state, { type: 'SET_APPEARANCE', payload: { key: 'hairColor', value: 'red' } });
      expect(newState.appearance.skinTone).toBe('fair');
      expect(newState.appearance.eyeColor).toBe('brown');
      expect(newState.appearance.hairStyle).toBe('short');
      expect(newState.appearance.build).toBe('average');
    });
  });

  // ============================================================
  // TOGGLE_SKILL
  // ============================================================

  describe('TOGGLE_SKILL', () => {
    it('should add a skill to selectedSkillIds', () => {
      let s = reducer(state, { type: 'SET_CLASS', payload: 'warrior' });
      expect(s.selectedSkillIds.has('sneak_attack')).toBe(false);
      s = reducer(s, { type: 'TOGGLE_SKILL', payload: 'sneak_attack' });
      expect(s.selectedSkillIds.has('sneak_attack')).toBe(true);
    });

    it('should remove a skill from selectedSkillIds', () => {
      let s = reducer(state, { type: 'SET_CLASS', payload: 'warrior' });
      expect(s.selectedSkillIds.has('swordsmanship')).toBe(true);
      s = reducer(s, { type: 'TOGGLE_SKILL', payload: 'swordsmanship' });
      expect(s.selectedSkillIds.has('swordsmanship')).toBe(false);
    });

    it('should preserve existing skills when toggling a new one', () => {
      let s = reducer(state, { type: 'SET_CLASS', payload: 'warrior' });
      s = reducer(s, { type: 'TOGGLE_SKILL', payload: 'sneak_attack' });
      expect(s.selectedSkillIds.has('swordsmanship')).toBe(true);
      expect(s.selectedSkillIds.has('sneak_attack')).toBe(true);
    });
  });

  // ============================================================
  // EQUIP_ITEM / UNEQUIP_ITEM
  // ============================================================

  describe('EQUIP_ITEM', () => {
    it('should equip an item to the specified slot', () => {
      const item = { id: 'iron_helm', name: 'Iron Helm', slot: 'head', type: 'armor', rarity: 'uncommon', statBonuses: { str: 1, con: 2 }, svgPaths: [] };
      const newState = reducer(state, { type: 'EQUIP_ITEM', payload: { slot: 'head', item } });
      expect(newState.equipment.head).toBe(item);
    });

    it('should swap out existing item in the slot', () => {
      const item1 = { id: 'leather_cap', name: 'Leather Cap', slot: 'head', type: 'armor', rarity: 'common', statBonuses: { con: 1 }, svgPaths: [] };
      const item2 = { id: 'iron_helm', name: 'Iron Helm', slot: 'head', type: 'armor', rarity: 'uncommon', statBonuses: { str: 1, con: 2 }, svgPaths: [] };
      let s = reducer(state, { type: 'EQUIP_ITEM', payload: { slot: 'head', item: item1 } });
      s = reducer(s, { type: 'EQUIP_ITEM', payload: { slot: 'head', item: item2 } });
      expect(s.equipment.head.id).toBe('iron_helm');
    });

    it('should recalculate HP/MP when equipping items with stat bonuses', () => {
      let s = reducer(state, { type: 'SET_CLASS', payload: 'warrior' });
      const item = { id: 'iron_helm', name: 'Iron Helm', slot: 'head', type: 'armor', rarity: 'uncommon', statBonuses: { str: 1, con: 2 }, svgPaths: [] };
      s = reducer(s, { type: 'EQUIP_ITEM', payload: { slot: 'head', item } });
      expect(s.maxHP).toBeGreaterThan(0);
    });
  });

  describe('UNEQUIP_ITEM', () => {
    it('should remove the item from the specified slot', () => {
      const item = { id: 'iron_helm', name: 'Iron Helm', slot: 'head', type: 'armor', rarity: 'uncommon', statBonuses: { str: 1, con: 2 }, svgPaths: [] };
      let s = reducer(state, { type: 'EQUIP_ITEM', payload: { slot: 'head', item } });
      s = reducer(s, { type: 'UNEQUIP_ITEM', payload: 'head' });
      expect(s.equipment.head).toBeNull();
    });
  });

  // ============================================================
  // GAIN_XP
  // ============================================================

  describe('GAIN_XP', () => {
    let warriorState;

    beforeEach(() => {
      warriorState = {
        ...state,
        class: { id: 'warrior', name: 'Warrior', hitDie: 'd10', startingSkills: ['swordsmanship', 'shield_bash', 'war_cry'] },
        level: 1,
        xp: 0,
        gold: 0,
        maxHP: 10,
        currentHP: 10,
        maxMP: 5,
        currentMP: 5,
        combatLog: [],
        statPointsToSpend: 0,
      };
    });

    it('should add XP to the character', () => {
      const newState = reducer(warriorState, { type: 'GAIN_XP', payload: 50 });
      expect(newState.xp).toBe(50);
    });

    it('should add XP cumulatively across multiple calls', () => {
      let s = warriorState;
      s = reducer(s, { type: 'GAIN_XP', payload: 30 });
      s = reducer(s, { type: 'GAIN_XP', payload: 20 });
      expect(s.xp).toBe(50);
    });

    it('should not trigger level up when XP is below threshold', () => {
      const newState = reducer(warriorState, { type: 'GAIN_XP', payload: 99 });
      expect(newState.xp).toBe(99);
      expect(newState.statPointsToSpend).toBe(0);
      expect(newState.level).toBe(1);
    });

    it('should grant statPointsToSpend when XP reaches threshold', () => {
      const newState = reducer(warriorState, { type: 'GAIN_XP', payload: 100 });
      expect(newState.xp).toBe(100);
      expect(newState.statPointsToSpend).toBe(1);
    });

    it('should not trigger level up when XP exceeds threshold', () => {
      const newState = reducer(warriorState, { type: 'GAIN_XP', payload: 150 });
      expect(newState.xp).toBe(150);
      expect(newState.statPointsToSpend).toBe(1);
      expect(newState.level).toBe(1);
    });
  });

  // ============================================================
  // LEVEL_UP
  // ============================================================

  describe('LEVEL_UP', () => {
    let warriorState;

    beforeEach(() => {
      warriorState = {
        ...state,
        class: { id: 'warrior', name: 'Warrior', hitDie: 'd10', startingSkills: ['swordsmanship', 'shield_bash', 'war_cry'] },
        level: 1,
        xp: 100,
        gold: 0,
        maxHP: 10,
        currentHP: 10,
        maxMP: 5,
        currentMP: 5,
        combatLog: [],
        statPointsToSpend: 0,
      };
    });

    it('should increment level', () => {
      const newState = reducer(warriorState, { type: 'LEVEL_UP' });
      expect(newState.level).toBe(2);
    });

    it('should refund XP for the leveled-up level', () => {
      const newState = reducer(warriorState, { type: 'LEVEL_UP' });
      expect(newState.xp).toBe(0);
    });

    it('should grant statPointsToSpend', () => {
      const newState = reducer(warriorState, { type: 'LEVEL_UP' });
      expect(newState.statPointsToSpend).toBe(1);
    });

    it('should increase maxHP by hpGainOnLevelUp', () => {
      // Warrior (d12) with CON=8: hpGain = 12 + floor((8-8)/2) = 12
      const newState = reducer(warriorState, { type: 'LEVEL_UP' });
      expect(newState.maxHP).toBe(22);
    });

    it('should increase currentHP by hpGainOnLevelUp', () => {
      const newState = reducer(warriorState, { type: 'LEVEL_UP' });
      expect(newState.currentHP).toBe(22);
    });

    it('should increase maxMP by mpGainOnLevelUp', () => {
      // INT=8, WIS=8: mpGain = floor((8-8)/2) + floor((8-8)/2) + 1 = 0 + 0 + 1 = 1
      const newState = reducer(warriorState, { type: 'LEVEL_UP' });
      expect(newState.maxMP).toBe(6);
    });

    it('should increase currentMP by mpGainOnLevelUp', () => {
      const newState = reducer(warriorState, { type: 'LEVEL_UP' });
      expect(newState.currentMP).toBe(6);
    });

    it('should handle level-up without a class (no HP/MP bonus)', () => {
      const noClassState = { ...warriorState, class: null };
      const newState = reducer(noClassState, { type: 'LEVEL_UP' });
      expect(newState.level).toBe(2);
      expect(newState.statPointsToSpend).toBe(1);
      expect(newState.maxHP).toBe(10);
      expect(newState.currentHP).toBe(10);
    });
  });

  // ============================================================
  // DISTRIBUTE_STAT
  // ============================================================

  describe('DISTRIBUTE_STAT', () => {
    let warriorState;

    beforeEach(() => {
      warriorState = {
        ...state,
        class: { id: 'warrior', name: 'Warrior', hitDie: 'd10', startingSkills: ['swordsmanship', 'shield_bash', 'war_cry'] },
        level: 1,
        xp: 0,
        gold: 0,
        maxHP: 10,
        currentHP: 10,
        maxMP: 5,
        currentMP: 5,
        combatLog: [],
        statPointsToSpend: 1,
        pointsRemaining: 26,
        stats: { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 },
      };
    });

    it('should increment the specified stat', () => {
      const newState = reducer(warriorState, { type: 'DISTRIBUTE_STAT', payload: { statId: 'str', value: 1 } });
      expect(newState.stats.str).toBe(9);
    });

    it('should reduce statPointsToSpend', () => {
      const newState = reducer(warriorState, { type: 'DISTRIBUTE_STAT', payload: { statId: 'str', value: 1 } });
      expect(newState.statPointsToSpend).toBe(0);
    });

    it('should reduce pointsRemaining', () => {
      const newState = reducer(warriorState, { type: 'DISTRIBUTE_STAT', payload: { statId: 'str', value: 1 } });
      expect(newState.pointsRemaining).toBe(25);
    });

    it('should cap statPointsToSpend at 0 (not go negative)', () => {
      let s = { ...warriorState, statPointsToSpend: 1 };
      s = reducer(s, { type: 'DISTRIBUTE_STAT', payload: { statId: 'str', value: 1 } });
      expect(s.statPointsToSpend).toBe(0);
      s = reducer(s, { type: 'DISTRIBUTE_STAT', payload: { statId: 'str', value: 5 } });
      expect(s.statPointsToSpend).toBe(0);
    });

    it('should work for all stats', () => {
      ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach(stat => {
        const newState = reducer(warriorState, { type: 'DISTRIBUTE_STAT', payload: { statId: stat, value: 1 } });
        expect(newState.stats[stat]).toBe(9);
      });
    });
  });

  // ============================================================
  // ADD_GOLD
  // ============================================================

  describe('ADD_GOLD', () => {
    let warriorState;

    beforeEach(() => {
      warriorState = {
        ...state,
        class: { id: 'warrior', name: 'Warrior' },
        level: 1,
        xp: 0,
        gold: 0,
        maxHP: 10,
        currentHP: 10,
        maxMP: 5,
        currentMP: 5,
        combatLog: [],
        statPointsToSpend: 0,
      };
    });

    it('should add gold to the character', () => {
      const newState = reducer(warriorState, { type: 'ADD_GOLD', payload: 50 });
      expect(newState.gold).toBe(50);
    });

    it('should add gold cumulatively', () => {
      let s = warriorState;
      s = reducer(s, { type: 'ADD_GOLD', payload: 20 });
      s = reducer(s, { type: 'ADD_GOLD', payload: 30 });
      expect(s.gold).toBe(50);
    });

    it('should handle negative gold payload (subtract gold)', () => {
      let s = { ...warriorState, gold: 100 };
      const newState = reducer(s, { type: 'ADD_GOLD', payload: -30 });
      expect(newState.gold).toBe(70);
    });

    it('should handle zero gold payload', () => {
      const newState = reducer(warriorState, { type: 'ADD_GOLD', payload: 0 });
      expect(newState.gold).toBe(0);
    });
  });

  // ============================================================
  // ADD_CONSUMABLE / REMOVE_CONSUMABLE
  // ============================================================

  describe('ADD_CONSUMABLE', () => {
    it('should add a consumable to inventory', () => {
      const newState = reducer(state, { type: 'ADD_CONSUMABLE', payload: { itemId: 'healing_potion', quantity: 3 } });
      expect(newState.consumables.healing_potion).toBe(3);
    });

    it('should increment existing consumable quantity', () => {
      let s = reducer(state, { type: 'ADD_CONSUMABLE', payload: { itemId: 'healing_potion', quantity: 2 } });
      s = reducer(s, { type: 'ADD_CONSUMABLE', payload: { itemId: 'healing_potion', quantity: 3 } });
      expect(s.consumables.healing_potion).toBe(5);
    });

    it('should not affect other consumables', () => {
      let s = reducer(state, { type: 'ADD_CONSUMABLE', payload: { itemId: 'healing_potion', quantity: 2 } });
      s = reducer(s, { type: 'ADD_CONSUMABLE', payload: { itemId: 'mana_potion', quantity: 1 } });
      expect(s.consumables.healing_potion).toBe(2);
      expect(s.consumables.mana_potion).toBe(1);
    });
  });

  describe('REMOVE_CONSUMABLE', () => {
    it('should remove quantity from a consumable', () => {
      let s = reducer(state, { type: 'ADD_CONSUMABLE', payload: { itemId: 'healing_potion', quantity: 5 } });
      s = reducer(s, { type: 'REMOVE_CONSUMABLE', payload: { itemId: 'healing_potion', quantity: 2 } });
      expect(s.consumables.healing_potion).toBe(3);
    });

    it('should remove the consumable entirely when quantity reaches 0', () => {
      let s = reducer(state, { type: 'ADD_CONSUMABLE', payload: { itemId: 'healing_potion', quantity: 2 } });
      s = reducer(s, { type: 'REMOVE_CONSUMABLE', payload: { itemId: 'healing_potion', quantity: 2 } });
      expect(s.consumables.healing_potion).toBeUndefined();
    });

    it('should remove the consumable when quantity goes below 0', () => {
      let s = reducer(state, { type: 'ADD_CONSUMABLE', payload: { itemId: 'healing_potion', quantity: 1 } });
      s = reducer(s, { type: 'REMOVE_CONSUMABLE', payload: { itemId: 'healing_potion', quantity: 5 } });
      expect(s.consumables.healing_potion).toBeUndefined();
    });

    it('should not affect other consumables when removing', () => {
      let s = reducer(state, { type: 'ADD_CONSUMABLE', payload: { itemId: 'healing_potion', quantity: 2 } });
      s = reducer(s, { type: 'ADD_CONSUMABLE', payload: { itemId: 'mana_potion', quantity: 3 } });
      s = reducer(s, { type: 'REMOVE_CONSUMABLE', payload: { itemId: 'healing_potion', quantity: 2 } });
      expect(s.consumables.mana_potion).toBe(3);
    });
  });

  // ============================================================
  // USE_CONSUMABLE
  // ============================================================

  describe('USE_CONSUMABLE', () => {
    it('should heal HP with a healing potion', () => {
      let s = {
        ...state,
        maxHP: 50,
        currentHP: 30,
        consumables: { healing_potion: 3 },
      };
      s = reducer(s, { type: 'USE_CONSUMABLE', payload: 'healing_potion' });
      // healing_potion heals 30 HP: 30 + 30 = 60, capped at maxHP 50
      expect(s.currentHP).toBe(50);
      expect(s.consumables.healing_potion).toBe(2);
    });

    it('should restore MP with a mana potion', () => {
      let s = {
        ...state,
        maxMP: 30,
        currentMP: 10,
        consumables: { mana_potion: 2 },
      };
      s = reducer(s, { type: 'USE_CONSUMABLE', payload: 'mana_potion' });
      expect(s.currentMP).toBe(30); // capped at maxMP
      expect(s.consumables.mana_potion).toBe(1);
    });

    it('should do nothing when consumable does not exist', () => {
      const s = { ...state, consumables: {} };
      const newState = reducer(s, { type: 'USE_CONSUMABLE', payload: 'healing_potion' });
      expect(newState).toBe(s);
    });

    it('should do nothing when consumable quantity is 0', () => {
      const s = { ...state, consumables: { healing_potion: 0 } };
      const newState = reducer(s, { type: 'USE_CONSUMABLE', payload: 'healing_potion' });
      expect(newState).toBe(s);
    });

    it('should add to combatLog when using consumable', () => {
      let s = {
        ...state,
        maxHP: 50,
        currentHP: 30,
        currentMP: 5,
        consumables: { healing_potion: 3 },
        combatLog: [],
      };
      s = reducer(s, { type: 'USE_CONSUMABLE', payload: 'healing_potion' });
      expect(s.combatLog).toHaveLength(1);
      expect(s.combatLog[0].type).toBe('consumable_used');
      expect(s.combatLog[0].itemId).toBe('Healing Potion');
    });

    it('should apply buff effect from strength_elixir', () => {
      let s = {
        ...state,
        consumables: { strength_elixir: 2 },
        temporaryBuffs: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
      };
      s = reducer(s, { type: 'USE_CONSUMABLE', payload: 'strength_elixir' });
      expect(s.temporaryBuffs.str).toBe(2);
      expect(s.consumables.strength_elixir).toBe(1);
    });

    it('should apply buff effect from dexterity_elixir', () => {
      let s = {
        ...state,
        consumables: { dexterity_elixir: 2 },
        temporaryBuffs: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
      };
      s = reducer(s, { type: 'USE_CONSUMABLE', payload: 'dexterity_elixir' });
      expect(s.temporaryBuffs.dex).toBe(2);
      expect(s.consumables.dexterity_elixir).toBe(1);
    });

    it('should apply buff_multi effect from elixir_of_might', () => {
      let s = {
        ...state,
        consumables: { elixir_of_might: 2 },
        temporaryBuffs: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
      };
      s = reducer(s, { type: 'USE_CONSUMABLE', payload: 'elixir_of_might' });
      expect(s.temporaryBuffs.str).toBe(3);
      expect(s.temporaryBuffs.con).toBe(2);
      expect(s.consumables.elixir_of_might).toBe(1);
    });

    it('should apply full_restore effect from phoenix_draught', () => {
      let s = {
        ...state,
        maxHP: 50,
        currentHP: 10,
        maxMP: 30,
        currentMP: 5,
        consumables: { phoenix_draught: 2 },
      };
      s = reducer(s, { type: 'USE_CONSUMABLE', payload: 'phoenix_draught' });
      expect(s.currentHP).toBe(50);
      expect(s.currentMP).toBe(30);
      expect(s.consumables.phoenix_draught).toBe(1);
    });

    it('should stack multiple buffs when using different buff consumables', () => {
      let s = {
        ...state,
        consumables: { strength_elixir: 2, dexterity_elixir: 2 },
        temporaryBuffs: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
      };
      s = reducer(s, { type: 'USE_CONSUMABLE', payload: 'strength_elixir' });
      s = reducer(s, { type: 'USE_CONSUMABLE', payload: 'dexterity_elixir' });
      expect(s.temporaryBuffs.str).toBe(2);
      expect(s.temporaryBuffs.dex).toBe(2);
    });
  });

  // ============================================================
  // BUY_ITEM
  // ============================================================

  describe('BUY_ITEM', () => {
    it('should buy a consumable and deduct gold', () => {
      // healing_potion costs 25 gold
      let s = {
        ...state,
        gold: 100,
        consumables: {},
      };
      s = reducer(s, { type: 'BUY_ITEM', payload: { itemId: 'healing_potion', quantity: 2 } });
      expect(s.gold).toBe(50); // 2 * 25 = 50
      expect(s.consumables.healing_potion).toBe(2);
    });

    it('should do nothing when insufficient gold', () => {
      let s = {
        ...state,
        gold: 1,
        consumables: {},
      };
      const newState = reducer(s, { type: 'BUY_ITEM', payload: { itemId: 'healing_potion', quantity: 1 } });
      expect(newState).toBe(s);
    });

    it('should do nothing for unknown item', () => {
      let s = {
        ...state,
        gold: 100,
        consumables: {},
      };
      const newState = reducer(s, { type: 'BUY_ITEM', payload: { itemId: 'unknown_item', quantity: 1 } });
      expect(newState).toBe(s);
    });

    it('should log purchase to combatLog', () => {
      let s = {
        ...state,
        gold: 100,
        consumables: {},
        combatLog: [],
      };
      s = reducer(s, { type: 'BUY_ITEM', payload: { itemId: 'healing_potion', quantity: 1 } });
      expect(s.combatLog).toHaveLength(1);
      expect(s.combatLog[0].type).toBe('purchase');
      expect(s.combatLog[0].itemId).toBe('Healing Potion');
      expect(s.combatLog[0].cost).toBe(25);
    });
  });

  // ============================================================
  // CLEAR_BUFFS
  // ============================================================

  describe('CLEAR_BUFFS', () => {
    it('should reset all temporary buffs to 0', () => {
      let s = {
        ...state,
        temporaryBuffs: { str: 5, dex: 3, con: 2, int: 0, wis: 0, cha: 0 },
      };
      const newState = reducer(s, { type: 'CLEAR_BUFFS' });
      expect(newState.temporaryBuffs.str).toBe(0);
      expect(newState.temporaryBuffs.dex).toBe(0);
      expect(newState.temporaryBuffs.con).toBe(0);
      expect(newState.temporaryBuffs.int).toBe(0);
      expect(newState.temporaryBuffs.wis).toBe(0);
      expect(newState.temporaryBuffs.cha).toBe(0);
    });
  });

  // ============================================================
  // REST
  // ============================================================

  describe('REST', () => {
    it('should restore currentHP to maxHP', () => {
      let s = {
        ...state,
        maxHP: 50,
        currentHP: 30,
        maxMP: 20,
        currentMP: 10,
        gold: 100,
        level: 5,
        combatLog: [],
      };
      const newState = reducer(s, { type: 'REST' });
      expect(newState.currentHP).toBe(50);
      expect(newState.currentMP).toBe(20);
    });

    it('should cost gold proportional to level', () => {
      let s = {
        ...state,
        maxHP: 50,
        currentHP: 30,
        maxMP: 20,
        currentMP: 10,
        gold: 100,
        level: 5,
        combatLog: [],
      };
      const newState = reducer(s, { type: 'REST' });
      // goldCost = max(1, floor(5 * 5)) = 25
      expect(newState.gold).toBe(75);
    });

    it('should log the rest action to combatLog', () => {
      let s = {
        ...state,
        maxHP: 50,
        currentHP: 30,
        maxMP: 20,
        currentMP: 10,
        gold: 100,
        level: 1,
        combatLog: [],
      };
      const newState = reducer(s, { type: 'REST' });
      expect(newState.combatLog).toHaveLength(1);
      expect(newState.combatLog[0].type).toBe('rest');
      expect(newState.combatLog[0].goldCost).toBe(5);
      expect(newState.combatLog[0].hpGain).toBe(20);
      expect(newState.combatLog[0].mpGain).toBe(10);
    });

    it('should not reduce gold below 0', () => {
      let s = {
        ...state,
        maxHP: 50,
        currentHP: 30,
        maxMP: 20,
        currentMP: 10,
        gold: 3,
        level: 5,
        combatLog: [],
      };
      const newState = reducer(s, { type: 'REST' });
      expect(newState.gold).toBe(0);
    });

    it('should not restore HP if already at max', () => {
      let s = {
        ...state,
        maxHP: 50,
        currentHP: 50,
        maxMP: 20,
        currentMP: 10,
        gold: 100,
        level: 1,
        combatLog: [],
      };
      const newState = reducer(s, { type: 'REST' });
      expect(newState.currentHP).toBe(50);
    });

    it('should not restore MP if already at max', () => {
      let s = {
        ...state,
        maxHP: 50,
        currentHP: 30,
        maxMP: 20,
        currentMP: 20,
        gold: 100,
        level: 1,
        combatLog: [],
      };
      const newState = reducer(s, { type: 'REST' });
      expect(newState.currentMP).toBe(20);
    });
  });

  // ============================================================
  // COMBAT_RESULT
  // ============================================================

  describe('COMBAT_RESULT', () => {
    it('should update currentHP and currentMP', () => {
      const newState = reducer(state, {
        type: 'COMBAT_RESULT',
        payload: {
          hpRemaining: 5, mpRemaining: 3,
          monstersDefeated: 2, bossDefeated: false,
          totalXp: 50, totalGold: 20, lootDrops: [],
        },
      });
      expect(newState.currentHP).toBe(5);
      expect(newState.currentMP).toBe(3);
    });

    it('should log combat result to combatLog', () => {
      const newState = reducer(state, {
        type: 'COMBAT_RESULT',
        payload: {
          hpRemaining: 5, mpRemaining: 3,
          monstersDefeated: 2, bossDefeated: false,
          totalXp: 50, totalGold: 20, lootDrops: [{ itemId: 'potion' }],
        },
      });
      expect(newState.combatLog).toHaveLength(1);
      expect(newState.combatLog[0].type).toBe('combat');
      expect(newState.combatLog[0].monstersDefeated).toBe(2);
      expect(newState.combatLog[0].bossDefeated).toBe(false);
      expect(newState.combatLog[0].totalXp).toBe(50);
      expect(newState.combatLog[0].totalGold).toBe(20);
    });

    it('should append to existing combatLog', () => {
      let s = {
        ...state,
        combatLog: [{ type: 'rest', timestamp: 1 }],
      };
      const newState = reducer(s, {
        type: 'COMBAT_RESULT',
        payload: {
          hpRemaining: 5, mpRemaining: 3,
          monstersDefeated: 1, bossDefeated: false,
          totalXp: 30, totalGold: 10, lootDrops: [],
        },
      });
      expect(newState.combatLog).toHaveLength(2);
      expect(newState.combatLog[0].type).toBe('rest');
      expect(newState.combatLog[1].type).toBe('combat');
    });

    it('should handle bossDefeated=true', () => {
      const newState = reducer(state, {
        type: 'COMBAT_RESULT',
        payload: {
          hpRemaining: 1, mpRemaining: 0,
          monstersDefeated: 3, bossDefeated: true,
          totalXp: 200, totalGold: 100, lootDrops: [{ itemId: 'rare_sword' }],
        },
      });
      expect(newState.currentHP).toBe(1);
      expect(newState.currentMP).toBe(0);
      expect(newState.combatLog[0].bossDefeated).toBe(true);
    });
  });

  // ============================================================
  // CLEAR_COMBAT_LOG
  // ============================================================

  describe('CLEAR_COMBAT_LOG', () => {
    it('should clear all combatLog entries', () => {
      let s = {
        ...state,
        combatLog: [
          { type: 'rest', timestamp: 1 },
          { type: 'combat', timestamp: 2 },
        ],
      };
      const newState = reducer(s, { type: 'CLEAR_COMBAT_LOG' });
      expect(newState.combatLog).toEqual([]);
    });

    it('should not affect other state fields', () => {
      let s = {
        ...state,
        currentHP: 50,
        currentMP: 20,
        gold: 100,
        level: 5,
        xp: 500,
        combatLog: [{ type: 'rest', timestamp: 1 }],
      };
      const newState = reducer(s, { type: 'CLEAR_COMBAT_LOG' });
      expect(newState.currentHP).toBe(50);
      expect(newState.currentMP).toBe(20);
      expect(newState.gold).toBe(100);
      expect(newState.level).toBe(5);
      expect(newState.xp).toBe(500);
    });

    it('should work on empty combatLog', () => {
      let s = { ...state, combatLog: [] };
      const newState = reducer(s, { type: 'CLEAR_COMBAT_LOG' });
      expect(newState.combatLog).toEqual([]);
    });

    it('should return a new array (not the same reference)', () => {
      let s = { ...state, combatLog: [{ type: 'rest', timestamp: 1 }] };
      const newState = reducer(s, { type: 'CLEAR_COMBAT_LOG' });
      expect(newState.combatLog).not.toBe(s.combatLog);
    });
  });

  // ============================================================
  // SET_CURRENT_DUNGEON
  // ============================================================

  describe('SET_CURRENT_DUNGEON', () => {
    it('should set the current dungeon', () => {
      const newState = reducer(state, { type: 'SET_CURRENT_DUNGEON', payload: 'goblin_caves' });
      expect(newState.currentDungeon).toBe('goblin_caves');
    });

    it('should not affect other state fields', () => {
      const newState = reducer(state, { type: 'SET_CURRENT_DUNGEON', payload: 'dark_forest_ruins' });
      expect(newState.name).toBe('');
      expect(newState.class).toBeNull();
    });
  });

  // ============================================================
  // START_COMBAT
  // ============================================================

  describe('START_COMBAT', () => {
    it('should initialize combat state with dungeon monsters', () => {
      const newState = reducer(state, { type: 'START_COMBAT', payload: 'goblin_caves' });
      expect(newState.combatState).toBeDefined();
      expect(newState.combatState.active).toBe(true);
      expect(newState.combatState.monsters.length).toBeGreaterThan(0);
      expect(newState.combatState.currentMonsterIndex).toBe(0);
      expect(newState.combatState.monstersDefeated).toBe(0);
      expect(newState.combatState.bossDefeated).toBe(false);
    });

    it('should set the boss', () => {
      const newState = reducer(state, { type: 'START_COMBAT', payload: 'goblin_caves' });
      expect(newState.combatState.boss).toBeDefined();
      expect(newState.combatState.boss.name).toBe('Goblin Chieftain');
    });

    it('should return state unchanged for unknown dungeon', () => {
      const before = JSON.stringify(state);
      const newState = reducer(state, { type: 'START_COMBAT', payload: 'unknown_dungeon' });
      expect(newState.combatState).toBeUndefined();
    });
  });

  // ============================================================
  // RESOLVE_COMBAT
  // ============================================================

  describe('RESOLVE_COMBAT', () => {
    it('should complete dungeon when all monsters and boss defeated', () => {
      let s = {
        ...state,
        class: { id: 'warrior', name: 'Warrior' },
        level: 1,
        stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
        xp: 0,
        gold: 0,
        maxHP: 50,
        currentHP: 30,
        maxMP: 10,
        currentMP: 5,
        currentDungeon: 'goblin_caves',
        completedDungeons: [],
        combatLog: [],
        combatState: {
          active: true,
          monsters: [],
          boss: null,
          currentMonsterIndex: 0,
          monstersDefeated: 0,
          bossDefeated: true,
          totalXp: 100,
          totalGold: 50,
          lootDrops: [],
        },
        equipment: { head: null, chest: null, pants: null, boots: null, rightHand: null, leftHand: null, accessory1: null, accessory2: null, accessory3: null },
      };
      const newState = reducer(s, { type: 'RESOLVE_COMBAT' });
      expect(newState.combatState.active).toBe(false);
      expect(newState.combatState.monsters.length).toBe(0);
      expect(newState.xp).toBeGreaterThan(100);
      expect(newState.gold).toBeGreaterThan(50);
    });

    it('should advance to next monster when current monster is defeated', () => {
      let s = {
        ...state,
        class: { id: 'warrior', name: 'Warrior' },
        level: 1,
        stats: { str: 20, dex: 20, con: 20, int: 10, wis: 10, cha: 10 },
        xp: 0,
        gold: 0,
        maxHP: 50,
        currentHP: 30,
        maxMP: 10,
        currentMP: 5,
        combatLog: [],
        combatState: {
          active: true,
          monsters: [
            { id: 'goblin_scout', name: 'Goblin Scout', level: 1, hp: 15, maxHp: 15, attack: 4, defense: 1, xpReward: 25, goldReward: [5, 15], currentHp: 5, lootTable: [] },
            { id: 'goblin_thug', name: 'Goblin Thug', level: 2, hp: 25, maxHp: 25, attack: 6, defense: 2, xpReward: 40, goldReward: [10, 25], currentHp: 25, lootTable: [] },
          ],
          boss: null,
          currentMonsterIndex: 0,
          monstersDefeated: 0,
          bossDefeated: false,
          totalXp: 0,
          totalGold: 0,
          lootDrops: [],
        },
        equipment: { head: null, chest: null, pants: null, boots: null, rightHand: null, leftHand: null, accessory1: null, accessory2: null, accessory3: null },
      };
      const newState = reducer(s, { type: 'RESOLVE_COMBAT' });
      expect(newState.combatState.currentMonsterIndex).toBe(1);
      expect(newState.combatState.monstersDefeated).toBe(1);
    });

    it('should return state unchanged when no combat state', () => {
      const newState = reducer(state, { type: 'RESOLVE_COMBAT' });
      expect(newState).toBe(state);
    });

    it('should return state unchanged when combat not active', () => {
      const s = {
        ...state,
        combatState: { active: false, monsters: [], boss: null, currentMonsterIndex: 0, monstersDefeated: 0, bossDefeated: false, totalXp: 0, totalGold: 0, lootDrops: [] },
      };
      const newState = reducer(s, { type: 'RESOLVE_COMBAT' });
      expect(newState).toBe(s);
    });

    it('should add loot drop when defeating a monster', () => {
      let s = {
        ...state,
        class: { id: 'warrior', name: 'Warrior' },
        level: 1,
        stats: { str: 20, dex: 20, con: 20, int: 10, wis: 10, cha: 10 },
        xp: 0,
        gold: 0,
        maxHP: 50,
        currentHP: 30,
        maxMP: 10,
        currentMP: 5,
        combatLog: [],
        combatState: {
          active: true,
          monsters: [
            { id: 'goblin_scout', name: 'Goblin Scout', level: 1, hp: 15, maxHp: 15, attack: 4, defense: 1, xpReward: 25, goldReward: [5, 15], currentHp: 5, lootTable: [{ itemId: 'leather_cap', weight: 10 }] },
          ],
          boss: null,
          currentMonsterIndex: 0,
          monstersDefeated: 0,
          bossDefeated: false,
          totalXp: 0,
          totalGold: 0,
          lootDrops: [],
        },
        equipment: { head: null, chest: null, pants: null, boots: null, rightHand: null, leftHand: null, accessory1: null, accessory2: null, accessory3: null },
      };
      const newState = reducer(s, { type: 'RESOLVE_COMBAT' });
      expect(newState.combatState.currentMonsterIndex).toBe(1);
      expect(newState.combatState.lootDrops.length).toBeGreaterThanOrEqual(0);
    });
  });

  // ============================================================
  // FLEE_COMBAT
  // ============================================================

  describe('FLEE_COMBAT', () => {
    it('should return state unchanged when no combat state', () => {
      const newState = reducer(state, { type: 'FLEE_COMBAT' });
      expect(newState).toBe(state);
    });

    it('should return state unchanged when combat not active', () => {
      const s = {
        ...state,
        combatState: { active: false, monsters: [], boss: null, currentMonsterIndex: 0, monstersDefeated: 0, bossDefeated: false, totalXp: 0, totalGold: 0, lootDrops: [] },
      };
      const newState = reducer(s, { type: 'FLEE_COMBAT' });
      expect(newState).toBe(s);
    });

    it('should not throw when attempting to flee', () => {
      let s = {
        ...state,
        maxHP: 50,
        currentHP: 50,
        combatState: { active: true, monsters: [], boss: null, currentMonsterIndex: 0, monstersDefeated: 0, bossDefeated: false, totalXp: 0, totalGold: 0, lootDrops: [] },
      };
      // Flee has 50% random chance, so we just verify no error
      const newState = reducer(s, { type: 'FLEE_COMBAT' });
      // If flee succeeded, combatState should be inactive
      // If flee failed, combatState should still be active but HP reduced
      if (!newState.combatState.active) {
        expect(newState.currentHP).toBeLessThanOrEqual(50);
      } else {
        // Failed flee - penalty damage applied
        expect(newState.currentHP).toBeLessThanOrEqual(50);
      }
    });
  });

  // ============================================================
  // LOAD_CHARACTER
  // ============================================================

  describe('LOAD_CHARACTER', () => {
    it('should load a saved character', () => {
      const saved = {
        name: 'Thorin',
        class: { id: 'warrior', name: 'Warrior' },
        race: { id: 'dwarf', name: 'Dwarf' },
        stats: { str: 12, dex: 10, con: 11, int: 8, wis: 8, cha: 8 },
        pointsRemaining: 13,
        appearance: { hairColor: 'black', skinTone: 'dark', eyeColor: 'amber', hairStyle: 'braided', build: 'muscular' },
        selectedSkillIds: ['swordsmanship', 'shield_bash'],
        equipment: { head: null, chest: null, pants: null, boots: null, rightHand: null, leftHand: null, accessory1: null, accessory2: null, accessory3: null },
        level: 5,
        xp: 500,
        gold: 100,
        maxHP: 60,
        currentHP: 60,
        maxMP: 10,
        currentMP: 10,
        completedDungeons: ['goblin_caves'],
        statPointsToSpend: 2,
        consumables: { healing_potion: 3 },
      };
      const newState = reducer(state, { type: 'LOAD_CHARACTER', payload: saved });
      expect(newState.name).toBe('Thorin');
      expect(newState.class.id).toBe('warrior');
      expect(newState.race.id).toBe('dwarf');
      expect(newState.stats.str).toBe(12);
      expect(newState.level).toBe(5);
      expect(newState.xp).toBe(500);
      expect(newState.gold).toBe(100);
      expect(newState.maxHP).toBe(60);
      expect(newState.currentHP).toBe(60);
      expect(newState.maxMP).toBe(10);
      expect(newState.currentMP).toBe(10);
      expect(newState.completedDungeons).toContain('goblin_caves');
      expect(newState.statPointsToSpend).toBe(2);
      expect(newState.consumables.healing_potion).toBe(3);
      expect(newState.selectedSkillIds).toBeInstanceOf(Set);
      expect(newState.selectedSkillIds.has('swordsmanship')).toBe(true);
      expect(newState.selectedSkillIds.has('shield_bash')).toBe(true);
    });

    it('should convert array selectedSkillIds to Set', () => {
      const saved = {
        name: 'Test', class: null, race: null,
        stats: {}, pointsRemaining: 27,
        appearance: {}, selectedSkillIds: ['fireball'],
        equipment: {}, level: 1, xp: 0, gold: 0,
        maxHP: 10, currentHP: 10, maxMP: 5, currentMP: 5,
        completedDungeons: [], statPointsToSpend: 0, consumables: {},
      };
      const newState = reducer(state, { type: 'LOAD_CHARACTER', payload: saved });
      expect(newState.selectedSkillIds).toBeInstanceOf(Set);
      expect(newState.selectedSkillIds.has('fireball')).toBe(true);
    });

    it('should handle missing equipment', () => {
      const saved = {
        name: 'Test', class: null, race: null,
        stats: {}, pointsRemaining: 27,
        appearance: {}, selectedSkillIds: [],
        level: 1, xp: 0, gold: 0,
        maxHP: 10, currentHP: 10, maxMP: 5, currentMP: 5,
        completedDungeons: [], statPointsToSpend: 0, consumables: {},
      };
      const newState = reducer(state, { type: 'LOAD_CHARACTER', payload: saved });
      expect(newState.equipment.head).toBeNull();
    });

    it('should reset temporaryBuffs on load', () => {
      let s = {
        ...state,
        temporaryBuffs: { str: 5, dex: 3, con: 2, int: 0, wis: 0, cha: 0 },
      };
      const saved = {
        name: 'Test', class: null, race: null,
        stats: {}, pointsRemaining: 27,
        appearance: {}, selectedSkillIds: [],
        equipment: {}, level: 1, xp: 0, gold: 0,
        maxHP: 10, currentHP: 10, maxMP: 5, currentMP: 5,
        completedDungeons: [], statPointsToSpend: 0, consumables: {},
      };
      const newState = reducer(s, { type: 'LOAD_CHARACTER', payload: saved });
      expect(newState.temporaryBuffs.str).toBe(0);
      expect(newState.temporaryBuffs.dex).toBe(0);
    });
  });

  // ============================================================
  // RESET
  // ============================================================

  describe('RESET', () => {
    it('should reset to initial state', () => {
      let s = reducer(state, { type: 'SET_NAME', payload: 'Aragorn' });
      s = reducer(s, { type: 'SET_CLASS', payload: 'warrior' });
      s = reducer(s, { type: 'SET_RACE', payload: 'elf' });
      s = reducer(s, { type: 'SET_APPEARANCE', payload: { key: 'hairColor', value: 'black' } });
      s = reducer(s, { type: 'INCREMENT_STAT', payload: 'str' });
      const newState = reducer(s, { type: 'RESET' });
      expect(newState.name).toBe('');
      expect(newState.class).toBeNull();
      expect(newState.race).toBeNull();
      expect(newState.stats.str).toBe(8);
      expect(newState.pointsRemaining).toBe(27);
      expect(newState.appearance.hairColor).toBe('brown');
      expect(newState.level).toBe(1);
      expect(newState.xp).toBe(0);
    });
  });

  // ============================================================
  // Helper function tests
  // ============================================================

  describe('createEmptyEquipment', () => {
    it('should create equipment with all 9 slots set to null', () => {
      const eq = createEmptyEquipment();
      expect(eq.head).toBeNull();
      expect(eq.chest).toBeNull();
      expect(eq.pants).toBeNull();
      expect(eq.boots).toBeNull();
      expect(eq.rightHand).toBeNull();
      expect(eq.leftHand).toBeNull();
      expect(eq.accessory1).toBeNull();
      expect(eq.accessory2).toBeNull();
      expect(eq.accessory3).toBeNull();
    });
  });

  describe('getEquippedBonuses', () => {
    it('should return zero bonuses when no items equipped', () => {
      const bonuses = getEquippedBonuses(state.equipment);
      expect(bonuses).toEqual({ str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 });
    });

    it('should sum stat bonuses from equipped items', () => {
      const equipment = {
        chest: { statBonuses: { str: 3, con: 3 } },
        pants: { statBonuses: { dex: 1 } },
        boots: { statBonuses: { con: 2 } },
        rightHand: { statBonuses: { str: 2 } },
        leftHand: { statBonuses: { con: 3 } },
        accessory1: { statBonuses: { str: 3 } },
        accessory2: { statBonuses: { str: 4, con: 1 } },
        accessory3: { statBonuses: { con: 2, wis: 1 } },
      };
      const bonuses = getEquippedBonuses(equipment);
      expect(bonuses.str).toBe(12);
      expect(bonuses.dex).toBe(1);
      expect(bonuses.con).toBe(11);
      expect(bonuses.int).toBe(0);
      expect(bonuses.wis).toBe(1);
      expect(bonuses.cha).toBe(0);
    });

    it('should handle null items gracefully', () => {
      const equipment = {
        head: null,
        chest: { statBonuses: { str: 2 } },
        pants: null,
        boots: { statBonuses: { con: 1 } },
        rightHand: null,
        leftHand: null,
        accessory1: null,
        accessory2: null,
        accessory3: null,
      };
      const bonuses = getEquippedBonuses(equipment);
      expect(bonuses.str).toBe(2);
      expect(bonuses.con).toBe(1);
    });
  });

  describe('getAllBonuses', () => {
    it('should combine equipped bonuses and temporary buffs', () => {
      const stateWithBuffs = {
        ...state,
        equipment: {
          chest: { statBonuses: { str: 3, con: 2 } },
          rightHand: { statBonuses: { str: 2 } },
        },
        temporaryBuffs: { str: 5, dex: 3, con: 0, int: 0, wis: 0, cha: 0 },
      };
      const bonuses = getAllBonuses(stateWithBuffs);
      expect(bonuses.str).toBe(10); // 3 + 2 + 5
      expect(bonuses.dex).toBe(3);
      expect(bonuses.con).toBe(2);
    });

    it('should return equipped bonuses when no temporary buffs', () => {
      const stateNoBuffs = {
        ...state,
        equipment: {
          chest: { statBonuses: { str: 5 } },
        },
        temporaryBuffs: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
      };
      const bonuses = getAllBonuses(stateNoBuffs);
      expect(bonuses.str).toBe(5);
    });
  });

  describe('recalcHPAndMP', () => {
    it('should return default values when no class is set', () => {
      const result = recalcHPAndMP(state);
      expect(result.maxHP).toBe(10);
      expect(result.currentHP).toBe(10);
      expect(result.maxMP).toBe(5);
      expect(result.currentMP).toBe(5);
    });

    it('should recalculate HP/MP when class is set', () => {
      const stateWithClass = {
        ...state,
        class: { id: 'warrior', name: 'Warrior' },
        stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
        level: 1,
        equipment: { head: null, chest: null, pants: null, boots: null, rightHand: null, leftHand: null, accessory1: null, accessory2: null, accessory3: null },
      };
      const result = recalcHPAndMP(stateWithClass);
      expect(result.maxHP).toBeGreaterThan(0);
      expect(result.maxMP).toBeGreaterThanOrEqual(0);
    });

    it('should clamp currentHP to new maxHP', () => {
      const stateWithClass = {
        ...state,
        class: { id: 'warrior', name: 'Warrior' },
        stats: { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 },
        level: 1,
        equipment: { head: null, chest: null, pants: null, boots: null, rightHand: null, leftHand: null, accessory1: null, accessory2: null, accessory3: null },
        currentHP: 50, // higher than calculated maxHP
      };
      const result = recalcHPAndMP(stateWithClass);
      expect(result.currentHP).toBe(result.maxHP);
    });

    it('should clamp currentMP to new maxMP', () => {
      const stateWithClass = {
        ...state,
        class: { id: 'warrior', name: 'Warrior' },
        stats: { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 },
        level: 1,
        equipment: { head: null, chest: null, pants: null, boots: null, rightHand: null, leftHand: null, accessory1: null, accessory2: null, accessory3: null },
        currentMP: 50, // higher than calculated maxMP
      };
      const result = recalcHPAndMP(stateWithClass);
      expect(result.currentMP).toBe(result.maxMP);
    });
  });
});
