/**
 * Reward system helpers for progression.
 *
 * Extracted from progression.js (issue #234).
 * Handles:
 * - Daily reward processing with anti-farming cap
 * - Bonus reward rolling with pity timer
 * - Milestone reward construction for floor advancement
 */

import { getAllItems } from '../../../data/equipment';
import { CONSUMABLES } from '../../../data/consumables';

// ─── Daily Reward ──────────────────────────────────────────────────────────────

/**
 * Process the daily reward system: reset counter for new day, calculate
 * base gold, and apply anti-farming cap.
 *
 * Rule: First 2 sessions per day get full gold; subsequent sessions get 0.
 */
export function processDailyReward(state, baseGold) {
  const today = new Date().toDateString();
  const newTodayCount = (state.lastRewardDate !== today) ? 0 : (state.todayRewardCount || 0);
  const newLastDate = state.lastRewardDate !== today ? today : state.lastRewardDate;
  const rewardGold = newTodayCount < 2 ? baseGold : 0;
  const finalTodayCount = rewardGold > 0 ? newTodayCount + 1 : newTodayCount;
  return { rewardGold, newTodayCount: finalTodayCount, newLastDate };
}

// ─── Bonus Reward ──────────────────────────────────────────────────────────────

/**
 * Roll for a bonus reward using the pity timer system.
 *
 * Streak increases bonus chance by 15% per streak (capped at 100%).
 * Streak resets on bonus win.
 * Bonus types: gold (40%), equipment (30%), consumable (30%).
 */
export function rollBonusReward(state, baseGold) {
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

// ─── Milestone Reward ──────────────────────────────────────────────────────────

/**
 * Build a milestone reward log entry for floor advancement.
 * Returns the rare/uncommon item selected and the log entry.
 */
export function buildMilestoneReward(nextFloor, gold, bonusItem, _timestamp) {
  const rareItems = getAllItems().filter(i => i.rarity === 'uncommon' || i.rarity === 'rare');
  const rareItem = rareItems[Math.floor(Math.random() * rareItems.length)];
  const newOwned = [...(bonusItem && bonusItem.bonusType === 'equipment' ? [bonusItem.item] : [])];
  const hasItem = rareItem && rareItem.id && !newOwned.includes(rareItem.id);
  if (hasItem) newOwned.push(rareItem.id);

  return { rareItem, newOwned };
}
