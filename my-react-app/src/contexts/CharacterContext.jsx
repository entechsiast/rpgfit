/* eslint-disable max-lines */
import React, { createContext, useContext, useReducer, useMemo } from 'react';
import { BASE_STAT, TOTAL_POINTS } from '../data/stats';
import { getDungeonsForLevel } from '../data/dungeons';
import { getXpProgress } from '../data/xp';
import { CONSUMABLES } from '../data/consumables';
import { getStartingEquipment, SLOT_ORDER } from '../data/equipment';
import { recalcHPAndMP } from './reducers/hpMpRecalc';
import { combatReducer, isCombatAction } from './reducers/combat';
import { progressionReducer, isProgressionAction } from './reducers/progression';
import { equipmentReducer, isEquipmentAction } from './reducers/equipment';
import { inventoryReducer, isInventoryAction } from './reducers/inventory';

const createEmptyEquipment = () => {
  const eq = {};
  const SLOT_ORDER = ['head', 'chest', 'pants', 'boots', 'rightHand', 'leftHand', 'accessory1', 'accessory2', 'accessory3'];
  SLOT_ORDER.forEach(slot => { eq[slot] = null; });
  return eq;
};

const initialState = {
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
  equipment: createEmptyEquipment(),
  ownedEquipment: [],
  level: 1,
  xp: 0,
  gold: 0,
  maxHP: 10,
  currentHP: 10,
  maxMP: 5,
  currentMP: 5,
  combatLog: [],
  completedDungeons: [],
  statPointsToSpend: 0,
  consumables: {},
  temporaryBuffs: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
  sessions: [],
  currentFloor: 1,
  currentFloorProgress: 0,
  rewardStreak: 0,
  todayRewardCount: 0,
  lastRewardDate: null,
  rewardLog: [],
  animationEnabled: true,
};

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

function getTemporaryBuffs(state) {
  return state.temporaryBuffs || { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
}

function getAllBonuses(state) {
  const equipped = getEquippedBonuses(state.equipment);
  const buffs = getTemporaryBuffs(state);
  const result = { ...equipped };
  Object.keys(buffs).forEach(stat => {
    result[stat] = (equipped[stat] || 0) + (buffs[stat] || 0);
  });
  return result;
}

/* eslint-disable-next-line complexity */
function reducer(state, action) {
  // Dispatch combat actions to the combat sub-reducer
  if (isCombatAction(action.type)) return combatReducer(state, action);

  // Dispatch progression actions to the progression sub-reducer
  if (isProgressionAction(action.type)) return progressionReducer(state, action);

  // Dispatch equipment actions to the equipment sub-reducer
  if (isEquipmentAction(action.type)) return equipmentReducer(state, action);

  // Dispatch inventory actions to the inventory sub-reducer
  if (isInventoryAction(action.type)) return inventoryReducer(state, action);

  switch (action.type) {
    case 'SET_NAME':
      return { ...state, name: action.payload };

    case 'SET_CLASS': {
      const cls = getClassById(action.payload);
      if (!cls) return state;
      const newStats = { ...state.stats };
      STATS.forEach(stat => { newStats[stat.id] = BASE_STAT; });
      const points = calculatePointsRemaining(newStats);
      // Use recalcHPAndMP with a temporary state for initial HP/MP values
      const tempState = { ...state, class: cls, stats: newStats, level: 1, equipment: createEmptyEquipment() };
      const hpMp = recalcHPAndMP(tempState);
      const startingEq = getStartingEquipment(cls.id) || createEmptyEquipment();
      const ownedStartingEq = Object.values(startingEq).filter(Boolean);
      return {
        ...state,
        class: cls,
        stats: newStats,
        pointsRemaining: points,
        selectedSkillIds: new Set(cls.startingSkills),
        equipment: startingEq,
        ownedEquipment: ownedStartingEq,
        ...hpMp,
      };
    }

    case 'SET_RACE': {
      const race = getRaceById(action.payload);
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
        ...recalcHPAndMP({ ...state, stats: newStats }),
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
        ...recalcHPAndMP({ ...state, stats: newStats }),
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
      if (newSet.has(skillId)) newSet.delete(skillId);
      else newSet.add(skillId);
      return { ...state, selectedSkillIds: newSet };
    }

    case 'EQUIP_ITEM': {
      const { slot, item } = action.payload;
      const newEquipment = { ...state.equipment };
      newEquipment[slot] = item;
      // Remove from ownedEquipment when equipping
      const newOwned = state.ownedEquipment?.filter(id => id !== item.id) || [];
      const hpMp = recalcHPAndMP({ ...state, equipment: newEquipment });
      return {
        ...state,
        equipment: newEquipment,
        ownedEquipment: newOwned,
        currentHP: Math.min(state.currentHP, hpMp.maxHP),
        currentMP: Math.min(state.currentMP, hpMp.maxMP),
        ...hpMp,
      };
    }

    case 'UNEQUIP_ITEM': {
      const slot = action.payload;
      const item = state.equipment[slot];
      const newEquipment = { ...state.equipment };
      newEquipment[slot] = null;
      // Add unequipped item to ownedEquipment (no duplicates)
      let newOwned = [...(state.ownedEquipment || [])];
      if (item && !newOwned.includes(item.id)) {
        newOwned.push(item.id);
      }
      const hpMp = recalcHPAndMP({ ...state, equipment: newEquipment });
      return {
        ...state,
        equipment: newEquipment,
        ownedEquipment: newOwned,
        currentHP: Math.min(state.currentHP, hpMp.maxHP),
        currentMP: Math.min(state.currentMP, hpMp.maxMP),
        ...hpMp,
      };
    }

    case 'DISTRIBUTE_STAT': {
      const { statId, value } = action.payload;
      const currentStat = state.stats[statId];
      const newStats = { ...state.stats, [statId]: currentStat + value };
      const newPointsRemaining = state.pointsRemaining - value;
      const hpMp = recalcHPAndMP({ ...state, stats: newStats });
      return {
        ...state,
        stats: newStats,
        pointsRemaining: newPointsRemaining,
        statPointsToSpend: Math.max(0, state.statPointsToSpend - value),
        ...hpMp,
      };
    }

    case 'BUY_ITEM': {
      const { itemId, quantity = 1 } = action.payload;
      const item = CONSUMABLES.find(c => c.id === itemId);
      if (!item) return state;
      const cost = item.price * quantity;
      if (state.gold < cost) return state;

      let newState = {
        ...state,
        gold: state.gold - cost,
        consumables: { ...state.consumables, [itemId]: (state.consumables?.[itemId] || 0) + quantity },
      };
      return { ...newState, combatLog: [...newState.combatLog, { type: 'purchase', itemId: item.name, cost, timestamp: Date.now() }] };
    }

    case 'CLEAR_BUFFS':
      return { ...state, temporaryBuffs: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 } };

    case 'SET_CURRENT_DUNGEON':
      return { ...state, currentDungeon: action.payload };

    case 'LOAD_CHARACTER': {
      const loadedEquipment = action.payload.equipment || createEmptyEquipment();
      const hpMp = action.payload.maxHP ? { maxHP: action.payload.maxHP, currentHP: action.payload.currentHP || action.payload.maxHP, maxMP: action.payload.maxMP, currentMP: action.payload.currentMP || action.payload.maxMP } : { maxHP: 10, currentHP: 10, maxMP: 5, currentMP: 5 };
      return {
        ...initialState,
        ...action.payload,
        equipment: loadedEquipment,
        ownedEquipment: action.payload.ownedEquipment || [],
        selectedSkillIds: new Set(action.payload.selectedSkillIds || []),
        ...hpMp,
        completedDungeons: action.payload.completedDungeons || [],
        statPointsToSpend: action.payload.statPointsToSpend || 0,
        consumables: action.payload.consumables || {},
        temporaryBuffs: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
        sessions: action.payload.sessions || [],
        currentFloor: action.payload.currentFloor || 1,
        currentFloorProgress: action.payload.currentFloorProgress || 0,
        rewardStreak: action.payload.rewardStreak || 0,
        todayRewardCount: action.payload.todayRewardCount || 0,
        lastRewardDate: action.payload.lastRewardDate || null,
        rewardLog: action.payload.rewardLog || [],
      };
    }

    case 'RESET':
      return { ...initialState };

    case 'TOGGLE_ANIMATION':
      return { ...state, animationEnabled: action.payload };

    default:
      return equipmentReducer(state, action) || combatReducer(state, action) || state;
  }
}

const CharacterContext = createContext(() => {
  throw new Error('useCharacter must be used within a CharacterProvider');
});
const CharacterDispatchContext = createContext(() => {
  throw new Error('useCharacterDispatch must be used within a CharacterProvider');
});

export function CharacterProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const equippedBonuses = getEquippedBonuses(state.equipment);
  const allBonuses = getAllBonuses(state);

  const value = useMemo(() => ({ ...state, equippedBonuses, allBonuses }), [state, equippedBonuses, allBonuses]);

  return (
    <CharacterContext.Provider value={value}>
      <CharacterDispatchContext.Provider value={dispatch}>
        {children}
      </CharacterDispatchContext.Provider>
    </CharacterContext.Provider>
  );
}

export function useCharacter() {
  return useContext(CharacterContext);
}

export function useCharacterDispatch() {
  return useContext(CharacterDispatchContext);
}

export { getXpProgress, getDungeonsForLevel };

// Exported for testing
export { reducer, initialState, getEquippedBonuses, getAllBonuses, createEmptyEquipment };

// Export sub-reducers for testing
export { characterCoreReducer, combatReducer, equipmentReducer, progressionReducer, inventoryReducer, lifecycleReducer };

export { recalcHPAndMP } from './reducers/hpMpRecalc';
