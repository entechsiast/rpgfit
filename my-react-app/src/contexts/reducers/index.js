/**
 * Combined reducer for CharacterContext.
 *
 * Dispatches actions to domain-specific sub-reducers based on action type.
 * Each sub-reducer receives the full state and returns the full state,
 * preserving the flat state structure used throughout the app.
 *
 * Sub-reducers:
 * - characterCore: name, class, race, stats, appearance, skills
 * - equipment: equip/unequip, bonuses, inventory
 * - combat: combat state, results, buffs, rest
 * - progression: XP, level up, floors, sessions
 * - inventory: consumables, gold
 * - lifecycle: load, reset, animation toggle, dungeon selection
 *
 * This is part of splitting the monolithic CharacterContext.jsx reducer
 * into domain-specific sub-reducers (issue #181).
 */

import { characterCoreReducer } from './characterCore';
import { combatReducer } from './combat';
import { equipmentReducer } from './equipment';
import { progressionReducer } from './progression';
import { inventoryReducer } from './inventory';
import { lifecycleReducer } from './lifecycle';

/**
 * Combined reducer that dispatches to the appropriate sub-reducer
 * based on action type. Falls through to the next sub-reducer if
 * the current one doesn't handle the action.
 */
export function combinedReducer(state, action) {
  // Lifecycle actions (always checked first — RESET, LOAD_CHARACTER)
  const lifecycleResult = lifecycleReducer(state, action);
  if (lifecycleResult !== state) return lifecycleResult;

  // Character core actions
  const coreResult = characterCoreReducer(state, action);
  if (coreResult !== state) return coreResult;

  // Progression actions
  const progressionResult = progressionReducer(state, action);
  if (progressionResult !== state) return progressionResult;

  // Combat actions
  const combatResult = combatReducer(state, action);
  if (combatResult !== state) return combatResult;

  // Equipment actions
  const equipmentResult = equipmentReducer(state, action);
  if (equipmentResult !== state) return equipmentResult;

  // Inventory actions
  const inventoryResult = inventoryReducer(state, action);
  if (inventoryResult !== state) return inventoryResult;

  // No sub-reducer handled this action
  return state;
}

// Re-export individual sub-reducers for testing
export { characterCoreReducer } from './characterCore';
export { combatReducer } from './combat';
export { equipmentReducer } from './equipment';
export { progressionReducer } from './progression';
export { inventoryReducer } from './inventory';
export { lifecycleReducer } from './lifecycle';

// Re-export type-checking helpers
export { isCombatAction } from './combat';
export { isEquipmentAction } from './equipment';
export { isProgressionAction } from './progression';
export { isInventoryAction } from './inventory';
export { isLifecycleAction } from './lifecycle';
