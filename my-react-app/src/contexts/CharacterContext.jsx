/* eslint-disable max-lines */
import React, { createContext, useContext, useReducer, useMemo } from 'react';
import { BASE_STAT, TOTAL_POINTS } from '../data/stats';
import { getDungeonsForLevel } from '../data/dungeons';
import { getXpProgress } from '../data/xp';
import { combinedReducer, characterCoreReducer, combatReducer, equipmentReducer, progressionReducer, inventoryReducer, lifecycleReducer } from './reducers';

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

// Use the combined reducer that dispatches to domain-specific sub-reducers
const reducer = combinedReducer;

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
