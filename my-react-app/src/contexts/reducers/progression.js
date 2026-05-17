/**
 * Progression sub-reducer
 *
 * Handles all progression-related state transitions:
 * - GAIN_XP / LEVEL_UP
 * - COMPLETE_FLOOR / ADVANCE_FLOOR
 * - ADD_SESSION (session tracking + reward system)
 *
 * Extracted from CharacterContext.jsx as part of splitting the monolithic
 * reducer into domain-specific sub-reducers (issue #188).
 */

import { getXpToNextLevel, getTotalXpToLevel, MAX_LEVEL } from '../../data/xp';
import { getFloorRequirements, getFloorCelebrationText } from '../../data/floors';
import { getAllItems } from '../../data/equipment';
import { calculateHpGainOnLevelUp, calculateMpGainOnLevelUp } from '../../data/combat';
import { CONSUMABLES } from '../../data/consumables';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getEquippedBonuses(equipment) {
  const bonuses = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
  Object.keys(equipment).forEach(slot => {
    const item = equipment[slot];
    if (item && item.statBonuses) {
      Object.entries(item.statBonuses).forEach(([stat, val]) => {
        bonuses[stat] = (bonuses[stat] || 0) + val;
      });
    }
  });
  return bonuses;
}

/**
 * Process the daily reward system: reset counter for new day, calculate
 * base gold, and apply anti-farming cap.
 */
function processDailyReward(state, baseGold) {
  const today = new Date().toDateString();
  const newTodayCount = (state.lastRewardDate !== today) ? 0 : (state.todayRewardCount || 0);
  const newLastDate = state.lastRewardDate !== today ? today : state.lastRewardDate;
  const rewardGold = newTodayCount < 2 ? baseGold : 0;
  const finalTodayCount = rewardGold > 0 ? newTodayCount + 1 : newTodayCount;
  return { rewardGold, newTodayCount: finalTodayCount, newLastDate };
}

/**
 * Roll for a bonus reward using the pity timer system.
 */
function rollBonusReward(state, baseGold) {
  const streak = state.rewardStreak || 0;
  const bonusChance = Math.min(1, 0.15 + streak * 0.15);
  const gotBonus = Math.random() < bonusChance;
  let bonusItem = null;
  let newStreak = streak + 1;

  if (gotBonus) {
    newStreak = 0;
    const bonusRoll = Math.random();
    if (bonusRoll < 0.4) {
      bonusItem = { bonusType: 'gold', amount: Math.floor(baseGold * (2 + Math.random())) };
    } else if (bonusRoll < 0.7) {
      const equipItems = getAllItems().filter(i => i.rarity === 'common');
      const picked = equipItems[Math.floor(Math.random() * equipItems.length)];
      if (picked) bonusItem = { bonusType: 'equipment', item: picked.id };
    } else {
      const consumable = CONSUMABLES[Math.floor(Math.random() * CONSUMABLES.length)];
      if (consumable) bonusItem = { bonusType: 'consumable', item: consumable.id };
    }
  }
  return { bonusItem, newStreak, gotBonus };
}

/**
 * Build a milestone reward log entry for floor advancement.
 */
function buildMilestoneReward(nextFloor, gold, bonusItem, timestamp) {
  const rareItems = getAllItems().filter(i => i.rarity === 'uncommon' || i.rarity === 'rare');
  const rareItem = rareItems[Math.floor(Math.random() * rareItems.length)];
  const newOwned = [...(bonusItem && bonusItem.bonusType === 'equipment' ? [bonusItem.item] : [])];
  const hasItem = rareItem && rareItem.id && !newOwned.includes(rareItem.id);
  if (hasItem) newOwned.push(rareItem.id);

  const newRewardLog = [];
  newRewardLog.push({
    type: 'milestone',
    gold,
    item: rareItem ? rareItem.id : null,
    itemName: rareItem ? rareItem.name : null,
    floor: nextFloor,
    floorName: getFloorRequirements(nextFloor).name,
    celebrationText: getFloorCelebrationText(nextFloor),
    timestamp,
  });
  return { newOwned, newRewardLog, rareItem };
}

// ─── Named case handlers ───────────────────────────────────────────────────────

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

/**
 * Advance to the next floor. Grants milestone gold and random Uncommon/Rare
 * equipment. This is the manual floor advance path (not session-based).
 */
export function advanceFloor(state) {
  const nextFloor = (state.currentFloor || 1) + 1;
  const nextFloorReq = getFloorRequirements(nextFloor);

  const rareItems = getAllItems().filter(i => i.rarity === 'uncommon' || i.rarity === 'rare');
  const rareItem = rareItems[Math.floor(Math.random() * rareItems.length)];

  let newOwned = [...(state.ownedEquipment || [])];
  if (rareItem && rareItem.id && !newOwned.includes(rareItem.id)) {
    newOwned.push(rareItem.id);
  }

  const timestamp = Date.now();
  const newRewardLog = [...(state.rewardLog || [])];
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
    ...state,
    currentFloor: nextFloor,
    currentFloorProgress: 0,
    gold: state.gold + 500,
    ownedEquipment: newOwned,
    rewardLog: newRewardLog,
    combatLog: [
      ...(state.combatLog || []),
      {
        type: 'floor_advanced',
        fromFloor: state.currentFloor,
        toFloor: nextFloor,
        floorName: nextFloorReq.name,
        goldReward: 500,
        timestamp,
      },
    ],
  };
}

/**
 * Complete a floor (session-based progression). Handles:
 * - Session logging
 * - Floor progress tracking
 * - Floor advancement when sessionsRequired is met
 * - Reward system (guaranteed, bonus, pity timer, anti-farming)
 */
export function completeFloor(state, action) {
  const payload = action.payload || {};
  const newSession = {
    type: payload.type,
    duration: payload.duration,
    notes: payload.notes || '',
    date: payload.date || new Date().toISOString(),
  };
  const newSessions = [...(state.sessions || []), newSession];
  const newProgress = (state.currentFloorProgress || 0) + 1;
  const baseGold = Math.max(5, Math.floor(payload.duration * 10));

  // Reward system
  const { rewardGold, newTodayCount, newLastDate } = processDailyReward(state, baseGold);
  const { bonusItem, newStreak, gotBonus } = rollBonusReward(state, baseGold);

  const timestamp = Date.now();
  const newRewardLog = [];

  // Check for floor advancement
  const floorReq = getFloorRequirements(state.currentFloor || 1);
  const sessionsNeeded = floorReq.sessionsRequired;

  if (newProgress >= sessionsNeeded) {
    const nextFloor = (state.currentFloor || 1) + 1;
    const { newOwned, newRewardLog: milestoneLog } = buildMilestoneReward(nextFloor, 500, bonusItem, timestamp);

    milestoneLog.push({ type: 'guaranteed', gold: rewardGold, date: new Date().toDateString(), timestamp });
    if (gotBonus) milestoneLog.push({ type: 'bonus', ...bonusItem, timestamp });

    return {
      ...state,
      sessions: newSessions,
      currentFloor: nextFloor,
      currentFloorProgress: 0,
      gold: state.gold + 500 + rewardGold,
      ownedEquipment: newOwned,
      rewardStreak: newStreak,
      todayRewardCount: newTodayCount,
      lastRewardDate: newLastDate,
      rewardLog: milestoneLog,
      combatLog: [
        ...(state.combatLog || []),
        {
          type: 'floor_advanced',
          fromFloor: state.currentFloor,
          toFloor: nextFloor,
          floorName: getFloorRequirements(nextFloor).name,
          goldReward: 500,
          timestamp,
        },
      ],
    };
  }

  // No floor advancement — push rewards only
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

// ─── Sub-reducer ───────────────────────────────────────────────────────────────

const progressionCaseMap = {
  GAIN_XP: gainXp,
  LEVEL_UP: levelUp,
  COMPLETE_FLOOR: completeFloor,
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
