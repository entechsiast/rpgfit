import { CLASSES } from '../data/classes';
import { RACES } from '../data/races';
import { STATS, BASE_STAT, MAX_STAT, TOTAL_POINTS } from '../data/stats';

const createInitialState = () => ({
  name: '',
  class: null,
  race: null,
  stats: { str: BASE_STAT, dex: BASE_STAT, con: BASE_STAT, int: BASE_STAT, wis: BASE_STAT, cha: BASE_STAT },
  pointsRemaining: TOTAL_POINTS,
  appearance: {
    hairColor: 'brown',
    skinTone: 'fair',
    eyeColor: 'brown',
    hairStyle: 'short',
    build: 'average',
  },
  skills: [],
  selectedSkillIds: new Set(),
  equipment: {
    head: null, chest: null, pants: null, boots: null,
    rightHand: null, leftHand: null,
    accessory1: null, accessory2: null, accessory3: null,
  },
});

function calculatePointsRemaining(stats) {
  const totalSpent = Object.values(stats).reduce((sum, val) => sum + (val - BASE_STAT), 0);
  return TOTAL_POINTS - totalSpent;
}

function getEquippedBonuses(equipment) {
  const bonuses = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
  const SLOT_ORDER = ['head', 'chest', 'pants', 'boots', 'rightHand', 'leftHand', 'accessory1', 'accessory2', 'accessory3'];
  SLOT_ORDER.forEach(slot => {
    const item = equipment[slot];
    if (item && item.statBonuses) {
      Object.entries(item.statBonuses).forEach(([stat, val]) => {
        bonuses[stat] = (bonuses[stat] || 0) + val;
      });
    }
  });
  return bonuses;
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_NAME':
      return { ...state, name: action.payload };

    case 'SET_CLASS': {
      const cls = CLASSES.find(c => c.id === action.payload);
      if (!cls) return state;
      const newStats = { ...state.stats };
      STATS.forEach(stat => {
        newStats[stat.id] = BASE_STAT;
      });
      const points = calculatePointsRemaining(newStats);
      return {
        ...state,
        class: cls,
        stats: newStats,
        pointsRemaining: points,
        selectedSkillIds: new Set(cls.startingSkills),
      };
    }

    case 'SET_RACE': {
      const race = RACES.find(r => r.id === action.payload);
      if (!race) return state;
      return { ...state, race };
    }

    case 'INCREMENT_STAT': {
      const statId = action.payload;
      const currentStat = state.stats[statId];
      if (currentStat >= MAX_STAT) return state;
      if (state.pointsRemaining <= 0) return state;
      const newStats = { ...state.stats, [statId]: currentStat + 1 };
      return {
        ...state,
        stats: newStats,
        pointsRemaining: calculatePointsRemaining(newStats),
      };
    }

    case 'DECREMENT_STAT': {
      const statId = action.payload;
      const currentStat = state.stats[statId];
      if (currentStat <= BASE_STAT) return state;
      const newStats = { ...state.stats, [statId]: currentStat - 1 };
      return {
        ...state,
        stats: newStats,
        pointsRemaining: calculatePointsRemaining(newStats),
      };
    }

    case 'SET_APPEARANCE':
      return {
        ...state,
        appearance: { ...state.appearance, [action.payload.key]: action.payload.value },
      };

    case 'TOGGLE_SKILL': {
      const skillId = action.payload;
      const newSet = new Set(state.selectedSkillIds);
      if (newSet.has(skillId)) {
        newSet.delete(skillId);
      } else {
        newSet.add(skillId);
      }
      return { ...state, selectedSkillIds: newSet };
    }

    case 'EQUIP_ITEM': {
      const { slot, item } = action.payload;
      const newEquipment = { ...state.equipment };
      newEquipment[slot] = item;
      return { ...state, equipment: newEquipment };
    }

    case 'UNEQUIP_ITEM': {
      const slot = action.payload;
      const newEquipment = { ...state.equipment };
      newEquipment[slot] = null;
      return { ...state, equipment: newEquipment };
    }

    case 'LOAD_CHARACTER': {
      const loadedEquipment = action.payload.equipment || createInitialState().equipment;
      return {
        ...createInitialState(),
        ...action.payload,
        equipment: loadedEquipment,
        selectedSkillIds: new Set(action.payload.selectedSkillIds || []),
      };
    }

    case 'RESET':
      return createInitialState();

    default:
      return state;
  }
}

describe('CharacterContext reducer', () => {
  let state;

  beforeEach(() => {
    state = createInitialState();
  });

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
  });

  describe('SET_CLASS', () => {
    it('should set the class and reset stats to base values', () => {
      const spentState = {
        ...state,
        stats: { str: 12, dex: 10, con: 8, int: 8, wis: 8, cha: 8 },
        pointsRemaining: 21,
      };
      const newState = reducer(spentState, { type: 'SET_CLASS', payload: 'warrior' });
      expect(newState.class.id).toBe('warrior');
      expect(newState.stats.str).toBe(BASE_STAT);
      expect(newState.stats.dex).toBe(BASE_STAT);
      expect(newState.pointsRemaining).toBe(TOTAL_POINTS);
    });

    it('should set starting skills for the class', () => {
      const newState = reducer(state, { type: 'SET_CLASS', payload: 'warrior' });
      expect(newState.selectedSkillIds.has('swordsmanship')).toBe(true);
      expect(newState.selectedSkillIds.has('shield_bash')).toBe(true);
      expect(newState.selectedSkillIds.has('war_cry')).toBe(true);
    });

    it('should set starting skills for mage', () => {
      const newState = reducer(state, { type: 'SET_CLASS', payload: 'mage' });
      expect(newState.selectedSkillIds.has('fireball')).toBe(true);
      expect(newState.selectedSkillIds.has('ice_storm')).toBe(true);
      expect(newState.selectedSkillIds.has('arcane_bolt')).toBe(true);
    });

    it('should set starting skills for rogue', () => {
      const newState = reducer(state, { type: 'SET_CLASS', payload: 'rogue' });
      expect(newState.selectedSkillIds.has('sneak_attack')).toBe(true);
      expect(newState.selectedSkillIds.has('stealth')).toBe(true);
      expect(newState.selectedSkillIds.has('lockpicking')).toBe(true);
    });

    it('should not change state for unknown class', () => {
      const before = { ...state };
      const newState = reducer(state, { type: 'SET_CLASS', payload: 'unknown' });
      expect(newState).toBe(state);
    });
  });

  describe('SET_RACE', () => {
    it('should set the race', () => {
      const newState = reducer(state, { type: 'SET_RACE', payload: 'elf' });
      expect(newState.race.id).toBe('elf');
    });

    it('should not change state for unknown race', () => {
      const before = { ...state };
      const newState = reducer(state, { type: 'SET_RACE', payload: 'unknown' });
      expect(newState).toBe(state);
    });
  });

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
      expect(s.stats.str).toBe(MAX_STAT);
      const noChange = reducer(s, { type: 'INCREMENT_STAT', payload: 'str' });
      expect(noChange.stats.str).toBe(MAX_STAT);
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
      expect(noChange.stats.str).toBe(BASE_STAT);
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
  });

  describe('UNEQUIP_ITEM', () => {
    it('should remove the item from the specified slot', () => {
      const item = { id: 'iron_helm', name: 'Iron Helm', slot: 'head', type: 'armor', rarity: 'uncommon', statBonuses: { str: 1, con: 2 }, svgPaths: [] };
      let s = reducer(state, { type: 'EQUIP_ITEM', payload: { slot: 'head', item } });
      s = reducer(s, { type: 'UNEQUIP_ITEM', payload: 'head' });
      expect(s.equipment.head).toBeNull();
    });
  });

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
      };
      const newState = reducer(state, { type: 'LOAD_CHARACTER', payload: saved });
      expect(newState.name).toBe('Thorin');
      expect(newState.class.id).toBe('warrior');
      expect(newState.race.id).toBe('dwarf');
      expect(newState.stats.str).toBe(12);
      expect(newState.pointsRemaining).toBe(13);
    });

    it('should convert array selectedSkillIds to Set', () => {
      const saved = { name: 'Test', class: null, race: null, stats: {}, pointsRemaining: 27, appearance: {}, selectedSkillIds: ['fireball'], equipment: {} };
      const newState = reducer(state, { type: 'LOAD_CHARACTER', payload: saved });
      expect(newState.selectedSkillIds).toBeInstanceOf(Set);
      expect(newState.selectedSkillIds.has('fireball')).toBe(true);
    });

    it('should handle missing equipment', () => {
      const saved = { name: 'Test', class: null, race: null, stats: {}, pointsRemaining: 27, appearance: {}, selectedSkillIds: [] };
      const newState = reducer(state, { type: 'LOAD_CHARACTER', payload: saved });
      expect(newState.equipment.head).toBeNull();
    });
  });

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
      expect(newState.stats.str).toBe(BASE_STAT);
      expect(newState.pointsRemaining).toBe(TOTAL_POINTS);
      expect(newState.appearance.hairColor).toBe('brown');
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
});
