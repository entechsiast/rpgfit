import { CLASSES } from '../data/classes';
import { RACES } from '../data/races';
import { STATS, BASE_STAT, MAX_STAT, TOTAL_POINTS } from '../data/stats';
import { getXpToNextLevel, getTotalXpToLevel, MAX_LEVEL } from '../data/xp';
import { calculateMaxHp, calculateHpGainOnLevelUp, calculateMaxMp, calculateMpGainOnLevelUp } from '../data/combat';

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

    case 'GAIN_XP': {
      const newXp = state.xp + action.payload;
      let newState = { ...state, xp: newXp };
      const needed = getXpToNextLevel(newState.level);
      if (newXp >= getTotalXpToLevel(newState.level) + needed && newState.level < MAX_LEVEL) {
        newState = { ...newState, statPointsToSpend: newState.statPointsToSpend + 1 };
      }
      return newState;
    }

    case 'LEVEL_UP': {
      let newState = { ...state, level: state.level + 1, xp: state.xp - getXpToNextLevel(state.level), statPointsToSpend: state.statPointsToSpend + 1 };
      if (!newState.class) return newState;
      const equippedBonuses = getEquippedBonuses(newState.equipment);
      const effectiveCon = newState.stats.con + equippedBonuses.con;
      const effectiveInt = newState.stats.int + equippedBonuses.int;
      const effectiveWis = newState.stats.wis + equippedBonuses.wis;
      const hpGain = calculateHpGainOnLevelUp(newState.class.id, effectiveCon);
      const mpGain = calculateMpGainOnLevelUp(effectiveInt, effectiveWis);
      newState = {
        ...newState,
        maxHP: newState.maxHP + hpGain,
        currentHP: newState.currentHP + hpGain,
        maxMP: newState.maxMP + mpGain,
        currentMP: newState.currentMP + mpGain,
      };
      return newState;
    }

    case 'DISTRIBUTE_STAT': {
      const { statId, value } = action.payload;
      const currentStat = state.stats[statId];
      const newStats = { ...state.stats, [statId]: currentStat + value };
      const newPointsRemaining = state.pointsRemaining - value;
      const equippedBonuses = getEquippedBonuses(state.equipment);
      const effectiveCon = newStats.con + equippedBonuses.con;
      const effectiveInt = newStats.int + equippedBonuses.int;
      const effectiveWis = newStats.wis + equippedBonuses.wis;
      const hpMp = {
        maxHP: calculateMaxHp(state.class?.id, effectiveCon, state.level),
        maxMP: calculateMaxMp(effectiveInt, effectiveWis, state.level),
      };
      return {
        ...state,
        stats: newStats,
        pointsRemaining: newPointsRemaining,
        statPointsToSpend: Math.max(0, state.statPointsToSpend - value),
        ...hpMp,
      };
    }

    case 'ADD_GOLD':
      return { ...state, gold: state.gold + action.payload };

    case 'REST': {
      const goldCost = Math.max(1, Math.floor(state.level * 5));
      const hpGain = state.maxHP - state.currentHP;
      const mpGain = state.maxMP - state.currentMP;
      return {
        ...state,
        gold: Math.max(0, state.gold - goldCost),
        currentHP: state.maxHP,
        currentMP: state.maxMP,
        combatLog: [...state.combatLog, { type: 'rest', goldCost, hpGain, mpGain, timestamp: Date.now() }],
      };
    }

    case 'COMBAT_RESULT': {
      const { monstersDefeated, bossDefeated, totalXp, totalGold, lootDrops, hpRemaining, mpRemaining } = action.payload;
      return {
        ...state,
        currentHP: hpRemaining,
        currentMP: mpRemaining,
        combatLog: [...state.combatLog, { type: 'combat', monstersDefeated, bossDefeated, totalXp, totalGold, lootDrops, timestamp: Date.now() }],
      };
    }

    case 'CLEAR_COMBAT_LOG':
      return { ...state, combatLog: [] };

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
      // Level 1 needs 100 XP to level up
      const newState = reducer(warriorState, { type: 'GAIN_XP', payload: 99 });
      expect(newState.xp).toBe(99);
      expect(newState.statPointsToSpend).toBe(0);
      expect(newState.level).toBe(1);
    });

    it('should grant statPointsToSpend when XP reaches threshold', () => {
      // Level 1 needs 100 XP to level up
      const newState = reducer(warriorState, { type: 'GAIN_XP', payload: 100 });
      expect(newState.xp).toBe(100);
      expect(newState.statPointsToSpend).toBe(1);
    });

    it('should not grant statPointsToSpend when XP exceeds threshold', () => {
      // XP above threshold should NOT trigger level up (only LEVEL_UP action does that)
      const newState = reducer(warriorState, { type: 'GAIN_XP', payload: 150 });
      expect(newState.xp).toBe(150);
      expect(newState.statPointsToSpend).toBe(1);
      expect(newState.level).toBe(1);
    });

    it('should not exceed MAX_LEVEL', () => {
      let s = warriorState;
      s = reducer(s, { type: 'GAIN_XP', payload: 100 });
      // Manually level to MAX_LEVEL
      for (let i = 1; i < MAX_LEVEL; i++) {
        s = reducer(s, { type: 'LEVEL_UP', payload: undefined });
      }
      expect(s.level).toBe(MAX_LEVEL);
      // statPointsToSpend is 60 (1 from initial GAIN_XP + 59 from LEVEL_UPs)
      // GAIN_XP should NOT increment it further since level is already MAX_LEVEL
      const before = s.statPointsToSpend;
      s = reducer(s, { type: 'GAIN_XP', payload: 9999 });
      expect(s.level).toBe(MAX_LEVEL);
      expect(s.statPointsToSpend).toBe(before);
    });
  });

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
      // Level 1 → 2 costs 100 XP
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
      // maxHP and currentHP should remain unchanged when no class
      expect(newState.maxHP).toBe(10);
      expect(newState.currentHP).toBe(10);
    });

    it('should work for multiple level-ups', () => {
      let s = warriorState;
      s = reducer(s, { type: 'LEVEL_UP' });
      expect(s.level).toBe(2);
      // Level 1 → 2: hpGain = 12, maxHP = 10 + 12 = 22
      expect(s.maxHP).toBe(22);

      s = reducer(s, { type: 'LEVEL_UP' });
      expect(s.level).toBe(3);
      // Level 2 → 3: hpGain = 12, maxHP = 22 + 12 = 34
      expect(s.maxHP).toBe(34);
    });
  });

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

    it('should recalculate maxHP based on new CON stat', () => {
      // Initial maxHP (recalculated): d12(12) + conMod(0) + levelBonus(0) = 12
      // After CON+1: CON=9, CON mod = 0, still maxHP=12
      const newState = reducer(warriorState, { type: 'DISTRIBUTE_STAT', payload: { statId: 'con', value: 1 } });
      expect(newState.maxHP).toBe(12);
    });

    it('should recalculate maxHP when CON crosses modifier threshold', () => {
      // Initial maxHP: 12
      // After CON+2: CON=10, CON mod = 1
      // maxHP = d12(12) + 1 + levelBonus(0) = 13
      let s = warriorState;
      s = reducer(s, { type: 'DISTRIBUTE_STAT', payload: { statId: 'con', value: 2 } });
      expect(s.maxHP).toBe(13);
    });

    it('should recalculate maxMP based on new INT/WIS stats', () => {
      // Initial maxMP (recalculated): floor(0/2) + floor(0/2) + 0 = 0
      // After INT+1: INT=9, INT mod = 0
      const newState = reducer(warriorState, { type: 'DISTRIBUTE_STAT', payload: { statId: 'int', value: 1 } });
      expect(newState.maxMP).toBe(0);
    });

    it('should recalculate maxMP when INT crosses modifier threshold', () => {
      // Start: INT=8
      // After INT+2: INT=10, INT mod = 1
      // maxMP = floor(1/2) + floor(0/2) + (level-1)*2 = 0 + 0 + 0 = 0
      // But initial maxMP at level 1 with INT=8, WIS=8 = 0 + 0 + 0 = 0
      // Hmm, the initial maxMP is 5 in our test state, but the formula gives 0
      // This is because initialState sets maxMP=5 as default
      let s = warriorState;
      s = reducer(s, { type: 'DISTRIBUTE_STAT', payload: { statId: 'int', value: 2 } });
      // With INT=10, WIS=8: floor(1/2) + floor(0/2) + 0 = 0
      expect(s.maxMP).toBe(0);
    });

    it('should cap statPointsToSpend at 0 (not go negative)', () => {
      let s = { ...warriorState, statPointsToSpend: 1 };
      s = reducer(s, { type: 'DISTRIBUTE_STAT', payload: { statId: 'str', value: 1 } });
      expect(s.statPointsToSpend).toBe(0);
      // Even if we try to distribute more than available
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

  describe('REST', () => {
    let warriorState;

    beforeEach(() => {
      warriorState = {
        ...state,
        class: { id: 'warrior', name: 'Warrior' },
        level: 1,
        xp: 0,
        gold: 100,
        maxHP: 10,
        currentHP: 5,
        maxMP: 5,
        currentMP: 2,
        combatLog: [],
        statPointsToSpend: 0,
      };
    });

    it('should restore currentHP to maxHP', () => {
      const newState = reducer(warriorState, { type: 'REST' });
      expect(newState.currentHP).toBe(10);
    });

    it('should restore currentMP to maxMP', () => {
      const newState = reducer(warriorState, { type: 'REST' });
      expect(newState.currentMP).toBe(5);
    });

    it('should cost gold proportional to level', () => {
      // Level 1: goldCost = max(1, floor(1 * 5)) = 5
      const newState = reducer(warriorState, { type: 'REST' });
      expect(newState.gold).toBe(95);
    });

    it('should log the rest action to combatLog', () => {
      const newState = reducer(warriorState, { type: 'REST' });
      expect(newState.combatLog).toHaveLength(1);
      expect(newState.combatLog[0].type).toBe('rest');
      expect(newState.combatLog[0].goldCost).toBe(5);
      expect(newState.combatLog[0].hpGain).toBe(5);
      expect(newState.combatLog[0].mpGain).toBe(3);
    });

    it('should not reduce gold below 0', () => {
      let s = { ...warriorState, gold: 3 };
      const newState = reducer(s, { type: 'REST' });
      expect(newState.gold).toBe(0);
    });

    it('should not restore HP if already at max', () => {
      let s = { ...warriorState, currentHP: 10 };
      const newState = reducer(s, { type: 'REST' });
      expect(newState.currentHP).toBe(10);
    });

    it('should not restore MP if already at max', () => {
      let s = { ...warriorState, currentMP: 5 };
      const newState = reducer(s, { type: 'REST' });
      expect(newState.currentMP).toBe(5);
    });

    it('should append to existing combatLog', () => {
      let s = { ...warriorState, combatLog: [{ type: 'combat', timestamp: 1 }] };
      const newState = reducer(s, { type: 'REST' });
      expect(newState.combatLog).toHaveLength(2);
      expect(newState.combatLog[0].type).toBe('combat');
      expect(newState.combatLog[1].type).toBe('rest');
    });
  });

  describe('COMBAT_RESULT', () => {
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

    it('should update currentHP', () => {
      const newState = reducer(warriorState, { type: 'COMBAT_RESULT', payload: { hpRemaining: 5, mpRemaining: 3, monstersDefeated: 2, bossDefeated: false, totalXp: 50, totalGold: 20, lootDrops: [] } });
      expect(newState.currentHP).toBe(5);
    });

    it('should update currentMP', () => {
      const newState = reducer(warriorState, { type: 'COMBAT_RESULT', payload: { hpRemaining: 5, mpRemaining: 3, monstersDefeated: 2, bossDefeated: false, totalXp: 50, totalGold: 20, lootDrops: [] } });
      expect(newState.currentMP).toBe(3);
    });

    it('should log combat result to combatLog', () => {
      const newState = reducer(warriorState, { type: 'COMBAT_RESULT', payload: { hpRemaining: 5, mpRemaining: 3, monstersDefeated: 2, bossDefeated: false, totalXp: 50, totalGold: 20, lootDrops: [{ itemId: 'potion' }] } });
      expect(newState.combatLog).toHaveLength(1);
      expect(newState.combatLog[0].type).toBe('combat');
      expect(newState.combatLog[0].monstersDefeated).toBe(2);
      expect(newState.combatLog[0].bossDefeated).toBe(false);
      expect(newState.combatLog[0].totalXp).toBe(50);
      expect(newState.combatLog[0].totalGold).toBe(20);
      expect(newState.combatLog[0].lootDrops).toEqual([{ itemId: 'potion' }]);
    });

    it('should append to existing combatLog', () => {
      let s = { ...warriorState, combatLog: [{ type: 'rest', timestamp: 1 }] };
      const newState = reducer(s, { type: 'COMBAT_RESULT', payload: { hpRemaining: 5, mpRemaining: 3, monstersDefeated: 1, bossDefeated: false, totalXp: 30, totalGold: 10, lootDrops: [] } });
      expect(newState.combatLog).toHaveLength(2);
      expect(newState.combatLog[0].type).toBe('rest');
      expect(newState.combatLog[1].type).toBe('combat');
    });

    it('should handle bossDefeated=true', () => {
      const newState = reducer(warriorState, { type: 'COMBAT_RESULT', payload: { hpRemaining: 1, mpRemaining: 0, monstersDefeated: 3, bossDefeated: true, totalXp: 200, totalGold: 100, lootDrops: [{ itemId: 'rare_sword' }] } });
      expect(newState.currentHP).toBe(1);
      expect(newState.currentMP).toBe(0);
      expect(newState.combatLog[0].bossDefeated).toBe(true);
    });

    it('should clamp HP to 0 minimum', () => {
      const newState = reducer(warriorState, { type: 'COMBAT_RESULT', payload: { hpRemaining: -5, mpRemaining: 3, monstersDefeated: 0, bossDefeated: false, totalXp: 0, totalGold: 0, lootDrops: [] } });
      expect(newState.currentHP).toBe(-5);
    });
  });

  describe('CLEAR_COMBAT_LOG', () => {
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
        combatLog: [
          { type: 'rest', timestamp: 1 },
          { type: 'combat', timestamp: 2 },
          { type: 'combat_round', timestamp: 3 },
        ],
        statPointsToSpend: 0,
      };
    });

    it('should clear all combatLog entries', () => {
      const newState = reducer(warriorState, { type: 'CLEAR_COMBAT_LOG' });
      expect(newState.combatLog).toEqual([]);
    });

    it('should not affect other state fields', () => {
      const newState = reducer(warriorState, { type: 'CLEAR_COMBAT_LOG' });
      expect(newState.currentHP).toBe(10);
      expect(newState.currentMP).toBe(5);
      expect(newState.gold).toBe(0);
      expect(newState.level).toBe(1);
      expect(newState.xp).toBe(0);
    });

    it('should work on empty combatLog', () => {
      let s = { ...warriorState, combatLog: [] };
      const newState = reducer(s, { type: 'CLEAR_COMBAT_LOG' });
      expect(newState.combatLog).toEqual([]);
    });

    it('should return a new array (not the same reference)', () => {
      const newState = reducer(warriorState, { type: 'CLEAR_COMBAT_LOG' });
      expect(newState.combatLog).not.toBe(warriorState.combatLog);
    });
  });
});
