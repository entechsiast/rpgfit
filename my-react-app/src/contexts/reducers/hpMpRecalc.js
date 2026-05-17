/**
 * HP/MP recalculation utility
 *
 * Centralizes the logic for computing maxHP, maxMP, and clamping
 * currentHP/currentMP to their respective maximums. Called by all
 * sub-reducers that modify stats, equipment, or class.
 */

import { calculateMaxHp, calculateMaxMp } from '../../data/combat';
import { SLOT_ORDER } from '../../data/equipment';

/**
 * Compute stat bonuses from all currently equipped items.
 * @param {object} equipment - Equipment object with slot keys
 * @returns {{ str: number, dex: number, con: number, int: number, wis: number, cha: number }}
 */
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

/**
 * Recalculate maxHP and maxMP based on current state, and clamp
 * currentHP/currentMP to their new maximums.
 *
 * @param {object} state - The full reducer state (must have class, stats, equipment, level, currentHP, currentMP)
 * @returns {{ maxHP: number, currentHP: number, maxMP: number, currentMP: number }}
 */
export function recalcHPAndMP(state) {
  const { class: cls, stats, equipment, level, currentHP, currentMP } = state;

  if (!cls) {
    return { maxHP: 10, currentHP, maxMP: 5, currentMP };
  }

  const equippedBonuses = getEquippedBonuses(equipment);
  const effectiveCon = stats.con + equippedBonuses.con;
  const effectiveInt = stats.int + equippedBonuses.int;
  const effectiveWis = stats.wis + equippedBonuses.wis;

  const newMaxHP = calculateMaxHp(cls.id, effectiveCon, level);
  const newMaxMP = calculateMaxMp(effectiveInt, effectiveWis, level);

  return {
    maxHP: newMaxHP,
    currentHP: Math.min(currentHP, newMaxHP),
    maxMP: newMaxMP,
    currentMP: Math.min(currentMP, newMaxMP),
  };
}
