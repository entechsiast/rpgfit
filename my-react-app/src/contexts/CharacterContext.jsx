/* eslint-disable max-lines */
import React, { createContext, useContext, useReducer, useMemo } from 'react';
import { getDungeonsForLevel } from '../data/dungeons';
import { getXpProgress } from '../data/xp';
import { combinedReducer, characterCoreReducer, combatReducer, equipmentReducer, progressionReducer, inventoryReducer, lifecycleReducer } from './reducers';
import { getEquippedBonuses } from './reducers/hpMpRecalc';
import { initialState, createEmptyEquipment } from './initialState';

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
export { reducer, getEquippedBonuses, getAllBonuses, initialState, createEmptyEquipment };

// Export sub-reducers for testing
export { characterCoreReducer, combatReducer, equipmentReducer, progressionReducer, inventoryReducer, lifecycleReducer };

export { recalcHPAndMP } from './reducers/hpMpRecalc';
