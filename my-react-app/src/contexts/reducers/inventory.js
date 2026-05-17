/**
 * Inventory sub-reducer
 *
 * Handles all inventory-related state transitions:
 * - ADD_CONSUMABLE / REMOVE_CONSUMABLE — consumable quantity tracking
 * - USE_CONSUMABLE — apply consumable effects and decrement quantity
 * - ADD_GOLD / SUBTRACT_GOLD — gold tracking
 *
 * Extracted from CharacterContext.jsx as part of splitting the monolithic
 * reducer into domain-specific sub-reducers (issue #189).
 */

import { CONSUMABLES } from '../../data/consumables';

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Get temporary buffs from state, returning a sensible default if absent.
 */
function getTemporaryBuffs(state) {
  return state.temporaryBuffs || { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
}

/**
 * Decrement a consumable's quantity. If it reaches zero, remove it entirely.
 * Returns a new state fragment with updated consumables.
 */
function decrementConsumable(state, itemId) {
  const current = state.consumables?.[itemId] || 0;
  if (current <= 1) {
    const newConsumables = { ...state.consumables };
    delete newConsumables[itemId];
    return { ...state, consumables: newConsumables };
  }
  return { ...state, consumables: { ...state.consumables, [itemId]: current - 1 } };
}

// ─── Named case handlers ───────────────────────────────────────────────────────

/**
 * Add a consumable to inventory with optional quantity.
 */
export function addConsumable(state, action) {
  const { itemId, quantity = 1 } = action.payload;
  const current = state.consumables?.[itemId] || 0;
  return { ...state, consumables: { ...state.consumables, [itemId]: current + quantity } };
}

/**
 * Remove a consumable from inventory with optional quantity.
 * Removes the entry entirely when quantity reaches zero.
 */
export function removeConsumable(state, action) {
  const { itemId, quantity = 1 } = action.payload;
  const current = state.consumables?.[itemId] || 0;
  const newCount = current - quantity;
  if (newCount <= 0) {
    const newConsumables = { ...state.consumables };
    delete newConsumables[itemId];
    return { ...state, consumables: newConsumables };
  }
  return { ...state, consumables: { ...state.consumables, [itemId]: newCount } };
}

/**
 * Use a consumable: apply its effect to state, then decrement quantity.
 * Logs the action to the combat log.
 */
export function useConsumable(state, action) {
  const itemId = action.payload;
  const consumable = CONSUMABLES.find(c => c.id === itemId);
  if (!consumable || !state.consumables?.[itemId]) return state;

  const effect = consumable.effect;
  let newState = { ...state };

  if (effect.type === 'heal') {
    newState = {
      ...newState,
      currentHP: Math.min(newState.maxHP, newState.currentHP + effect.value),
    };
  } else if (effect.type === 'mana') {
    newState = {
      ...newState,
      currentMP: Math.min(newState.maxMP, newState.currentMP + effect.value),
    };
  } else if (effect.type === 'full_restore') {
    newState = {
      ...newState,
      currentHP: newState.maxHP,
      currentMP: newState.maxMP,
    };
  } else if (effect.type === 'buff' && effect.stat) {
    const buffs = { ...getTemporaryBuffs(newState) };
    buffs[effect.stat] = (buffs[effect.stat] || 0) + effect.value;
    newState.temporaryBuffs = buffs;
  } else if (effect.type === 'buff_multi') {
    const buffs = { ...getTemporaryBuffs(newState) };
    Object.entries(effect).forEach(([stat, val]) => {
      if (stat !== 'type') {
        buffs[stat] = (buffs[stat] || 0) + val;
      }
    });
    newState.temporaryBuffs = buffs;
  }

  // Decrement quantity
  newState = decrementConsumable(newState, itemId);

  return {
    ...newState,
    combatLog: [
      ...newState.combatLog,
      { type: 'consumable_used', itemId: consumable.name, timestamp: Date.now() },
    ],
  };
}

/**
 * Add gold to the player's total.
 */
export function addGold(state, action) {
  return { ...state, gold: state.gold + action.payload };
}

/**
 * Subtract gold from the player's total. Gold cannot go below zero.
 */
export function subtractGold(state, action) {
  return { ...state, gold: Math.max(0, state.gold - action.payload) };
}

// ─── Sub-reducer ───────────────────────────────────────────────────────────────

const inventoryCaseMap = {
  ADD_CONSUMABLE: addConsumable,
  REMOVE_CONSUMABLE: removeConsumable,
  USE_CONSUMABLE: useConsumable,
  ADD_GOLD: addGold,
  SUBTRACT_GOLD: subtractGold,
};

export function inventoryReducer(state, action) {
  const handler = inventoryCaseMap[action.type];
  if (handler) return handler(state, action);
  return state;
}

export function isInventoryAction(type) {
  return type in inventoryCaseMap;
}
