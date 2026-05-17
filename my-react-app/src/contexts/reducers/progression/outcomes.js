/**
 * Floor completion result builders.
 *
 * Extracted from progression.js (issue #234).
 * Handles the two possible outcomes of completeFloor:
 * - Floor advancement (with milestone reward)
 * - No advancement (guaranteed + bonus rewards only)
 */

import { applyFloorAdvance, buildFloorAdvanceLog } from './floors';

// ─── Floor Advancement Outcome ────────────────────────────────────────────────

/**
 * Build the state slice for when a floor advancement occurs.
 */
export function buildFloorAdvanceResult(state, { newSessions, newProgress: _newProgress, rewardGold, newStreak, newTodayCount, newLastDate, bonusItem, gotBonus }) {
  const result = applyFloorAdvance(state, bonusItem);
  const timestamp = result.timestamp;

  const newRewardLog = [...result.newRewardLog];
  newRewardLog.push({ type: 'guaranteed', gold: rewardGold, date: new Date().toDateString(), timestamp });
  if (gotBonus) newRewardLog.push({ type: 'bonus', ...bonusItem, timestamp });

  return {
    sessions: newSessions,
    currentFloor: result.nextFloor,
    currentFloorProgress: 0,
    gold: state.gold + result.goldReward + rewardGold,
    ownedEquipment: result.newOwned,
    rewardStreak: newStreak,
    todayRewardCount: newTodayCount,
    lastRewardDate: newLastDate,
    rewardLog: newRewardLog,
    combatLog: [
      ...(state.combatLog || []),
      buildFloorAdvanceLog(state, result),
    ],
  };
}

// ─── No Advancement Outcome ───────────────────────────────────────────────────

/**
 * Build the state slice for when no floor advancement occurs.
 */
export function buildNoAdvanceResult(state, { newSessions, newProgress, rewardGold, newStreak, newTodayCount, newLastDate, bonusItem, gotBonus }) {
  const timestamp = Date.now();
  const newRewardLog = [];
  if (rewardGold > 0) {
    newRewardLog.push({ type: 'guaranteed', gold: rewardGold, date: new Date().toDateString(), timestamp });
  }
  if (gotBonus) {
    newRewardLog.push({ type: 'bonus', ...bonusItem, timestamp });
  }

  return {
    ...state,
    sessions: newSessions,
    currentFloorProgress: newProgress,
    gold: state.gold + rewardGold,
    rewardStreak: newStreak,
    todayRewardCount: newTodayCount,
    lastRewardDate: newLastDate,
    rewardLog: newRewardLog,
  };
}
