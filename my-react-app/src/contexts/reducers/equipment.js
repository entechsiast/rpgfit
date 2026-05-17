/**
 * Equipment sub-reducer
 *
 * Handles all equipment-related actions:
 * - EQUIP_ITEM / UNEQUIP_ITEM — slot management
 * - BUY_ITEM — consumable purchases
 * - ADD_EQUIPMENT_ITEM / REMOVE_EQUIPMENT_ITEM — inventory management
 * - CLEAR_BUFFS — temporary stat buff reset
 */

import { CONSUMABLES } from '../../data/consumables';
import { calculateMaxHp, calculateMaxMp } from '../../data/combat';
import { getEquippedBonuses } from './hpMpRecalc';

// ─── Named case handlers ───────────────────────────────────────────────────────

/**
 * Equip an item to a slot.
 * Removes the item from ownedEquipment and recalculates HP/MP.
 */
export function equipItem(state, action) {
  const { slot, item } = action.payload;
  const newEquipment = { ...state.equipment };
  newEquipment[slot] = item;
  // Remove from ownedEquipment when equipping
  const newOwned = state.ownedEquipment?.filter(id => id !== item.id) || [];
  const equippedBonuses = getEquippedBonuses(newEquipment);
  const effectiveCon = state.stats.con + equippedBonuses.con;
  const effectiveInt = state.stats.int + equippedBonuses.int;
  const effectiveWis = state.stats.wis + equippedBonuses.wis;
  const hpMp = {
    maxHP: calculateMaxHp(state.class?.id, effectiveCon, state.level),
    maxMP: calculateMaxMp(effectiveInt, effectiveWis, state.level),
  };
  return {
    ...state,
    equipment: newEquipment,
    ownedEquipment: newOwned,
    currentHP: Math.min(state.currentHP, hpMp.maxHP),
    currentMP: Math.min(state.currentMP, hpMp.maxMP),
    ...hpMp,
  };
}

/**
 * Unequip an item from a slot.
 * Adds the item back to ownedEquipment (no duplicates) and recalculates HP/MP.
 */
export function unequipItem(state, action) {
  const slot = action.payload;
  const item = state.equipment[slot];
  const newEquipment = { ...state.equipment };
  newEquipment[slot] = null;
  // Add unequipped item to ownedEquipment (no duplicates)
  let newOwned = [...(state.ownedEquipment || [])];
  if (item && !newOwned.includes(item.id)) {
    newOwned.push(item.id);
  }
  const equippedBonuses = getEquippedBonuses(newEquipment);
  const effectiveCon = state.stats.con + equippedBonuses.con;
  const effectiveInt = state.stats.int + equippedBonuses.int;
  const effectiveWis = state.stats.wis + equippedBonuses.wis;
  const hpMp = {
    maxHP: calculateMaxHp(state.class?.id, effectiveCon, state.level),
    maxMP: calculateMaxMp(effectiveInt, effectiveWis, state.level),
  };
  return {
    ...state,
    equipment: newEquipment,
    ownedEquipment: newOwned,
    currentHP: Math.min(state.currentHP, hpMp.maxHP),
    currentMP: Math.min(state.currentMP, hpMp.maxMP),
    ...hpMp,
  };
}

/**
 * Buy a consumable item with gold.
 */
export function buyItem(state, action) {
  const { itemId, quantity = 1 } = action.payload;
  const item = CONSUMABLES.find(c => c.id === itemId);
  if (!item) return state;
  const cost = item.price * quantity;
  if (state.gold < cost) return state;

  const newState = {
    ...state,
    gold: state.gold - cost,
    consumables: { ...state.consumables, [itemId]: (state.consumables?.[itemId] || 0) + quantity },
  };
  return { ...newState, combatLog: [...newState.combatLog, { type: 'purchase', itemId: item.name, cost, timestamp: Date.now() }] };
}

/**
 * Add an equipment item to ownedEquipment (inventory).
 */
export function addEquipmentItem(state, action) {
  const itemId = action.payload;
  if (state.ownedEquipment?.includes(itemId)) return state;
  return { ...state, ownedEquipment: [...(state.ownedEquipment || []), itemId] };
}

/**
 * Remove an equipment item from ownedEquipment (inventory).
 */
export function removeEquipmentItem(state, action) {
  const itemId = action.payload;
  return {
    ...state,
    ownedEquipment: (state.ownedEquipment || []).filter(id => id !== itemId),
  };
}

/**
 * Clear all temporary stat buffs.
 */
export function clearBuffs(state) {
  return { ...state, temporaryBuffs: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 } };
}

// ─── Sub-reducer ───────────────────────────────────────────────────────────────

const equipmentCaseMap = {
  EQUIP_ITEM: equipItem,
  UNEQUIP_ITEM: unequipItem,
  BUY_ITEM: buyItem,
  ADD_EQUIPMENT_ITEM: addEquipmentItem,
  REMOVE_EQUIPMENT_ITEM: removeEquipmentItem,
  CLEAR_BUFFS: clearBuffs,
};

export function equipmentReducer(state, action) {
  const handler = equipmentCaseMap[action.type];
  if (handler) return handler(state, action);
  return state;
}

const equipmentActionTypes = new Set(Object.keys(equipmentCaseMap));

export function isEquipmentAction(type) {
  return equipmentActionTypes.has(type);
}
