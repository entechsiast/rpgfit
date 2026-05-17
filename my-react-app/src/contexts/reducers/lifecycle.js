/**
 * Lifecycle sub-reducer
 *
 * Handles lifecycle-related state transitions:
 * - SET_CURRENT_DUNGEON — select current dungeon
 * - LOAD_CHARACTER — restore character from saved state
 * - RESET — restore to initial state
 * - TOGGLE_ANIMATION — toggle animation preference
 *
 * Extracted from CharacterContext.jsx as part of splitting the monolithic
 * reducer into domain-specific sub-reducers (issue #181).
 */

import { initialState } from '../initialState';
import { SLOT_ORDER } from '../../data/equipment';
import { BASE_STAT, TOTAL_POINTS } from '../../data/stats';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function createEmptyEquipment() {
  const eq = {};
  SLOT_ORDER.forEach(slot => { eq[slot] = null; });
  return eq;
}

function getInitialAppearance() {
  return {
    hairColor: 'brown',
    skinTone: 'fair',
    eyeColor: 'brown',
    hairStyle: 'short',
    build: 'average',
  };
}

function getDefaultStats() {
  return { str: BASE_STAT, dex: BASE_STAT, con: BASE_STAT, int: BASE_STAT, wis: BASE_STAT, cha: BASE_STAT };
}

function getDefaultBuffs() {
  return { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
}

// ─── Named case handlers ───────────────────────────────────────────────────────

/**
 * Set the current dungeon being explored.
 */
export function setCurrentDungeon(state, action) {
  return { ...state, currentDungeon: action.payload };
}

/**
 * Load a character from saved state. Merges loaded data with initial state.
 */
/* eslint-disable-next-line complexity */
export function loadCharacter(state, action) {
  const payload = action.payload;
  const loadedEquipment = payload.equipment || createEmptyEquipment();
  const hpMp = getHpMpFromPayload(payload);
  return {
    name: payload.name || '',
    class: payload.class || null,
    race: payload.race || null,
    stats: payload.stats || getDefaultStats(),
    pointsRemaining: payload.pointsRemaining || TOTAL_POINTS,
    appearance: payload.appearance || getInitialAppearance(),
    skills: payload.skills || [],
    selectedSkillIds: new Set(payload.selectedSkillIds || []),
    equipment: loadedEquipment,
    ownedEquipment: payload.ownedEquipment || [],
    level: payload.level || 1,
    xp: payload.xp || 0,
    gold: payload.gold || 0,
    ...hpMp,
    combatLog: payload.combatLog || [],
    completedDungeons: payload.completedDungeons || [],
    statPointsToSpend: payload.statPointsToSpend || 0,
    consumables: payload.consumables || {},
    temporaryBuffs: getDefaultBuffs(),
    sessions: payload.sessions || [],
    currentFloor: payload.currentFloor || 1,
    currentFloorProgress: payload.currentFloorProgress || 0,
    rewardStreak: payload.rewardStreak || 0,
    todayRewardCount: payload.todayRewardCount || 0,
    lastRewardDate: payload.lastRewardDate || null,
    rewardLog: payload.rewardLog || [],
    animationEnabled: payload.animationEnabled !== undefined ? payload.animationEnabled : true,
  };
}

function getHpMpFromPayload(payload) {
  if (payload.maxHP) {
    return {
      maxHP: payload.maxHP,
      currentHP: payload.currentHP || payload.maxHP,
      maxMP: payload.maxMP,
      currentMP: payload.currentMP || payload.maxMP,
    };
  }
  return { maxHP: 10, currentHP: 10, maxMP: 5, currentMP: 5 };
}

/**
 * Reset all state to initial values.
 * Uses JSON parse/stringify for deep clone (structuredClone not available in all environments).
 */
export function resetState(_state) {
  return JSON.parse(JSON.stringify(initialState));
}

/**
 * Toggle animation preference.
 */
export function toggleAnimation(state, action) {
  return { ...state, animationEnabled: action.payload };
}

// ─── Sub-reducer ───────────────────────────────────────────────────────────────

const lifecycleCaseMap = {
  SET_CURRENT_DUNGEON: setCurrentDungeon,
  LOAD_CHARACTER: loadCharacter,
  RESET: resetState,
  TOGGLE_ANIMATION: toggleAnimation,
};

export function lifecycleReducer(state, action) {
  const handler = lifecycleCaseMap[action.type];
  if (handler) return handler(state, action);
  return state;
}

export function isLifecycleAction(type) {
  return type in lifecycleCaseMap;
}
