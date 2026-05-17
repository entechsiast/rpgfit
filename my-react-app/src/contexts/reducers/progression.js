/**
 * Progression sub-reducer (orchestrator).
 *
 * Thin layer that delegates to domain-specific helpers:
 * - rewards.js  – daily reward, bonus roll, milestone construction
 * - sessions.js – session creation and logging
 * - floors.js   – floor advancement detection and application
 * - outcomes.js – floor advance / no-advance state builders
 *
 * Extracted from monolithic progression.js (issue #234).
 */

import { getXpToNextLevel, getTotalXpToLevel, MAX_LEVEL } from '../../data/xp';
import { calculateHpGainOnLevelUp, calculateMpGainOnLevelUp } from '../../data/combat';
import { getEquippedBonuses } from './progression/helpers';
import { processDailyReward, rollBonusReward } from './progression/rewards';
import { addSession } from './progression/sessions';
import { checkFloorAdvancement } from './progression/floors';
import { applyFloorAdvance, buildFloorAdvanceLog } from './progression/floors';
import { buildFloorAdvanceResult, buildNoAdvanceResult } from './progression/outcomes';

// ─── XP & Leveling (unchanged) ────────────────────────────────────────────────

/**
 * Gain XP for the player. Does not auto-level-up — that requires a separate
 * LEVEL_UP action. Only increments statPointsToSpend when XP crosses the
 * level threshold.
 */
export function gainXp(state, action) {
  const newXp = state.xp + action.payload;
  let newState = { ...state, xp: newXp };
  const needed = getXpToNextLevel(newState.level);
  if (newXp >= getTotalXpToLevel(newState.level) + needed && newState.level < MAX_LEVEL) {
    newState = { ...newState, statPointsToSpend: newState.statPointsToSpend + 1 };
  }
  return newState;
}

/**
 * Level up the player: increment level, refund XP, apply stat gains,
 * recalculate HP/MP based on class and effective stats.
 */
export function levelUp(state) {
  let newState = {
    ...state,
    level: state.level + 1,
    xp: state.xp - getXpToNextLevel(state.level),
    statPointsToSpend: state.statPointsToSpend + 1,
  };

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

// ─── Floor Advance (deduplicated via floors.js) ───────────────────────────────

/**
 * Advance to the next floor. Grants milestone gold and random Uncommon/Rare
 * equipment. This is the manual floor advance path (not session-based).
 */
export function advanceFloor(state) {
  const result = applyFloorAdvance(state, null);
  const _timestamp = result.timestamp;

  return {
    ...state,
    currentFloor: result.nextFloor,
    currentFloorProgress: 0,
    gold: state.gold + result.goldReward,
    ownedEquipment: result.newOwned,
    rewardLog: result.newRewardLog,
    combatLog: [
      ...(state.combatLog || []),
      buildFloorAdvanceLog(state, result),
    ],
  };
}

// ─── Complete Floor (thin orchestrator) ────────────────────────────────────────

/**
 * Complete a floor (session-based progression). Orchestrates:
 * 1. Session logging           → sessions.js
 * 2. Floor advancement check  → floors.js
 * 3. Reward system             → rewards.js
 * 4. Result building           → outcomes.js
 */
export function completeFloor(state, action) {
  const payload = action.payload || {};

  // 1. Log session
  const newSessions = addSession(state.sessions || [], payload);
  const newProgress = (state.currentFloorProgress || 0) + 1;
  const baseGold = Math.max(5, Math.floor(payload.duration * 10));

  // 2. Reward system
  const { rewardGold, newTodayCount, newLastDate } = processDailyReward(state, baseGold);
  const { bonusItem, newStreak, gotBonus } = rollBonusReward(state, baseGold);

  // 3. Decide outcome
  const advancing = checkFloorAdvancement({ ...state, currentFloorProgress: newProgress });
  const context = { newSessions, newProgress, rewardGold, newStreak, newTodayCount, newLastDate, bonusItem, gotBonus };

  return advancing
    ? { ...state, ...buildFloorAdvanceResult(state, context) }
    : { ...state, ...buildNoAdvanceResult(state, context) };
}

// ─── Sub-reducer ───────────────────────────────────────────────────────────────

const progressionCaseMap = {
  ADD_SESSION: completeFloor,
  COMPLETE_FLOOR: completeFloor,
  GAIN_XP: gainXp,
  LEVEL_UP: levelUp,
  ADVANCE_FLOOR: advanceFloor,
};

export function progressionReducer(state, action) {
  const handler = progressionCaseMap[action.type];
  if (handler) return handler(state, action);
  return state;
}

export function isProgressionAction(type) {
  return type in progressionCaseMap;
}
