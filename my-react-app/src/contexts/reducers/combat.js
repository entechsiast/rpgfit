/**
 * Combat sub-reducer
 *
 * Handles all combat-related state transitions:
 * - START_COMBAT / FLEE_COMBAT / RESOLVE_COMBAT
 * - COMBAT_RESULT / CLEAR_COMBAT_LOG
 * - REST
 *
 * Extracted from CharacterContext.jsx as part of splitting the monolithic
 * reducer into domain-specific sub-reducers (issue #187).
 */

import { getDungeonById } from '../../data/dungeons';
import { getMonstersByDungeon, getBossByDungeon } from '../../data/monsters';
import { getItemById, getRandomLoot } from '../../data/loot';
import { SLOT_ORDER } from '../../data/equipment';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getEquippedBonuses(equipment) {
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

// ─── Named case handlers ───────────────────────────────────────────────────────

export function startCombat(state, action) {
  const dungeon = getDungeonById(action.payload);
  if (!dungeon) return state;
  const monsters = getMonstersByDungeon(action.payload);
  const boss = getBossByDungeon(action.payload);
  return {
    ...state,
    combatState: {
      active: true,
      monsters: monsters.map(m => ({ ...m, currentHp: m.hp })),
      boss: boss ? { ...boss, currentHp: boss.hp } : null,
      currentMonsterIndex: 0,
      monstersDefeated: 0,
      bossDefeated: false,
      totalXp: 0,
      totalGold: 0,
      lootDrops: [],
    },
  };
}

export function fleeCombat(state) {
  if (!state.combatState || !state.combatState.active) return state;
  const cs = state.combatState;
  const succeeded = Math.random() < 0.5;
  if (succeeded) {
    return {
      ...state,
      currentHP: state.currentHP - Math.floor(state.maxHP * 0.1),
      combatState: { active: false, monsters: [], boss: null, currentMonsterIndex: 0, monstersDefeated: 0, bossDefeated: false, totalXp: 0, totalGold: 0, lootDrops: [] },
      combatLog: [...state.combatLog, { type: 'fled', timestamp: Date.now() }],
    };
  }
  const currentMonster = cs.monsters[cs.currentMonsterIndex] || cs.boss;
  const penaltyDamage = currentMonster ? Math.floor(currentMonster.attack * 1.5) : 10;
  return {
    ...state,
    currentHP: Math.max(0, state.currentHP - penaltyDamage),
    combatLog: [...state.combatLog, { type: 'fled_failed', penaltyDamage, timestamp: Date.now() }],
  };
}

function handleDungeonComplete(state, cs) {
  const dungeon = getDungeonById(state.currentDungeon);
  const completionReward = dungeon.completionReward;
  const bonusGold = Math.floor(Math.random() * (completionReward.gold[1] - completionReward.gold[0])) + completionReward.gold[0];
  const guaranteedItem = getItemById(completionReward.guaranteedItem);
  let newOwned = [...(state.ownedEquipment || [])];
  if (guaranteedItem && guaranteedItem.id && !newOwned.includes(guaranteedItem.id)) {
    newOwned.push(guaranteedItem.id);
  }
  return {
    ...state,
    xp: state.xp + cs.totalXp + completionReward.xp,
    gold: state.gold + cs.totalGold + bonusGold,
    ownedEquipment: newOwned,
    combatState: { active: false, monsters: [], boss: null, currentMonsterIndex: 0, monstersDefeated: 0, bossDefeated: false, totalXp: 0, totalGold: 0, lootDrops: [] },
    completedDungeons: state.completedDungeons.includes(state.currentDungeon) ? state.completedDungeons : [...state.completedDungeons, state.currentDungeon],
    combatLog: [...state.combatLog, { type: 'dungeon_complete', dungeonId: state.currentDungeon, totalXp: cs.totalXp + completionReward.xp, totalGold: cs.totalGold + bonusGold, guaranteedItem, timestamp: Date.now() }],
  };
}

function handleCombatRound(state, cs, currentMonster) {
  const equippedBonuses = getEquippedBonuses(state.equipment);
  const effectiveStr = state.stats.str + equippedBonuses.str;
  const effectiveDex = state.stats.dex + equippedBonuses.dex;
  const effectiveCon = state.stats.con + equippedBonuses.con;
  const effectiveCha = state.stats.cha + equippedBonuses.cha;

  const playerAttack = effectiveStr + Math.floor(effectiveDex / 2) + Math.floor(effectiveCha / 4);
  const playerDefense = effectiveCon + Math.floor(effectiveDex / 3);
  const playerDamage = Math.max(1, playerAttack - currentMonster.defense + Math.floor(Math.random() * 5) - 2);
  const monsterDamage = Math.max(1, currentMonster.attack - playerDefense + Math.floor(Math.random() * 5) - 2);

  let newCurrentHp = currentMonster.currentHp - playerDamage;
  let newPlayerHp = state.currentHP - monsterDamage;

  // Persist the monster's HP before checking death
  currentMonster.currentHp = newCurrentHp;

  if (newCurrentHp <= 0) {
    return handleMonsterDefeated(state, cs, currentMonster, newPlayerHp);
  }

  let newCs = {
    ...cs,
    currentMonsterIndex: cs.currentMonsterIndex + 1,
    monstersDefeated: cs.monstersDefeated + 1,
    totalXp: cs.totalXp + currentMonster.xpReward,
    totalGold: cs.totalGold + Math.floor(Math.random() * (currentMonster.goldReward[1] - currentMonster.goldReward[0]) + currentMonster.goldReward[0]),
  };
  const loot = getRandomLoot(currentMonster.lootTable || []);
  if (loot) newCs.lootDrops = [...cs.lootDrops, loot];

  return {
    ...state,
    currentHP: Math.max(0, newPlayerHp),
    combatState: newCs,
    combatLog: [...state.combatLog, { type: 'combat_round', monster: currentMonster.name, playerDamage, monsterDamage, monsterHpRemaining: newCurrentHp, playerHpRemaining: newPlayerHp, loot, timestamp: Date.now() }],
  };
}

function handleMonsterDefeated(state, cs, currentMonster, newPlayerHp) {
  const isBoss = cs.currentMonsterIndex >= cs.monsters.length;
  let newCs = {
    ...cs,
    monstersDefeated: cs.monstersDefeated + (cs.currentMonsterIndex < cs.monsters.length ? 1 : 0),
    totalXp: cs.totalXp + Math.floor(currentMonster.xpReward / 2),
    totalGold: cs.totalGold + Math.floor(Math.random() * (currentMonster.goldReward[1] - currentMonster.goldReward[0]) + currentMonster.goldReward[0]),
    lootDrops: [...cs.lootDrops, getRandomLoot(currentMonster.lootTable || [])].filter(Boolean),
    currentMonsterIndex: cs.currentMonsterIndex + 1,
  };
  if (isBoss) {
    newCs.bossDefeated = true;
  }
  const goldReward = Math.floor(Math.random() * (currentMonster.goldReward[1] - currentMonster.goldReward[0])) + currentMonster.goldReward[0];
  return {
    ...state,
    currentHP: Math.max(0, newPlayerHp),
    combatState: newCs,
    combatLog: [...state.combatLog, { type: 'combat_round', monster: currentMonster.name, playerDamage: 0, monsterDamage: 0, monsterHpRemaining: 0, playerHpRemaining: newPlayerHp, goldReward, timestamp: Date.now() }],
  };
}

export function resolveCombat(state) {
  if (!state.combatState || !state.combatState.active) return state;
  const cs = state.combatState;

  if (cs.currentMonsterIndex >= cs.monsters.length && cs.bossDefeated) {
    return handleDungeonComplete(state, cs);
  }

  let currentMonster = cs.monsters[cs.currentMonsterIndex];
  if (!currentMonster) currentMonster = cs.boss;
  if (!currentMonster) return state;

  return handleCombatRound(state, cs, currentMonster);
}

export function combatResult(state, action) {
  const { monstersDefeated, bossDefeated, totalXp, totalGold, lootDrops, hpRemaining, mpRemaining } = action.payload;
  let newOwned = [...(state.ownedEquipment || [])];
  if (lootDrops && Array.isArray(lootDrops)) {
    lootDrops.forEach(loot => {
      if (loot && loot.id && loot.slot && !newOwned.includes(loot.id)) {
        newOwned.push(loot.id);
      }
    });
  }
  return {
    ...state,
    currentHP: hpRemaining,
    currentMP: mpRemaining,
    ownedEquipment: newOwned,
    combatLog: [...state.combatLog, { type: 'combat', monstersDefeated, bossDefeated, totalXp, totalGold, lootDrops, timestamp: Date.now() }],
  };
}

export function clearCombatLog(state) {
  return { ...state, combatLog: [] };
}

export function rest(state) {
  const goldCost = Math.max(1, Math.floor(state.level * 5));
  const hpGain = state.maxHP - state.currentHP;
  const mpGain = state.maxMP - state.currentMP;
  return {
    ...state,
    gold: Math.max(0, state.gold - goldCost),
    currentHP: state.maxHP,
    currentMP: state.maxMP,
    combatLog: [...state.combatLog, { type: 'rest', goldCost, hpGain, mpGain, timestamp: Date.now() }],
  };
}

// ─── Sub-reducer ───────────────────────────────────────────────────────────────

const combatCaseMap = {
  START_COMBAT: startCombat,
  FLEE_COMBAT: fleeCombat,
  RESOLVE_COMBAT: resolveCombat,
  COMBAT_RESULT: combatResult,
  CLEAR_COMBAT_LOG: clearCombatLog,
  REST: rest,
};

export function combatReducer(state, action) {
  const handler = combatCaseMap[action.type];
  if (handler) return handler(state, action);
  return state;
}

const combatActionTypes = new Set(Object.keys(combatCaseMap));

export function isCombatAction(type) {
  return combatActionTypes.has(type);
}