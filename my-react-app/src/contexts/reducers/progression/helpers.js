/**
 * Shared helpers for progression sub-reducers.
 *
 * Extracted from progression.js (issue #234).
 */

/**
 * Sum stat bonuses from all equipped items.
 */
export function getEquippedBonuses(equipment) {
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
