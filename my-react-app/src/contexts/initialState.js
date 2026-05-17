/**
 * Initial state for CharacterContext.
 *
 * Centralized to avoid duplication between CharacterContext.jsx (useReducer)
 * and lifecycle.js (resetState). Both import from here.
 */

import { BASE_STAT, TOTAL_POINTS } from '../data/stats';
import { SLOT_ORDER } from '../data/equipment';

export const createEmptyEquipment = () => {
  const eq = {};
  SLOT_ORDER.forEach(slot => { eq[slot] = null; });
  return eq;
};

export const initialState = {
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
