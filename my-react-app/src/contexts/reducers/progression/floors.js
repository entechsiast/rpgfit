/**
 * Floor advancement helpers for progression.
 *
 * Extracted from progression.js (issue #234).
 * Handles floor progression tracking and milestone reward application.
 */

import { getFloorRequirements, getFloorCelebrationText } from '../../../data/floors';
import { buildMilestoneReward } from './rewards';

// ─── Floor Progression ────────────────────────────────────────────────────────

/**
 * Check whether completing a session triggers floor advancement.
 */
export function checkFloorAdvancement(state) {
  const currentFloor = state.currentFloor || 1;
  const currentProgress = state.currentFloorProgress || 0;
  const floorReq = getFloorRequirements(currentFloor);
  const sessionsNeeded = floorReq.sessionsRequired;
  return currentProgress >= sessionsNeeded;
}

/**
 * Compute the next floor number.
 */
export function getNextFloor(state) {
  return (state.currentFloor || 1) + 1;
}

// ─── Floor Advance Result ─────────────────────────────────────────────────────

/**
 * Apply a floor advancement to state. Returns the new state slice
 * (floor, progress, gold, equipment, reward log, combat log).
 *
 * Deduplicates milestone reward logic shared between completeFloor
 * and advanceFloor (issue #234).
 */
export function applyFloorAdvance(state, bonusItem) {
  const nextFloor = getNextFloor(state);
  const nextFloorReq = getFloorRequirements(nextFloor);
  const timestamp = Date.now();

  const { rareItem, newOwned } = buildMilestoneReward(nextFloor, 500, bonusItem, timestamp);

  const newRewardLog = [];
  newRewardLog.push({
    type: 'milestone',
    gold: 500,
    item: rareItem ? rareItem.id : null,
    itemName: rareItem ? rareItem.name : null,
    floor: nextFloor,
    floorName: nextFloorReq.name,
    celebrationText: getFloorCelebrationText(nextFloor),
    timestamp,
  });

  return {
    nextFloor,
    nextFloorName: nextFloorReq.name,
    celebrationText: getFloorCelebrationText(nextFloor),
    goldReward: 500,
    rareItem,
    newOwned,
    newRewardLog,
    timestamp,
  };
}

// ─── Combat Log ────────────────────────────────────────────────────────────────

/**
 * Build a floor-advanced combat log entry.
 */
export function buildFloorAdvanceLog(state, result) {
  return {
    type: 'floor_advanced',
    fromFloor: state.currentFloor,
    toFloor: result.nextFloor,
    floorName: result.nextFloorName,
    goldReward: result.goldReward,
    timestamp: result.timestamp,
  };
}
