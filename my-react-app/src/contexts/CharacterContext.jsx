/* eslint-disable max-lines */
import React, { createContext, useContext, useReducer, useMemo } from 'react';
import { getDungeonById, getDungeonsForLevel } from '../data/dungeons';
import { getMonstersByDungeon, getBossByDungeon } from '../data/monsters';
import { calculateHpGainOnLevelUp, calculateMaxHp, calculateMaxMp, calculateMpGainOnLevelUp } from '../data/combat';
import { getXpToNextLevel, getTotalXpToLevel, getXpProgress, MAX_LEVEL } from '../data/xp';
import { getItemById, getRandomLoot } from '../data/loot';
import { CONSUMABLES } from '../data/consumables';
import { getFloorRequirements, getFloorCelebrationText } from '../data/floors';
import { getAllItems, SLOT_ORDER } from '../data/equipment';
import { BASE_STAT, TOTAL_POINTS } from '../data/stats';
import { characterCoreReducer } from './reducers/characterCore';

const createEmptyEquipment = () => {
  const eq = {};
  SLOT_ORDER.forEach(slot => { eq[slot] = null; });
  return eq;
};

const initialState = {
  name: '',
  class: null,
  race: null,
  stats: { str: BASE_STAT, dex: BASE_STAT, con: BASE_STAT, int: BASE_STAT, wis: BASE_STAT, cha: BASE_STAT },
  pointsRemaining: TOTAL_POINTS,
  appearance: {
    hairColor: 'brown',
    skinTone: 'fair',
    eyeColor: 'brown',
    hairStyle: 'short',
    build: 'average',
  },
  skills: [],
  selectedSkillIds: new Set(),
  equipment: createEmptyEquipment(),
  ownedEquipment: [],
  level: 1,
  xp: 0,
  gold: 0,
  maxHP: 10,
  currentHP: 10,
  maxMP: 5,
  currentMP: 5,
  combatLog: [],
  completedDungeons: [],
  statPointsToSpend: 0,
  consumables: {},
  temporaryBuffs: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
  sessions: [],
  currentFloor: 1,
  currentFloorProgress: 0,
  rewardStreak: 0,
  todayRewardCount: 0,
  lastRewardDate: null,
  rewardLog: [],
  animationEnabled: true,
};

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

function getTemporaryBuffs(state) {
  return state.temporaryBuffs || { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
}

function getAllBonuses(state) {
  const equipped = getEquippedBonuses(state.equipment);
  const buffs = getTemporaryBuffs(state);
  const result = { ...equipped };
  Object.keys(buffs).forEach(stat => {
    result[stat] = (equipped[stat] || 0) + (buffs[stat] || 0);
  });
  return result;
}

/* eslint-disable-next-line complexity */
function reducer(state, action) {
  // Dispatch core cases to sub-reducer
  const coreResult = characterCoreReducer(state, action);
  if (coreResult !== state) return coreResult;

  switch (action.type) {
    case 'EQUIP_ITEM': {
      const { slot, item } = action.payload;
      const newEquipment = { ...state.equipment };
      newEquipment[slot] = item;
      const newOwned = state.ownedEquipment?.filter(id => id !== item.id) || [];
      const hpMp = recalcHPAndMP({ ...state, equipment: newEquipment });
      return {
        ...state,
        equipment: newEquipment,
        ownedEquipment: newOwned,
        ...hpMp,
      };
    }

    case 'UNEQUIP_ITEM': {
      const slot = action.payload;
      const item = state.equipment[slot];
      const newEquipment = { ...state.equipment };
      newEquipment[slot] = null;
      let newOwned = [...(state.ownedEquipment || [])];
      if (item && !newOwned.includes(item.id)) {
        newOwned.push(item.id);
      }
      const hpMp = recalcHPAndMP({ ...state, equipment: newEquipment });
      return {
        ...state,
        equipment: newEquipment,
        ownedEquipment: newOwned,
        ...hpMp,
      };
    }

    case 'GAIN_XP': {
      const newXp = state.xp + action.payload;
      let newState = { ...state, xp: newXp };
      const needed = getXpToNextLevel(newState.level);
      if (newXp >= getTotalXpToLevel(newState.level) + needed && newState.level < MAX_LEVEL) {
        newState = { ...newState, statPointsToSpend: newState.statPointsToSpend + 1 };
      }
      return newState;
    }

    case 'LEVEL_UP': {
      let newState = { ...state, level: state.level + 1, xp: state.xp - getXpToNextLevel(state.level), statPointsToSpend: state.statPointsToSpend + 1 };
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

    case 'ADD_GOLD':
      return { ...state, gold: state.gold + action.payload };

    case 'ADD_CONSUMABLE': {
      const { itemId, quantity = 1 } = action.payload;
      const current = state.consumables?.[itemId] || 0;
      return { ...state, consumables: { ...state.consumables, [itemId]: current + quantity } };
    }

    case 'REMOVE_CONSUMABLE': {
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

    case 'USE_CONSUMABLE': {
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

      // Remove one from inventory
      const current = newState.consumables[itemId] - 1;
      if (current <= 0) {
        const newConsumables = { ...newState.consumables };
        delete newConsumables[itemId];
        newState.consumables = newConsumables;
      } else {
        newState.consumables = { ...newState.consumables, [itemId]: current };
      }

      return { ...newState, combatLog: [...newState.combatLog, { type: 'consumable_used', itemId: consumable.name, timestamp: Date.now() }] };
    }

    case 'BUY_ITEM': {
      const { itemId, quantity = 1 } = action.payload;
      const item = CONSUMABLES.find(c => c.id === itemId);
      if (!item) return state;
      const cost = item.price * quantity;
      if (state.gold < cost) return state;

      let newState = {
        ...state,
        gold: state.gold - cost,
        consumables: { ...state.consumables, [itemId]: (state.consumables?.[itemId] || 0) + quantity },
      };
      return { ...newState, combatLog: [...newState.combatLog, { type: 'purchase', itemId: item.name, cost, timestamp: Date.now() }] };
    }

    case 'CLEAR_BUFFS':
      return { ...state, temporaryBuffs: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 } };

    case 'REST': {
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

    case 'COMBAT_RESULT': {
      const { monstersDefeated, bossDefeated, totalXp, totalGold, lootDrops, hpRemaining, mpRemaining } = action.payload;
      // Add equipment loot to ownedEquipment
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

    case 'CLEAR_COMBAT_LOG':
      return { ...state, combatLog: [] };

    case 'ADD_SESSION': {
      const newSession = {
        type: action.payload.type,
        duration: action.payload.duration,
        notes: action.payload.notes || '',
        date: action.payload.date || new Date().toISOString(),
      };
      const newSessions = [...(state.sessions || []), newSession];
      const newProgress = (state.currentFloorProgress || 0) + 1;

      // --- Reward System ---
      const today = new Date().toDateString();
      let newTodayCount = state.todayRewardCount || 0;
      let newLastDate = state.lastRewardDate;

      // Reset daily counter if new day
      if (newLastDate !== today) {
        newTodayCount = 0;
        newLastDate = today;
      }

      // Calculate base gold reward (scales with duration)
      const baseGold = Math.max(5, Math.floor(action.payload.duration * 10));

      // Check anti-farming: max 2 guaranteed rewards per day
      let rewardGold = 0;
      if (newTodayCount < 2) {
        rewardGold = baseGold;
        newTodayCount++;
      }

      // Pity timer logic
      const streak = state.rewardStreak || 0;
      const bonusChance = Math.min(1, 0.15 + streak * 0.15);
      const gotBonus = Math.random() < bonusChance;

      let bonusItem = null;
      let newStreak = streak + 1;

      if (gotBonus) {
        newStreak = 0;
        // Roll bonus reward type
        const bonusRoll = Math.random();
        if (bonusRoll < 0.4) {
          // Extra gold: 2x-3x the base gold
          bonusItem = { bonusType: 'gold', amount: Math.floor(baseGold * (2 + Math.random())) };
        } else if (bonusRoll < 0.7) {
          // Random common equipment
          const equipItems = getAllItems().filter(i => i.rarity === 'common');
          const picked = equipItems[Math.floor(Math.random() * equipItems.length)];
          if (picked) bonusItem = { bonusType: 'equipment', item: picked.id };
        } else {
          // Random consumable
          const consumable = CONSUMABLES[Math.floor(Math.random() * CONSUMABLES.length)];
          if (consumable) bonusItem = { bonusType: 'consumable', item: consumable.id };
        }
      }
      // --- End Reward System ---

      const timestamp = Date.now();
      const newRewardLog = [...(state.rewardLog || [])];

      // Check for floor advancement
      const floorReq = getFloorRequirements(state.currentFloor || 1);
      const sessionsNeeded = floorReq.sessionsRequired;

      if (newProgress >= sessionsNeeded) {
        const nextFloor = (state.currentFloor || 1) + 1;
        const nextFloorReq = getFloorRequirements(nextFloor);

        // Floor milestone: 500 gold + random Uncommon/Rare equipment
        const rareItems = getAllItems().filter(i => i.rarity === 'uncommon' || i.rarity === 'rare');
        const rareItem = rareItems[Math.floor(Math.random() * rareItems.length)];
        const milestoneGold = 500;

        let finalGold = state.gold + milestoneGold + rewardGold;
        let finalOwned = [...(state.ownedEquipment || [])];

        if (rareItem && rareItem.id && !finalOwned.includes(rareItem.id)) {
          finalOwned.push(rareItem.id);
        }

        // Push milestone reward
        newRewardLog.push({
          type: 'milestone',
          gold: milestoneGold,
          item: rareItem ? rareItem.id : null,
          itemName: rareItem ? rareItem.name : null,
          floor: nextFloor,
          floorName: nextFloorReq.name,
          celebrationText: getFloorCelebrationText(nextFloor),
          timestamp,
        });

        // Push guaranteed reward
        if (rewardGold > 0) {
          newRewardLog.push({
            type: 'guaranteed',
            gold: rewardGold,
            date: today,
            timestamp,
          });
        }

        if (gotBonus) {
          newRewardLog.push({ type: 'bonus', ...bonusItem, timestamp });
        }

        return {
          ...state,
          sessions: newSessions,
          currentFloor: nextFloor,
          currentFloorProgress: 0,
          gold: finalGold,
          ownedEquipment: finalOwned,
          rewardStreak: newStreak,
          todayRewardCount: newTodayCount,
          lastRewardDate: newLastDate,
          rewardLog: newRewardLog,
          combatLog: [
            ...(state.combatLog || []),
            {
              type: 'floor_advanced',
              fromFloor: state.currentFloor,
              toFloor: nextFloor,
              floorName: nextFloorReq.name,
              goldReward: milestoneGold,
              timestamp,
            },
          ],
        };
      }

      // Push guaranteed reward
      const newRewardGold = rewardGold;
      if (newRewardGold > 0) {
        newRewardLog.push({
          type: 'guaranteed',
          gold: newRewardGold,
          date: today,
          timestamp,
        });
      }

      if (gotBonus) {
        newRewardLog.push({ type: 'bonus', ...bonusItem, timestamp });
      }

      return {
        ...state,
        sessions: newSessions,
        currentFloorProgress: newProgress,
        gold: state.gold + newRewardGold,
        rewardStreak: newStreak,
        todayRewardCount: newTodayCount,
        lastRewardDate: newLastDate,
        rewardLog: newRewardLog,
      };
    }

    case 'ADVANCE_FLOOR': {
      const nextFloor = (state.currentFloor || 1) + 1;
      const nextFloorReq = getFloorRequirements(nextFloor);

      // Floor milestone: random Uncommon/Rare equipment item
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

    case 'ADD_EQUIPMENT_ITEM': {
      const itemId = action.payload;
      if (state.ownedEquipment?.includes(itemId)) return state;
      return { ...state, ownedEquipment: [...(state.ownedEquipment || []), itemId] };
    }

    case 'REMOVE_EQUIPMENT_ITEM': {
      const itemId = action.payload;
      return {
        ...state,
        ownedEquipment: (state.ownedEquipment || []).filter(id => id !== itemId),
      };
    }

    case 'SET_CURRENT_DUNGEON':
      return { ...state, currentDungeon: action.payload };

    case 'START_COMBAT': {
      const dungeon = getDungeonById(action.payload);
      if (!dungeon) return state;
      const monsters = getMonstersByDungeon(action.payload);
      const boss = getBossByDungeon(action.payload);
      return { ...state, combatState: { active: true, monsters: monsters.map(m => ({ ...m, currentHp: m.hp })), boss: boss ? { ...boss, currentHp: boss.hp } : null, currentMonsterIndex: 0, monstersDefeated: 0, bossDefeated: false, totalXp: 0, totalGold: 0, lootDrops: [] } };
    }

    case 'FLEE_COMBAT': {
      if (!state.combatState || !state.combatState.active) return state;
      const cs = state.combatState;
      // 50% chance to flee
      const succeeded = Math.random() < 0.5;
      if (succeeded) {
        return {
          ...state,
          currentHP: state.currentHP - Math.floor(state.maxHP * 0.1),
          combatState: { active: false, monsters: [], boss: null, currentMonsterIndex: 0, monstersDefeated: 0, bossDefeated: false, totalXp: 0, totalGold: 0, lootDrops: [] },
          combatLog: [...state.combatLog, { type: 'fled', timestamp: Date.now() }],
        };
      }
      // Failed flee - take penalty damage
      const currentMonster = cs.monsters[cs.currentMonsterIndex] || cs.boss;
      const penaltyDamage = currentMonster ? Math.floor(currentMonster.attack * 1.5) : 10;
      return {
        ...state,
        currentHP: Math.max(0, state.currentHP - penaltyDamage),
        combatLog: [...state.combatLog, { type: 'fled_failed', penaltyDamage, timestamp: Date.now() }],
      };
    }

    case 'RESOLVE_COMBAT': {
      if (!state.combatState || !state.combatState.active) return state;
      const cs = state.combatState;
      if (cs.currentMonsterIndex >= cs.monsters.length && cs.bossDefeated) {
        const dungeon = getDungeonById(state.currentDungeon);
        const completionReward = dungeon.completionReward;
        const bonusGold = Math.floor(Math.random() * (completionReward.gold[1] - completionReward.gold[0])) + completionReward.gold[0];
        const guaranteedItem = getItemById(completionReward.guaranteedItem);
        // Add guaranteed item to ownedEquipment
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
          combatLog: [...state.combatLog, { type: 'dungeon_complete', dungeonId: state.currentDungeon, totalXp: cs.totalXp + completionReward.xp, totalGold: cs.totalGold + bonusGold, guaranteedItem: guaranteedItem, timestamp: Date.now() }],
        };
      }

      let currentMonster = cs.monsters[cs.currentMonsterIndex];
      if (!currentMonster) currentMonster = cs.boss;
      if (!currentMonster) return state;

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

      if (newCurrentHp <= 0) {
        // Check if this was the boss
        const isBoss = cs.currentMonsterIndex >= cs.monsters.length;
        let newCs = { ...cs, monstersDefeated: cs.monstersDefeated + (cs.currentMonsterIndex < cs.monsters.length ? 1 : 0), totalXp: cs.totalXp + Math.floor(currentMonster.xpReward / 2), totalGold: cs.totalGold + Math.floor(Math.random() * (currentMonster.goldReward[1] - currentMonster.goldReward[0]) + currentMonster.goldReward[0]), lootDrops: [...cs.lootDrops, getRandomLoot(currentMonster.lootTable || [])].filter(Boolean), currentMonsterIndex: cs.currentMonsterIndex + 1 };
        if (isBoss) {
          newCs.bossDefeated = true;
        }
        const goldReward = Math.floor(Math.random() * (currentMonster.goldReward[1] - currentMonster.goldReward[0])) + currentMonster.goldReward[0];
        return {
          ...state,
          currentHP: Math.max(0, newPlayerHp),
          combatState: newCs,
          combatLog: [...state.combatLog, { type: 'combat_round', monster: currentMonster.name, playerDamage, monsterDamage, monsterHpRemaining: newCurrentHp, playerHpRemaining: newPlayerHp, goldReward, timestamp: Date.now() }],
        };
      }

      let newCs = { ...cs, currentMonsterIndex: cs.currentMonsterIndex + 1, monstersDefeated: cs.monstersDefeated + 1, totalXp: cs.totalXp + currentMonster.xpReward, totalGold: cs.totalGold + Math.floor(Math.random() * (currentMonster.goldReward[1] - currentMonster.goldReward[0]) + currentMonster.goldReward[0]) };
      const loot = getRandomLoot(currentMonster.lootTable || []);
      if (loot) newCs.lootDrops = [...cs.lootDrops, loot];

      return {
        ...state,
        currentHP: Math.max(0, newPlayerHp),
        combatState: newCs,
        combatLog: [...state.combatLog, { type: 'combat_round', monster: currentMonster.name, playerDamage, monsterDamage, monsterHpRemaining: newCurrentHp, playerHpRemaining: newPlayerHp, loot, timestamp: Date.now() }],
      };
    }

    case 'LOAD_CHARACTER': {
      const loadedEquipment = action.payload.equipment || createEmptyEquipment();
      const hpMp = action.payload.maxHP ? { maxHP: action.payload.maxHP, currentHP: action.payload.currentHP || action.payload.maxHP, maxMP: action.payload.maxMP, currentMP: action.payload.currentMP || action.payload.maxMP } : { maxHP: 10, currentHP: 10, maxMP: 5, currentMP: 5 };
      return {
        ...initialState,
        ...action.payload,
        equipment: loadedEquipment,
        ownedEquipment: action.payload.ownedEquipment || [],
        selectedSkillIds: new Set(action.payload.selectedSkillIds || []),
        ...hpMp,
        completedDungeons: action.payload.completedDungeons || [],
        statPointsToSpend: action.payload.statPointsToSpend || 0,
        consumables: action.payload.consumables || {},
        temporaryBuffs: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
        sessions: action.payload.sessions || [],
        currentFloor: action.payload.currentFloor || 1,
        currentFloorProgress: action.payload.currentFloorProgress || 0,
        rewardStreak: action.payload.rewardStreak || 0,
        todayRewardCount: action.payload.todayRewardCount || 0,
        lastRewardDate: action.payload.lastRewardDate || null,
        rewardLog: action.payload.rewardLog || [],
      };
    }

    case 'RESET':
      return { ...initialState };

    case 'TOGGLE_ANIMATION':
      return { ...state, animationEnabled: action.payload };

    default:
      return state;
  }
}

const CharacterContext = createContext(() => {
  throw new Error('useCharacter must be used within a CharacterProvider');
});
const CharacterDispatchContext = createContext(() => {
  throw new Error('useCharacterDispatch must be used within a CharacterProvider');
});

export function CharacterProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const equippedBonuses = getEquippedBonuses(state.equipment);
  const allBonuses = getAllBonuses(state);

  const value = useMemo(() => ({ ...state, equippedBonuses, allBonuses }), [state, equippedBonuses, allBonuses]);

  return (
    <CharacterContext.Provider value={value}>
      <CharacterDispatchContext.Provider value={dispatch}>
        {children}
      </CharacterDispatchContext.Provider>
    </CharacterContext.Provider>
  );
}

export function useCharacter() {
  return useContext(CharacterContext);
}

export function useCharacterDispatch() {
  return useContext(CharacterDispatchContext);
}

export { getXpProgress, getDungeonsForLevel };

// Exported for testing
export { reducer, initialState, getEquippedBonuses, getAllBonuses, createEmptyEquipment };
export { recalcHPAndMP } from './reducers/hpMpRecalc';
