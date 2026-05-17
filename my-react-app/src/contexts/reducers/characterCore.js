import { getClassById } from '../../data/classes';
import { getRaceById } from '../../data/races';
import { getStartingEquipment, SLOT_ORDER } from '../../data/equipment';
import { STATS, BASE_STAT, MAX_STAT, TOTAL_POINTS } from '../../data/stats';
import { calculateMaxHp, calculateMaxMp } from '../../data/combat';

// ÔöÇÔöÇÔöÇ Helpers ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ

function createEmptyEquipment() {
  const eq = {};
  SLOT_ORDER.forEach(slot => { eq[slot] = null; });
  return eq;
}

function calculatePointsRemaining(stats) {
  const totalSpent = Object.values(stats).reduce((sum, val) => sum + (val - BASE_STAT), 0);
  return TOTAL_POINTS - totalSpent;
}

export function getEquippedBonuses(equipment) {
  const bonuses = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
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

function recalcHPAndMP(state) {
  if (!state.class) return { maxHP: 10, currentHP: state.currentHP, maxMP: 5, currentMP: state.currentMP };
  const equippedBonuses = getEquippedBonuses(state.equipment);
  const effectiveCon = state.stats.con + equippedBonuses.con;
  const effectiveInt = state.stats.int + equippedBonuses.int;
  const effectiveWis = state.stats.wis + equippedBonuses.wis;
  const newMaxHP = calculateMaxHp(state.class.id, effectiveCon, state.level);
  const newMaxMP = calculateMaxMp(effectiveInt, effectiveWis, state.level);
  return {
    maxHP: newMaxHP,
    currentHP: Math.min(state.currentHP, newMaxHP),
    maxMP: newMaxMP,
    currentMP: Math.min(state.currentMP, newMaxMP),
  };
}

// ÔöÇÔöÇÔöÇ Named case handlers ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ

export function setName(state, action) {
  return { ...state, name: action.payload };
}

export function setClass(state, action) {
  const cls = getClassById(action.payload);
  if (!cls) return state;
  const newStats = { ...state.stats };
  STATS.forEach(stat => { newStats[stat.id] = BASE_STAT; });
  const points = calculatePointsRemaining(newStats);
  const hpMp = {
    maxHP: calculateMaxHp(cls.id, BASE_STAT, 1),
    currentHP: calculateMaxHp(cls.id, BASE_STAT, 1),
    maxMP: calculateMaxMp(BASE_STAT, BASE_STAT, 1),
    currentMP: calculateMaxMp(BASE_STAT, BASE_STAT, 1),
  };
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

export function setRace(state, action) {
  const race = getRaceById(action.payload);
  if (!race) return state;
  return { ...state, race };
}

export function incrementStat(state, action) {
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

export function decrementStat(state, action) {
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

export function setAppearance(state, action) {
  return {
    ...state,
    appearance: { ...state.appearance, [action.payload.key]: action.payload.value },
  };
}

export function toggleSkill(state, action) {
  const skillId = action.payload;
  const newSet = new Set(state.selectedSkillIds);
  if (newSet.has(skillId)) newSet.delete(skillId);
  else newSet.add(skillId);
  return { ...state, selectedSkillIds: newSet };
}

export function distributeStat(state, action) {
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

// ÔöÇÔöÇÔöÇ Sub-reducer ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ

const coreCaseMap = {
  SET_NAME: setName,
  SET_CLASS: setClass,
  SET_RACE: setRace,
  INCREMENT_STAT: incrementStat,
  DECREMENT_STAT: decrementStat,
  SET_APPEARANCE: setAppearance,
  TOGGLE_SKILL: toggleSkill,
  DISTRIBUTE_STAT: distributeStat,
};

export function characterCoreReducer(state, action) {
  const handler = coreCaseMap[action.type];
  if (handler) return handler(state, action);
  return state;
}
